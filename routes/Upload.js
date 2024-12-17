const router = require("express").Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { ImgUpload } = require("../controllers/UploadController.js");

const { authMiddleware } = require("../middleware/authMiddleware");

//! Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDAPISECRET,
});

//! Multer Cloudinary storage
const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {      
      public_id: (req, file) => `${Date.now()}-${file.originalname.trim().split('.').slice(0, -1).join('.')}`,
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, //? 10MB
});

router.post("/img-upload", authMiddleware, upload.single("image"), ImgUpload);

module.exports = router;

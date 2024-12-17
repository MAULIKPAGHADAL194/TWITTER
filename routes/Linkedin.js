const router = require("express").Router();
const Joi = require("joi");
// const passport = require("passport");
const { linkedinlogin, linkedinGet, linkedinPost } = require("../controllers/LinkedinController.js");
const { authMiddleware, logout } = require("../middleware/authMiddleware.js");
const validateRequest = require("../middleware/validate-request.js");
const multer = require("multer");
// require("../config/passport.js");
const path = require("path");

//! Multer configuration for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the directory where the file should be uploaded
        cb(null, 'uploads/');  // Storing in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Specify the filename (e.g., timestamp + original filename)
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Set up the file upload with multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // Max file size 10MB
    ffileFilter: (req, file, cb) => {
        // Define allowed mime types for images and videos
        const allowedImageTypes = /image\/(jpeg|png|jpg|gif)/;  // Accepts JPEG, PNG, JPG, GIF
        const allowedVideoTypes = /video\/(mp4|avi|mov|mkv)/;  // Accepts MP4, AVI, MOV, MKV
    
        const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) || allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedImageTypes.test(file.mimetype) || allowedVideoTypes.test(file.mimetype);
    
        // Log the file details for debugging
        console.log('File extension:', path.extname(file.originalname));
        console.log('File MIME type:', file.mimetype);
    
        // Check if file is either image or video
        if (extname && mimetype) {
            return cb(null, true);  // Allow the file
        } else {
            return cb(new Error('Only image and video files are allowed.'));
        }
    }    
});

router.get('/', (req, res) => {
    const clientId = '77z2p7tuvpm43v';
    const redirectUri = encodeURIComponent('http://localhost:5000/api/v1/linkedin/callback');
    const state = 'randomstring123'; // Generate securely in production
    const scope = 'openid,profile,email,w_member_social';

    const loginUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    res.redirect(loginUrl);
});

router.get("/callback", linkedinlogin);
router.get("/linkedin-get", authMiddleware, linkedinGet);
router.post("/linkedin-post", authMiddleware, upload.single('file'), PostValidation, linkedinPost);

function PostValidation(req, res, next) {
    const schema = Joi.object({
        text: Joi.string().min(1).max(100).optional(),
    });
    validateRequest(req, res, next, schema);
}

module.exports = router;


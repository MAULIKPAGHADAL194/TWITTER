const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { facebook, updatesocialmedia, allsocialmedia, singlesocialmedia, deletesocialmedia } = require("../controllers/SocialMediaController")
const router = express.Router()

// create a facebook 
router.post("/facebook" , authMiddleware , facebook)

// update socialmedia
router.put("/update/:id" , authMiddleware , updatesocialmedia)

// find all social media
router.get("/allsocialmedia" , allsocialmedia)

// find single social-media
router.get("/single-socialmedia/:id" , singlesocialmedia)

// delete social media
router.delete("/delete/:id" , deletesocialmedia)

module.exports = router
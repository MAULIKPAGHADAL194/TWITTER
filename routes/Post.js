const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { createPost, allPost, singlePost, updatePost, deletePost } = require("../controllers/PostController")
const router = express.Router()


// Post create 
router.post("/create" , authMiddleware , createPost)

// Find all post
router.get("/allpost" , authMiddleware , allPost)

// Single post find
router.get("/single-post/:id" , authMiddleware , singlePost)

// Update post
router.put("/update/:id" , authMiddleware , updatePost)

//Delete post
router.delete("/delete/:id" , authMiddleware , deletePost)


module.exports = router
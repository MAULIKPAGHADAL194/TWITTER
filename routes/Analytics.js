const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { createAnalytics, allAnalytics, singleanalytics, updateAnalytics, deleteAnalytics } = require("../controllers/AnalyticsController")
const router = express.Router()

//Create a Analytics
router.post("/create" , authMiddleware , createAnalytics)
 

//All Analytics
router.get("/allanalytics" , authMiddleware , allAnalytics)

//All Analytics
router.get("/single-analytics/:id" , authMiddleware , singleanalytics)

//Update Analytics
router.put("/update/:id" , authMiddleware , updateAnalytics)

//Delete Analytics
router.delete("/delete/:id" , authMiddleware , deleteAnalytics)

module.exports = router
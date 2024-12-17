const express  = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { calenderCreate, allCalnder, singleCalender, updateCalender, deleteCalender } = require("../controllers/CalenderController")
const router = express.Router()


// create a calender
router.post("/create" , authMiddleware , calenderCreate)

// all calender data
router.get("/alldata" , authMiddleware , allCalnder)

// single calender data
router.get("/single-calender/:id" , authMiddleware , singleCalender)

// upadet calender
router.put("/update/:id" , authMiddleware , updateCalender)

// delete Calender 
router.delete("/delete/:id" , authMiddleware , deleteCalender)

module.exports = router
const Calendar = require("../models/Calendar")

const calenderCreate = async (req , res) =>{
    try{
        let {platformName , socialMediaId } = req.body

        const detail = await Calendar.create({
            platformName,
            platformUserName : req.user._id,
            socialMediaId,
            userId : req.user._id
        })
        console.log(detail);
        
        await detail.save()
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const allCalnder = async (req , res) =>{
    try{
        const alldata = await Calendar.find()
        res.status(200).json({success : true , data : alldata}) 
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const singleCalender = async (req , res) =>{
    try{    
        let {id} = req.params

        const detail = await Calendar.findById(id)
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const updateCalender = async (req , res) =>{
    try{
        let {id} = req.params
        // let {platformName} = req.body

        const detail = await Calendar.findByIdAndUpdate(id ,req.body , {new : true})
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const deleteCalender = async (req , res) =>{
    try{    
        let {id} = req.params
        const detail = await Calendar.findByIdAndDelete(id)
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

module.exports = {calenderCreate , allCalnder , singleCalender , updateCalender , deleteCalender}
const { date } = require("joi")
const Analytics = require("../models/Analytics")

const createAnalytics = async (req , res) =>{
    try{
        let {
            postId,
            like,
            comment,
            share
        } = req.body

        const detail = await Analytics.create({
            postId,
            like,
            comment,
            share
        })
        await detail.save()
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}


const allAnalytics = async (req , res) =>{
    try{
        const detail = await Analytics.find()
        res.status(200).json({success : true , date : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const singleanalytics = async (req , res)=>{
    try{
        let {id} = req.params

        const detail = await Analytics.findById(id)
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error,message})
    }
}

const updateAnalytics = async (req , res) =>{
    try{
        let {id} = req.params

        const detail = await Analytics.findByIdAndUpdate(id , req.body , {new : true})
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const deleteAnalytics = async (req , res) =>{
    try{
        let {id} = req.params

        const detail = await Analytics.findByIdAndDelete(id , {new : true})
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

module.exports = {createAnalytics , allAnalytics , singleanalytics , updateAnalytics , deleteAnalytics}
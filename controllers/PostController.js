const Post = require("../models/Post")

const createPost = async (req , res) => {
    try{
        let {
            calendarId,
            platformId,
            content,
            scheduledTime,
            status
        } = req.body
        const detail = await Post.create({
            calendarId,
            userId : req.user._id,
            platformId,
            content,
            scheduledTime,
            status
        })
        await detail.save()
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const allPost = async (req , res) =>{
    try{
        const detail = await Post.find()
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const singlePost = async (req , res) =>{
    try{
        let {id} = req.params
        const detail = await Post.findById(id)
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const updatePost = async (req , res) =>{
    try{
        let {id} = req.params

        const detail = await Post.findByIdAndUpdate(id , req.body , {new : true})
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const deletePost = async (req , res) =>{
    try{
        let {id} = req.params
        const detail = await Post.findByIdAndDelete(id)
        res.status(200).json({success : true , data : detail})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}
module.exports = {createPost , allPost ,singlePost , updatePost , deletePost}
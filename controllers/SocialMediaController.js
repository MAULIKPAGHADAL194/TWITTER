const { date } = require("joi");
const socialmedia = require("../models/SocialMedia");
const user = require("../models/User");


const facebook = async (req, res) => {
    try {
        let {
            accessToken,
            socialMediaID,
            platformName,
            platformUserName
        } = req.body

        if (!accessToken || !socialMediaID || !platformName || !platformUserName) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const facebookcreate = await socialmedia.create({
            accessToken,
            socialMediaID,
            platformName,
            platformUserName,
            userId: req.user._id
        })

        await facebookcreate.save()
        res.status(200).json({ success : true ,  data: facebookcreate })
    } catch (error) {
        res.status(500).json({success : false , error : error.message})
    }
}

const allsocialmedia = async (req, res )=>{
    try{
        let datas = await socialmedia.find()
        res.status(200).json({success : true , data : datas})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const singlesocialmedia = async (req, res )=>{
    try{
        let {id} = req.params
        console.log(id)
        const single = await socialmedia.findById(id)
        res.status(200).json({success : true , data : single})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}

const updatesocialmedia = async (req , res) => {
   try{
    let {id} = req.params
    let {
        accessToken,
        socialMediaID,
        platformName,
        platformUserName,
    } = req.body

    const updated = await socialmedia.findByIdAndUpdate(id,
        { accessToken, socialMediaID, platformName, platformUserName  } ,
         {new : true})
    await updated.save()
    res.status(200).json({ success : true , data : updated.toObject() })
   }catch(error){
    res.status(500).json({success : false , error : error.message})
   }
}

const deletesocialmedia = async (req , res) =>{
    try{
        let {id} = req.params
        console.log(id)
        const datas = await socialmedia.findByIdAndDelete(id)
        res.status(200).json({success : true , data : datas})
    }catch(error){
        res.status(500).json({success : false , error : error.message})
    }
}



module.exports = {facebook , updatesocialmedia , allsocialmedia , singlesocialmedia , deletesocialmedia}
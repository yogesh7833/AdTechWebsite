const jwt=require("jsonwebtoken")
require('dotenv').config()
const User=require('../models/User')

//auth 
exports.auth=async (req,res,next)=>{
    try {
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        //if token is missing 
        if(!token){
            return res.status(401).json({
                success:false,
                message:"token is missing"
            })
        }
        //verify the token 
        try {
            const decode=await jwt.verify(token,process.env.JWT_SECRET)
            console.log(decode);
            req.user=decode;
        } catch (error) {
            //verification isssue
            return re.status(401).json({
                success:false,
                message:'Token is invalid'
            })
        }
        next();
    } catch (error) {
        return res.status.json({
            success:false,
            message:'something went wrong while validating the token'
        })
    }
}

///isStudent
exports.isStudent=async (req,res,next)=>{
    try {
        if(req.user.accountType!=='Student'){
            return res.status(401).json({
                success:false,
                message:'This is a protects route for students only'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
           success:false,
           message:"User role cannot be verified, Please try again"
        })
    }
}

//instructor 
exports.isInstructor=async (req,res,next)=>{
    try {
        if(req.user.accountType!=='Instructor'){
            return res.status(401).json({
                success:false,
                message:'This is a protects route for students only'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
           success:false,
           message:"User role cannot be verified, Please try again"
        })
    }
}

//isAdmin 
exports.isAdmin=async (req,res,next)=>{
    try {
        if(req.user.accountType!=='Admin'){
            return res.status(401).json({
                success:false,
                message:'This is a protects route for students only'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
           success:false,
           message:"User role cannot be verified, Please try again"
        })
    }
}
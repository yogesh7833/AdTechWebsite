const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator")
const bcrypt=require('bcrypt');
const Profile = require("../models/Profile");
const jwt=require('jsonwebtoken');
const { SchemaTypeOptions } = require("mongoose");
require('dotenv').config();
//send OTP
exports.sendOTP=async (req,res)=>{
    try {
        // fetch email from request body 
    const {email}=req.body;

    //check if user is present or not 
    const checkUserPresent=await User.findOne({email});

    //if user is already is present or not 
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User is already exist",
        })
    }
    //generate otp 
    var otp= otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    })
    console.log("OTP generator: ",otp)

    const result=await OTP.findOne({otp:otp})

    while(result){
        otp=otpGenerator(6,{
            upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        })
        result=await OTP.findOne({otp:otp});
    }
    const otpPayload={email,otp};
    //create an entry in db for OTP
    const otpBody=await OTP.create(otpPayload);
    console.log(otpBody)

    //return response successfull 
    res.status(200).json({
        success:true,
        message:"OTP sent successfully",
        otp,
    })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}
//Signup 

exports.signUp=async (req,res)=>{
    try {
        //data fetch from request ki body 
    const {firstName,lastName,email,password,confirmPassowrd,accountType,contactNumber,otp}=req.body;

    // validate the information 
    if(!firstName || !lastName || ! email || !password || !confirmPassowrd || !accountType || !contactNumber || !otp ){
        return res.status(403).json({
            success:false,
            message:"All fields are required"
        })
    }
    //password match 
    if(password!==confirmPassowrd){
        return res.status(403).json({
            success:false,
            message:"Password and confirm password not match, please try again"
        })
    }
    //check user is already is exist or not
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status.json({
            success:false,
            message:"User is already present"
        })
    }
    // find most recent OTP stored for the user
     const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
     console.log(recentOtp);
    //validate otp 
    if(recentOtp.length==0){
        //OTP not found 
        return res.status(400).json({
            success:false,
            message:'OTP not found'
        })
    }else if(otp!==recentOtp){
        //INvalid OTP
        return res.status(400).json({
            success:false,
            message:"OTP not matched"
        })
    }

    //hash the password 
    const hashedPassowrd=await bcrypt.hash(password,10)

    //create entry in db 

    const profileDetails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    })
    const user=await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password:hashedPassowrd,
      accountType,
      additionalDetails:profileDetails._id,
      image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    // return res 
    return res.status(200).json({
        success:true,
        message:"User is registred successfully",
        user,
    })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"User can't be registered. Please try again"
        })
    }
}


//Login
exports.login=async (req,res)=>{
    try {
        //get data from req body 
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again"
            })
        }
        // /check user is exist or not
        const user=await User.findOne({email}).populate("additonaldetails")
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User does't exist, please signup"
            })
        }
          
        //password matching
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token=jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h"
            })
            user.token=token;
            user.password=undefined
            
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Login in successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect'
            })
        }
        //genrate jwt token
        //create cookie and send response 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again'
        })
    }
}


//change password 
exports.changePassword=async (req,res)=>{
    //get data from req body 
    //get old password ,new passowrd , confirm password
    //validaton 

    //ipdate pwd in DB
    //return response
}
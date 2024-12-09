
const bcrypt=require('bcrypt')
const User=require('../models/User')
const mailSender=require('../utils/mailSender')

//reset password token
exports.resetPasswordToken=async(req,res)=>{
    try {
        //get email from req ki body 
    const email=req.body.email
    //check user for this email , email validation 
    const user=await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:'Your email is not registred with us'
        })
    }
    //generate token
    const token=crypto.randomUUID()
    //update user by adding token and expiration time 
    const updatedDetails=await User.findOneAndUpdate({
        email:email},{token:token, resetPasswordExpires:Date.now()+5*60*1000,},{new:true })
    // create URL
    const url=`http://localhost:3000/update-password/${token}`
    //send mail by containing the url 
    await mailSender(email,"Password Reset Link",`Password Reset link :${url} `)
    // return respeosne 
    return res.json({
        success:true,
        message:'Email sent successfully, please check email and change password'
    })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset password mail'
        })
    }
}

exports.resetPassword=async (req,res)=>{
    try {
        //data fetch 
    const {password,confirmPassword,token}=req.body;
    //validation 
    if(password!==confirmPassword){
        return res.json({
            success:false,
            message:'Passowrd not matching',
        })
    }
    //get get user details from db using token 
    const userDetails=await User.findOne({token:token})
    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid',
        })
    }
    //toke time checking
    if(userDetails.resetPasswordExpires<Date.now()){
         return res.json({
            success:false,
            message:'Token is expired, please generate your token '
         })
    }
    //hashPassword
    const hashPassword=await bcrypt.hash(password,10);

    //password update 
    await User.findOneAndUpdate({token:token},{password:hashPassword},{new:true})

    return res.status(200).json({
        success:true,
        message:'Password reset successfull'
    })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'error while changing password'
        })
    }
}
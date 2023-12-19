import {asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '..//models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js' 
import jwt from "jsonwebtoken"
const generateAccessTokenandRefreshTocken = async(userId)=>{
  try {
    const user = await User.findById(userId)
    if (!user){
      throw new ApiError(404, 'user not found');
    }
     const accessToken = user.generateAccessToken()
    
     const refreshToken = user.generateRefreshToken()
     

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave : false })

     return {accessToken , refreshToken}

  } catch (error) {
    throw new ApiError(500,"Somthing went wrong while generating refresh and access token  ")
  }
}
// STEP - 01

// get user details from frontend
// validation - not empty
// check if user already exist : usename , email
//check for images , check for avatar
// upload them to cloudinary , avatar
//create user object - create entry in db
// remove password and refresh token feild from response 
// check for user creation 
// return response 



const registerUser =  asyncHandler(async(req,res)=> {
  // get user details from frontend
    const {fullName, email , username , password } =  req.body
 // validation - not empty
    if ([fullName ,email, username , password].some((feild)=>feild?.trim() === "") ) {
      throw new ApiError(400, "fullname is required")
    }
     // check if user already exist : usename , email
    const exitedUser = await User.findOne({ 
    $or : [ { username }, { email } ]
    })

    if (exitedUser) {
    throw new ApiError(409, "User with email or username already exists")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is required")
    }

    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
    }
  

    const user = await User.create({
      fullName,
      avatar : avatar.url,
      coverImage : coverImage?.url  || "",
      email,
      password,
      username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    if(!createdUser){
      throw new ApiError(500,"Somthing went wrong while registering the user")
    }

    return res.status(201).json(
      new ApiResponse(200 , createdUser , "user registered successfully")
    )

  })



  // steps ->{
  // req-> data 
  // username or email
  // find the user 
  // password check 
  // accessToken and refreshToken
  // send cookie}

const loginUser = asyncHandler(async(req,res)=>{
  
  const {username, email , password} = req.body
  if (!username && !email) {  
    throw new ApiError(404 , "User Must have username or email")
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })
  if (!user) {
    throw new ApiError(404 , "User does not Exist ")
  }

  const isCorrect = await user.isPasswordCorrect(password)

  if (!isCorrect) {
    throw new ApiError(401, "Invalid user credencials ")
  }
  const {refreshToken , accessToken} = generateAccessTokenandRefreshTocken(user._id)

  const loggedInUser = await  User.findById(user._id).select("-refeshToken -password")

  const options = {
    httpOnly : true,
    secure : true ,

  }

  res
  .status(200)
  .cookie("accessToken" , accessToken , options)
  .cookie('refreshToken',refreshToken,options)
  .json(
    new ApiResponse(200,{
      user : loggedInUser,
      accessToken ,
      refreshToken
    },
    "User logged in successfully"
    )
  )
})
const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id ,
    {
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )
  const options = {
    httpOnly : true,
    secure : true ,

  }
  return res
  .status(200)
  .clearCookie("accessToken" , options)
  .clearCookie("refreshToken" , options)
  .json(new ApiError(200 , {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
 try {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (incomingRefreshToken) {
   throw new ApiError(401, "unauthorized request ")
  }
 
 const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
   const user = await User.findById(decodedToken?._id)
 
   if (!user) {
     throw new ApiError(401 , "invalid refresh token")
   }
 
   if (incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401 , " refresh toke is expired or used ")
   }
   const options = {
     httpOnly : true ,
     secure : true
   }
   const {accessToken ,  newrefreshToken} = await generateAccessTokenandRefreshTocken(user._id)
 
   return res
   .status(200)
   .cookie("accessToken" , accessToken , options)
   .cookie("refreshToken" ,newrefreshToken ,options)
   .json(
     new ApiResponse(
       200 ,
       {accessToken , newrefreshToken}
       , "accessToken refreshed successfully"
     )
   )
 } catch (error) {
  throw new ApiError(401 , error?.message || "invalid refresh token ")
 }
})



export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken

}


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) => 
    {
        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            console.log("accessToken: ", accessToken)
            const refreshToken = user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })
            
            return {accessToken, refreshToken}

        } catch(error) {
            throw new ApiError(500, "Something went wrong while generating access and refresh token")
        }
    } 

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar file");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //all selected by default except password and refreshToken
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong, while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send Cookie

    const {email, username, password} = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {  //only modifide from server
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

    const logoutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
                
            {
                new: true
            }
        )

         const options = {  
            httpOnly: true,
            secure: true
        }

        res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))

})


const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken //(for mobiles also)

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodeToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodeToken?._id)

        if(!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(410, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res.
        status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refresed"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.
    isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json( new ApiResponse(
     200,
     req.user,
     "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated Successfully"))
})
//WILL DO-delete old Image Controller
const updateUserAvatar = asyncHandler(async(req, res) => { 
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true //will show updated details
        }
    ).select("-password")

        return res
        .status(200)
        .json(
        new ApiResponse(200, user, "avatar image updated successfully")
    )   

}) 

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverLocalPath = req.file?.path

    if (!coverLocalPath) {
        throw new ApiError(400,"cover image file is missing")
    }
    
    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true //will show updated details
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "covre image updated successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const { usrename } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    const channel = User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" 
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers" //now its a feild
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user_id, "$subscribers.subscriber"] },
                            then: true, 
                            else: false
                    }
                }
            }
            },
            {
                $project: { //to give selected fields
                    fullname: 1,
                    usrename: 1,
                    subscribersCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
    ])
    console.log(channel)
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) //to change the string to object id of mongodb via mongoose
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        owner: {
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        200,
        user[0].watchHistory,
        "watchHistory fetched successfully"
    )
})


export { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile,
         getWatchHistory

 };






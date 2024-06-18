// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/apiErrors.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js"
// import { ApiResponse } from "../utils/ApiResponse.js";

// const registerUser = asyncHandler( async (req, res) => {
//     //get user details from frontend
//     //validation - not empty
//     //check if user already exists: username, email
//     //upload them to cloudinary, avatar
//     //create user object - create entry in db
//     //remove password and refresh token feild from response
//     //check for user Creation 
//     //return response
//     //this register logic
//     console.log("working")

//     const {fullname, email, username, password } = req.body
//     console.log(email);
//     console.log(req.body)     //go now postman ok

//     if (
//         [fullname, email, username, password].some((field) => 
//         field?.trim() === "")
//     ) {
//         throw new ApiError(400, "All fields are required")
//     }
//     // check for unique user
//     const existedUser = await User.findOne({
//         $or: [{ username }, { email }]
//     })
//     if (existedUser) {
//         throw new ApiError(409, "User with email or username already exists")
//     }

//     const avtarLocalPath = req.files?.avatar[0]?.path;     
//     const coverImageLocalPath = req.files?.coverImage[0]?.path;

//     if(!avtarLocalPath) {
//         throw new ApiError(404, "Avatar file is required")
//     }

//     const avatar = await uploadOnCloudinary(avtarLocalPath)    //wait i m checking on myGPT.ok
//     if (!avatar) {
//         throw new ApiError(400, "Avtar file is required")
//     }
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)


//     const user = await User.create({
//         fullname,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     })

//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken" //all selected by default except password and refreshToken
//     )

//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong, while registering the user")
//     }   

//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User registered Successfully")
//     )




//  })





// export { registerUser }



//TA

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => 
    {
        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateAccessToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforesave: false })
            
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
        coverImageLocalPath = req.files.coverImage[0].patht
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
    if (!username || !email) {
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
        .clearCookie("accesstoken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiError(200, {}, "User loggged Out"))

})



export { registerUser,
         loginUser,
         logoutUser

 };




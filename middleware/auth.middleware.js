import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";

export const varifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accesstoken || req.headers.authorization?.replace("Bearer ","")//for mobiles

        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodeToken = jwt.verify(token, process.
            env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodeToken?._id).
        select("-password -refreshToken")

        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user //gived acces to logout method of user
        next()
    } catch (error) {
        console.log(error)
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})



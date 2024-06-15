import { v2 as cloudinary } from "cloudinary"
import exp from "constants"
import fs from "fs" //file system 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload
        (localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded succcessfull
        console.log("file is uploaded on cloudinary", res.url);
        return response;
    } catch (error) {
        fs.unlink(localFilePath) //remove the locally saved temproray file from our server 
        //as the upload operation got failed
    }
}

export {uploadOnCloudinary}
// import { v2 as cloudinary } from "cloudinary"
// import exp from "constants"
// import fs from "fs" //file system 
// import dotenv from 'dotenv';

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if(!localFilePath) return null
//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload
//         (localFilePath, {
//             resource_type: "auto"
//         })
//         //file has been uploaded succcessfull
//         console.log("file is uploaded on cloudinary", res.url);
//         return response;
//     } catch (error) {
//         fs.unlink(localFilePath) //remove the locally saved temproray file from our server 
//         //as the upload operation got failed
//     }
// }

// export {uploadOnCloudinary}


// TA

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system
import dotenv from 'dotenv';
dotenv.config(); 
        
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
 

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // File has been uploaded successfully
        console.log("File is uploaded on Cloudinary", response.url);
        // Remove the local file
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error('Error deleting local file:', err);
            } else {
                console.log('Local file deleted successfully');
            }
        });
        return response;
    } catch (error) {
        console.error('Error during upload to Cloudinary:', error);
        // Remove the local file in case of an error
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error('Error deleting local file:', err);
            } else {
                console.log('Local file deleted successfully');
            }
        });
        throw error; // Rethrow the error to handle it in the calling function
    }
};

export { uploadOnCloudinary };

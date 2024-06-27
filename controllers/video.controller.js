import mongoose, {isValidObjectId} from "mongoose";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/apiErrors";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { asyncHandler } from "../utils/asyncHandler";

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video Not Found")
    }

    res.status(200).json(video);

});

const updateVideo = asyncHandler(async (req, res) => {
    const videoId = req.params
    const {newTitle, newDescription, newThumbnail} = req.body
   
    //check if videoId is valid ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid VideoId Format")
    }

    //find video by its id
    let video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video Not Found")
    }

    //update the video properties
    if (newTitle) {
        video.title = newTitle
    }
    if (newDescription) {
        video.description = newDescription
    }
    if (newThumbnail) {
        const uploadThumbnail = await uploadOnCloudinary(newThumbnail); //
        video.thumbnail = uploadThumbnail.url
    }

    //save the updated video details
    video = await Video.save();

    res.status(200).json({
        success: true,
        message: "Video details updated Successfully",
        video,
    })

   
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (video) {
        await video.remove()
        res.status(200)
            .json( {message: "video deleted successfully " })
    } else {
        res.status(404)
            .json({ massage: "video not found " })
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    const videoFile = req.file.path
    const thumbnailFile = req.files.thumbnail[0].path;
    try {
        //upload video to cloudinary
        const uploadResponse = await uploadOnCloudinary(videoFile)   

          //create video record in the database
    const video = new Video({
        videoFile,
        title,
        description,
        thumbnail: thumbnailFile,
        owner: req.user._id
    })
    const createtedVideo = await video.save();
    res.status(201)
    .json(createtedVideo)
    } catch (error) {
        res.status(500)
        .json({message: "Video Uload Failed", error})
    }
})

export {getVideoById,
        updateVideo,
        deleteVideo,
        publishAVideo
}
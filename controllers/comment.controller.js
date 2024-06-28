import mongoose from "mongoose"
import { comment } from "../models/comment.model.js"
import { ApiError } from "../utils/apiErrors"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { userId, content } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!content || !userId) {
        throw new ApiError(400, "conten and userId are required")
    }
    const comment = new Comment({
        video: videoId,
        user: userId,
        content: content
    })

    await comment.save()

    res.status(201)
    json(new ApiResponse({
        message: "comment added Successfully",
        data: comment,
    }))
})
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "comment not found")
    }

    comment.content = content

    await comment.save()

    res.status(200).
    json(new ApiResponse({
        message: "Comment Upadated Succesfully",
        data: comment
    }))

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const comment = await Comment.findById(commentId)

    if (comment) {
        await comment.remove()
        res.status(200).
        json(new ApiResponse({
            message: "Comment deleted Successfully",
        }))
    } else {
        throw new ApiError(404, "comment not found")
    }
})



export { addComment,
         updateComment,
         deleteComment
 };
import { Router } from "express";
import {
    addComment,
    deleteComment,
    updateComment
}
from "../controllers/comment.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.use(verifyJWT) //apply verifyJWt middleware to all rouets in this file

router.route("/:videoId").post(addComment)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default {router}
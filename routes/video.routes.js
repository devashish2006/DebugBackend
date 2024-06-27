import { Router } from "express";
import {
    getVideoById,
    publishAVideo,
    updateVideo,
}
from "../controllers/video.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT) //Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
           
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail", updateVideo))


    export default router
    
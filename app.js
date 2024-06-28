import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from 'dotenv';
dotenv.config();

 
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))// Parse JSON bodies
app.use(express.urlencoded({extended: true, limit: "16kb"}))// Parse URL-encoded bodies
app.use(express.static("public"))// Serve static file
app.use(cookieParser())// Parse cookies


//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from "./routes/comment.routes.js";

//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/comments",commentRouter)


//https://localhost:8080/api/v1/users/register


export { app }  



import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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

//routes declaration
app.use("/api/v1/users",userRouter)

//https://localhost:8080/api/v1/users/register

app.listen(8080, () => {
    console.log("listening to port 8080.")
})
export { app }

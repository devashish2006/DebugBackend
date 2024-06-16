
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import express from "express";
import {app} from './app.js'

dotenv.config()
// const app = express();
const port = process.env.PORT;
const dbUrl = process.env.MONGODB_URI;

console.log(`server is listining to the port ${port}`)
console.log(dbUrl)

connectDB().then(()=>{
    console.log("connected")
}).catch(err => {
    console.log(err)
})

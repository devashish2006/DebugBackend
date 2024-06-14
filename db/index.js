import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = process.env.MONGODB_URI
        console.log(connectionInstance)
        await mongoose.connect
        (connectionInstance)
        console.log(`\n MONGODB connected !! DB HOST:`)
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

export default connectDB

// please control i m seeing the changesthat you are doing...?

import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config()
const app = express();
const port = process.env.PORT;
const dbUrl = process.env.MONGODB_URI;

console.log(port)
console.log(dbUrl)

connectDB().then(()=>{
    console.log("connected")
}).catch(err => {
    console.log(err)
})

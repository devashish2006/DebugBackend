import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ 
    storage,
   })

   //is this a different project ? yes its different from the lectures its my own personal one, what is that topic? whole backend node and express . the error is in your multers callback function which is get by multer....ok so please resolve it . what you exactly want to do by that request tell me that first ..ok..i want to regidter the user you can see my bussiness logic of the register user
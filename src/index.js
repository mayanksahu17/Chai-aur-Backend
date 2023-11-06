
import dotenv from 'dotenv'


import connectdb from "./db/index.js";
dotenv.config({path: './env'})

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        app.on("error",(error)=>{console.log("Error : ",error); throw error ;} )
    })
})
.catch((error)=>{
console.log("MONGO db connection failed: " + error);
})































/*
(async()=>{
    try {
      await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)


        app.on("error",(error)=>{console.log("Error : ",error); throw error ;} )

        app.listen(process.env.PORT,()=>{console.log(`app listening on ${process.env.PORT}`)})



    } catch (error) {
        console.log("ERROR : ", error.message);
        throw error ;
    }
})()
*/
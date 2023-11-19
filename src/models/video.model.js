import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
    {
        videoFile : {
            type : String, // it will come from cloudinary url 
            required : true ,
          
        } ,
        thumnail : {
            type : String,
            required : true ,
            
        } ,
        owner :  
           { 
            type : Schema.Types.ObjectId,
            ref : "User"
        }
        ,
        description : {
            type : Number,
            required : true ,
            
        } ,
        duration : {
            type : Number,
            required : true ,
            
        } ,
        views : {
            type : Number,
            default : 0 ,       
        } ,
        ispublished : {
            type : Boolean,
            required : true ,
            
        } ,
        title : {
            type : String,
            required : true ,
            
        } ,


    },
    {
            timestamps : true 
    }
    )

    videoSchema.plugin(mongooseAggregatePaginate)
    export const Video = mongoose.model("Video",videoSchema)

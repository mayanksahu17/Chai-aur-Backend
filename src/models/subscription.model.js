import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId, // one who is subscibong
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId, // one to whom 'subscriber' subscibong
        ref : "User"
    }
} , {timestamps : true})

   

const Subscription = mongoose.model("Subscription",subscriptionSchema)
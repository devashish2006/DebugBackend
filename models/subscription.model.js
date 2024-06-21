import mongoose, {Schema, schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //subscriber- who is subscribing to the channel
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //to whom "Subscriber" is Subscribing
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
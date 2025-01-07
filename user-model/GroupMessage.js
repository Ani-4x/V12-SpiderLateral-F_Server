import mongoose from "mongoose";

const GroupMessageSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    }, 
    senderId: {
        type: String,
        required: true
    }, 
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);

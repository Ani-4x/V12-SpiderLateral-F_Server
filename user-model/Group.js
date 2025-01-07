import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [
        {
            type: String
        }
    ], 
    admin: {
        type: String,
        required: true
    }, 
    showHistoryToNewMembers: {
        type: Boolean,
        default: true
    },
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;

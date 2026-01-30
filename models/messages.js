const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderName: {
        type: String,
        required: true,
    },
    senderEmail: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isReplayed:{
        type: Boolean,
        default: false
    },
    reply: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Message", messageSchema);

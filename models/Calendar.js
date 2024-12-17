const { string } = require("joi");
const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    platformName: {
        type: String,
        required: true
    },
    socialMediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "socialmedia",
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    platformUserName: {
        type: String,
    }
},
    { timestamps: true }
);

const Calendar = mongoose.model("calendar", calendarSchema);

module.exports = Calendar;

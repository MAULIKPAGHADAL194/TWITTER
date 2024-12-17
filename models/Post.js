const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        calendarId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Calendar",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",  // Reference to the User model
            required: true
        },
        socialMediaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "socialMedia",
            required: true
        },
        postId: {
            type: String,
            required: true
        },
        content: {
            image: {
                type: String
            },
            title: {
                type: String
            },
            description: {
                type: String
            }
        },
        scheduledTime: {
            type: Date
        },
        status: {
            type: String,
            enum: ["posted", "pending", "draft"],
            default: "pending"
        },
        createdBy: {
            type: String,
            required: true,
        },
        lastModifiedBy: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

const post = mongoose.model("post", postSchema);

module.exports = post;

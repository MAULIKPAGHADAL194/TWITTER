const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    like: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    share: {
        type: String,
        required: true
    },
},
    { timestamps: true }
);

const Analytics = mongoose.model("analytics", analyticsSchema);

module.exports = Analytics;

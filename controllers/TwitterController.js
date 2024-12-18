const SocialMedia = require("../models/SocialMedia");
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs");
const path = require("path");
const { post } = require("../routes/Twitter");

// const twitterClient = new TwitterApi({
//     appKey: process.env.TWITTERAPIKEY,
//     appSecret: process.env.TWITTERAPISECRET,
//     // accessToken: process.env.TWITTERACCESSTOKEN,
//     // accessSecret: process.env.TWITTERACCESSTOKENSECRET,
//     // bearerToken: 'AAAAAAAAAAAAAAAAAAAAAMBpxgEAAAAA6NlUrfwK9x6OYjEEMxP0uH7f0NE%3DOlclbsXQPLTbQ1WNf4KcydWIyeRENLbIdK6pEp9ZgNbHQI9eDV',
// });


const successTwitterLogin = async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/failure');
        }
        const { provider, displayName, username, accessSecret, id, accessToken } = req.user;

        const findSocialMediaAccount = await SocialMedia.findOne({
            platformName: provider,
            socialMediaID: id,
        });
        if (findSocialMediaAccount) {

            findSocialMediaAccount.accessToken = accessToken;
            findSocialMediaAccount.platformUserName = username;
            findSocialMediaAccount.accessSecret = accessSecret;

            await findSocialMediaAccount.save();

            return res.status(200).json({
                success: true,
                message: "Social media account updated successfully",
                data: findSocialMediaAccount,
            });
        }

        const socialmediaAccountAdd = new SocialMedia({
            accessToken: accessToken,
            // socialMediaEmail: userProfile.email,
            platformName: provider,
            platformUserName: username,
            userId: "675afbb55243cfd7a7b5d70a",
            socialMediaID: id, //? insert sub id
            createdBy: displayName,
            accessToken: accessSecret,
        });

        await socialmediaAccountAdd.save();

        // User is already authenticated
        return res.status(200).json({
            message: "User successfully login",
            data: socialmediaAccountAdd,
        });

    } catch (error) {
        console.log("Error in authCheck controller", error.message);
        return res.status(500).json({ message: "Internal server error" });

    }
}

const failureTwitterLogin = (req, res) => {
    res.send("Error");
}

const twitterGet = async (req, res) => {
    try {
        const findSocialMediaAccount = await SocialMedia.find({
            platformName: "twitter",
        });
        res.status(200).json({ success: true, data: findSocialMediaAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const twitterPost = async (req, res) => {
    try {
        const { tweetText } = req.body;
        const findSocialMediaAccount = await SocialMedia.findOne({ userId: req.user._id, platformName: "twitter" });

        if (!findSocialMediaAccount) {
            return res.status(404).json({ message: "Twitter account not found for this user." });
        }

        // Initialize a new Twitter client with user-specific tokens
        const userClient = new TwitterApi({
            appKey: process.env.TWITTERAPIKEY,
            appSecret: process.env.TWITTERAPISECRET,
            accessToken: findSocialMediaAccount.accessToken,
            accessSecret: findSocialMediaAccount.accessSecret,
        });


        const client = userClient.readWrite;

        let mediaData;
        if (req.file) { // Ensure the file is present
            const mediaFileBuffer = await fs.readFileSync(req.file.path);
            mediaData = await client.v1.uploadMedia(mediaFileBuffer, { type: 'image/jpeg' }); // Specify MIME type for images
        }
        console.log("mediaData", mediaData);

        // Create the tweet payload
        const tweetData = {
            text: tweetText,
        };

        if (mediaData) {
            // Attach the media_id_string from the media upload response
            tweetData.media = { media_ids: [mediaData] }; // Twitter expects an array of media_ids
        }

        // Post tweet using the v2 API
        const tweet = await client.v2.tweet(tweetData);

        if (tweet) {
            const twitterPostAdd = new post({
                userId: req.user._id,
                socialMediaId: findSocialMediaAccount._id,
                postId: tweet.data.id,
                createdBy: req.user.name,
            });

            await twitterPostAdd.save();

            console.log("Tweet successful:", tweet);

            return res.status(200).json({ success: true, data: twitterPostAdd });
        } else {
            return res.status(500).json({ success: false, message: "Failed to post tweet" });
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message, error: error });

    }
};

// Tweet successful: {
//     data: {
//       text: 'new tweetText https://t.co/ohEmBLXQsB',
//       edit_history_tweet_ids: [ '1869165764202144088' ],
//       id: '1869165764202144088'
//     }
//   }
module.exports = {
    failureTwitterLogin,
    successTwitterLogin,
    twitterPost,
    twitterGet
};

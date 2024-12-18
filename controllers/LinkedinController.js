const axios = require('axios');
const fs = require('fs');
const qs = require('querystring');
const Socialmedia = require('../models/SocialMedia.js');
const Post = require('../models/Post.js');

const linkedinlogin = async (req, res) => {
  try {
    // Step 1: Exchange authorization code for an access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', qs.stringify({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: 'http://localhost:5000/api/v1/linkedin/callback',
      client_id: process.env.LINKEDINCLINTID,
      client_secret: process.env.LINKEDINCLINTSECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Use access token to fetch user profile
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Step 3: Extract user data
    const userProfile = userInfoResponse.data;
    if (userProfile) {
      console.log("userProfile", userProfile);

      const findSocialMediaAccount = await Socialmedia.findOne({
        socialMediaEmail: userProfile.email,
      });
      console.log("findSocialMediaAccount", findSocialMediaAccount);

      if (findSocialMediaAccount) {
        findSocialMediaAccount.accessToken = accessToken;  // Assuming accessToken is passed in the request body
        findSocialMediaAccount.socialMediaID = userProfile.sub;
        await findSocialMediaAccount.save();

        return res.status(200).json({
          success: true,
          message: "Social media account updated successfully",
          data: findSocialMediaAccount,
        });
      }

      const socialmediaAccountAdd = new Socialmedia({
        accessToken: accessToken,
        socialMediaEmail: userProfile.email,
        platformName: 'linkedin',
        platformUserName: userProfile.name,
        userId: "675afbb55243cfd7a7b5d70a",
        socialMediaID: userProfile.sub, //? insert sub id
        createdBy: userProfile.name,
      });

      await socialmediaAccountAdd.save();

      return res.status(201).json({ success: true, data: socialmediaAccountAdd });
    } else {
      return res.status(404).json({ error: 'An error occurred during LinkedIn authentication data not insert.' });
    }
  } catch (error) {
    console.error('Error during LinkedIn OAuth:', error.message);
    return res.status(500).json({ error: 'An error occurred during LinkedIn authentication.', errormes: error.message });
  }
}

const linkedinGet = async (req, res) => {
  try {
    const findSocialMediaAccount = await Socialmedia.find({
      platformName: "linkedin",
    });
    res.status(200).json({ success: true, data: findSocialMediaAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const linkedinPost = async (req, res) => {
  try {

    const findSocialMediaAccount = await Socialmedia.findOne({ userId: req.user._id });

    if (!findSocialMediaAccount) {
      return res.status(404).json({ success: true, data: "Social media account not found!" });
    }
    const { text } = req.body;

    if (!findSocialMediaAccount || !findSocialMediaAccount.accessToken) {
      return res.status(400).json({ success: false, message: 'Access token is missing or invalid' });
    }
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${findSocialMediaAccount.accessToken}`
      }
    });

    // if (userInfoResponse) {
    //   console.log("userProfile", userInfoResponse.data);
    // }
    // else {
    //   console.log("userProfile not found ");
    // }

    const headers = {
      Authorization: `Bearer ${findSocialMediaAccount.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };

    let mediaAsset = null;
    let mediaType = null;

    // Handle media upload if mediaType and filePath are provided
    if (req.file) {
      const filePath = req.file.path;
      mediaType = req.file.mimetype.split("/")[0];

      // Step 1: Register media upload
      const registerResponse = await axios.post(
        `${process.env.LINKEDINAPI_BASE_URL}/assets?action=registerUpload`,
        {
          registerUploadRequest: {
            recipes: [`urn:li:digitalmediaRecipe:${mediaType === 'image' ? 'feedshare-image' : 'feedshare-video'}`],
            owner: `urn:li:person:${findSocialMediaAccount.socialMediaID}`, // Replace with your LinkedIn Person URN
            serviceRelationships: [
              { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
            ],
          },
        },
        { headers }
      );

      const uploadUrl = registerResponse.data.value.uploadMechanism[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ].uploadUrl;
      mediaAsset = registerResponse.data.value.asset;

      // Check if uploadUrl and asset exist
      if (!uploadUrl || !mediaAsset) {
        return res.status(400).json({ success: false, message: 'Error registering media upload.' });
      }

      // Step 2: Upload the media file
      const file = fs.readFileSync(filePath);
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': 'application/octet-stream' },
      }).catch(err => {
        console.error('Error uploading media:', err.response?.data || err.message);
        return res.status(500).json({ success: false, message: 'Error uploading media to LinkedIn' });
      });
    }

    // Step 3: Create the post
    const postBody = {
      author: `urn:li:person:${findSocialMediaAccount.socialMediaID}`, // Replace with your LinkedIn Person URN
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaType ? (mediaType === 'image' ? 'IMAGE' : 'VIDEO') : 'NONE',
          media: mediaAsset
            ? [
              {
                status: 'READY',
                media: mediaAsset,
                description: { text: 'Uploaded via API' }, // Optional description
                title: { text: 'My Media Post' }, // Optional title
              },
            ]
            : [],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const response = await axios.post(`${process.env.LINKEDINAPI_BASE_URL}/ugcPosts`, postBody, { headers });

    // console.log('Post body:', postBody, response.data.id);

    if (response.data && response.data.id) {
      const linkedinPostAdd = new Post({
        userId: req.user._id,
        socialMediaId: findSocialMediaAccount._id,
        postId: response.data.id,
        createdBy: req.user.name,
      });

      await linkedinPostAdd.save();
      return res.status(201).json({ success: true, message: "post successfully uploaded", data: linkedinPostAdd });
    }
    return res.status(404).json({ success: false, message: "Post data not insert proparly" });

  } catch (error) {
    console.error('Error creating post:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: error });
  }
};

module.exports = { linkedinlogin, linkedinGet, linkedinPost };

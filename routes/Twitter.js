const express = require("express");
const Joi = require("joi");
const passport = require("passport");
require("../config/passport.js");

const {
  successTwitterLogin,
  failureTwitterLogin,
  twitterPost,
  twitterGet
} = require("../controllers/TwitterController.js");

const upload = require("../config/multerConfig");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware, logout } = require("../middleware/authMiddleware.js");
const router = express.Router();

//! Twitter Auth 
router.get('/', passport.authenticate('twitter'));

//! Auth Callback 
router.get('/callback',
  passport.authenticate('twitter', {
    successRedirect: '/api/v1/twitter/success',
    failureRedirect: '/api/v1/twitter/failure'
  }));

//! Success 
router.get('/success', successTwitterLogin);

//! failure 
router.get('/failure', failureTwitterLogin);

router.post("/twitter-post",
  authMiddleware, upload.single('file'),
  PostValidation, twitterPost);
router.get("/twitter-get", authMiddleware, twitterGet);

function PostValidation(req, res, next) {
  const schema = Joi.object({
    tweetText: Joi.string().min(1).max(100).required(),
  });
  validateRequest(req, res, next, schema);
}

module.exports = router;

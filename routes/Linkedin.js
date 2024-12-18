const router = require("express").Router();
const Joi = require("joi");
// const passport = require("passport");
const { linkedinlogin, linkedinGet, linkedinPost } = require("../controllers/LinkedinController.js");
const { authMiddleware, logout } = require("../middleware/authMiddleware.js");
const validateRequest = require("../middleware/validate-request.js");
const upload = require("../config/multerConfig");

router.get('/', (req, res) => {
    const clientId = '77z2p7tuvpm43v';
    const redirectUri = encodeURIComponent('http://localhost:5000/api/v1/linkedin/callback');
    const state = 'randomstring123'; // Generate securely in production
    const scope = 'openid,profile,email,w_member_social';

    const loginUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    res.redirect(loginUrl);
});

router.get("/callback", linkedinlogin);
router.get("/linkedin-get", authMiddleware, linkedinGet);
router.post("/linkedin-post", authMiddleware, upload.single('file'), PostValidation, linkedinPost);

function PostValidation(req, res, next) {
    const schema = Joi.object({
        text: Joi.string().min(1).max(100).optional(),
    });
    validateRequest(req, res, next, schema);
}

module.exports = router;


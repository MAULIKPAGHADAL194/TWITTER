const User = require("../models/User.js");
// const SocialMedia = require("../models/SocialMedia.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/SendEmail.js");
const bcryptjs = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check findUser
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("findUser", findUser);

    // Check password
    const isMatch = await bcryptjs.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "password Dose not match" });
    }
    const token = jwt.sign({ user: findUser }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    return res.status(200).json({
      message: "User successfully login",
      data: findUser,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", Error: error, ErrorMessage: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP and set expiration
    findUser.resetPasswordToken = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    findUser.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await findUser.save();

    // Send OTP via email
    const message = `Your password reset OTP is: ${otp}. This OTP is valid for 10 minutes.`;

    await sendEmail({
      to: findUser.email,
      subject: "password Reset OTP",
      text: message,
    });

    return res.status(200).json({ message: "password reset email sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const resetPasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const findUser = await User.findOne({
      resetPasswordToken: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!findUser) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    res.status(200).json({ message: "OTP successfully verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, confirmPassword, password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "password must be at least 6 characters",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const findUser = await User.findOne({
      resetPasswordToken: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!findUser) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // Set new password
    findUser.password = hashedPassword;
    findUser.resetPasswordToken = undefined;
    findUser.resetPasswordExpires = undefined;
    await findUser.save();

    res.status(200).json({ message: "password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetCurrantPassword = async (req, res) => {
  try {
    const { currantPassword, password, confirmPassword } = req.body;
    console.log(req.user._id);

    // Find findUser by token and check expiration
    const findUser = await User.findById(req.user._id);
    if (!findUser) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const isMatch = await bcryptjs.compare(
      currantPassword,
      findUser.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if new password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    findUser.password = hashedPassword;
    await findUser.save();

    res.status(200).json({ message: "password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const authCheck = async (req, res) => {
  try {
    res.status(200).json({ findUser: req.findUser });
  } catch (error) {
    console.log("Error in authCheck controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const successGoogleLogin = async (req, res) => {
  try {
    if (!req.user) {
      res.redirect('/failure');
    }

    const { email, displayName, sub, id, provider } = req.user;
    console.log("req.user", req.user);

    // Check findUser
    const findUser = await User.findOne({ email });

    if (findUser) {
      const token = jwt.sign({ user: findUser }, process.env.JWT_SECRET, {
        expiresIn: "30day",
      });
      return res.status(200).json({
        message: "User successfully login",
        data: findUser,
        token: token,
      });
    }

    const hashedPassword = await bcryptjs.hash('123456', 10);

    const restaurantUser = new User({
      name: displayName,
      email: email,
      thirdParty: {
        provider: provider,
        providerid: id,
        sub: sub
      },
      createdBy: given_name,
      password: hashedPassword,
    });

    await restaurantUser.save();

    const token = jwt.sign({ user: restaurantUser }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    // User is already authenticated
    return res.status(200).json({
      message: "User successfully login",
      data: findUser,
      token: token,
    });

  } catch (error) {
    console.log("Error in authCheck controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

const failureGoogleLogin = (req, res) => {
  res.send("Error");
}

const successFacebookLogin = (req, reups) => {
  if (!req.user)
      return res.redirect('/facebook/failure');
  console.log(req.user);
  res.send("Welcome " + req.user.emails[0].value);
}

const failureFacebookLogin = (req, res) => {
  res.send("Error");
}

module.exports = {
  login,
  requestPasswordReset,
  resetPassword,
  authCheck,
  resetCurrantPassword,
  resetPasswordOTP,
  failureGoogleLogin,
  successGoogleLogin,
  successFacebookLogin,
  failureFacebookLogin
};

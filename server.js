const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const session = require("express-session");
const errorHandler = require("./middleware/errorHandler.js");
// const morgan = require("morgan");
const passport = require("passport");


dotenv.config(); //? Load environment variables from .env file
connectDB(); //? Connect to the database

const app = express();

//! Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //   secure: false,
    //   maxAge: 24 * 60 * 60 * 1000, // Session expiration time (1 day)
    // },
  })
);
// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//! Security: Configure Helmet with custom Content Security Policy (CSP)
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], //? Allow resources from the same origin
      imgSrc: ["'self'", "http://localhost:5000"],  // Allow images from backend
    },
  })
);

// app.use(morgan("dev")); //? For Api hit to send Log 

//! Enable CORS (Cross-Origin Resource Sharing)
app.use(cors()); //? Allow all origins and methods

//! Rate limiting: Limit each IP to 100 requests per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, //? Time window in milliseconds (15 minutes)
    max: 100, //? Maximum requests per IP
  })
);

// const { auth, requiresAuth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0SECRET,
//   baseURL: process.env.AUTH0BASEURL,
//   clientID: process.env.AUTH0CLINTID,
//   issuerBaseURL: process.env.AUTH0ISSUEBASEURL,
// };

// app.use(auth(config));

//! Routes
app.use("/", require("./routes/index.js"));

//! Welcome Route
app.get("/", (req, res) => {
  res.send(`
    <center>
        <h1>Welcome to Test Project!</h1>
        <br>
        <a href="https://github.com/swiftrut/SchedulX-backend.git" target="_blank" > SchedulX-backend </a>
    </center>
  `);
});

//! Error Handler Middleware
app.use(errorHandler);

// Server listening
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

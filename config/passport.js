
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLECLINTID,
    clientSecret: process.env.GOOGLECLINTSECRET,
    callbackURL: "http://localhost:5000/api/v1/auth/google/callback",
    passReqToCallback: true
},
    (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "https://localhost:5000/api/v1/auth/facebook/callback",
    passReqToCallback: true,
    profileFields: ['id', 'emails', 'name']
},
    (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

// passport.use(new LinkedInStrategy({
//     clientID: process.env.LINKEDINCLINTID,
//     clientSecret: process.env.LINKEDINCLINTSECRET,
//     callbackURL: "http://localhost:5000/api/v1/linkedin/callback",
//     scope: ["openid","profile","email"],
//     state: true,
// },
//     (request, accessToken, refreshToken, profile, done) => {
//         return done(null, profile);
//     }
// ));

module.exports = passport;
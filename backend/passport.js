const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require('passport');
const user = require("./models/userModel");
passport.use(
    new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (req, accessToken, refreshToken, profile, done) => {
        
        // Google authentication callback
        try {
            // Check if the user already exists
            const existingUser = await user.findOne({email: profile.emails[0].value})

            if(existingUser){
                // User already exists, update the access token and the profile
                existingUser.accessToken = accessToken;
                existingUser.refreshToken = refreshToken;
                existingUser.profile = profile;

                await existingUser.save();

                return done(null, existingUser)
            }else{
                // If not registered, create a new user with Google details
                const newUser = new user({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                })
                await newUser.save()
                
                return done(null, newUser);
                
            }
        }
        catch(error) {
            done(error)
        }
    })
)


passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);   
})

// function generateRandomPassword(length = 8) {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
  
//     for (let i = 0; i < length; i++) {
//       const randomIndex = Math.floor(Math.random() * chars.length);
//       password += chars.charAt(randomIndex);
//     }
  
//     return password;
//   }
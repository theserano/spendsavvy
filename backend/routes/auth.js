const router = require("express").Router();
const passport = require("passport");


router.get("/login/success", (req, res) => {
    
    if(req.user){
        raw.status(200).json({
            error: false,
            message: "Successfully Logged in",
            user: req.user,
        })
    } else {
        res.status(403).json({error:true, message: "Not Authorized"});
    }
})

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login failure"
    })
    // res.redirect(process.env.CLIENT_DASHBOARD);
})

router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login/failed",
    }),
    (req, res) => {
      // Set user in the session
      req.session.user = req.user;
  
      // Redirect to the dashboard
      res.redirect(process.env.CLIENT_DASHBOARD);
    }
  );
  

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get("/logout", (req, res) =>{
    req.logout();
    res.redirect(process.env.CLIENT_URL);
})

module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
require("dotenv").config();
const path = require("path");
const user = require("./models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportSession = require("./passport");
const authRoutes = require("./routes/auth");
const { readdirSync } = require("fs");
const PORT = process.env.PORT || 3002;
const fileupload = require("express-fileupload");


//middle wares
app.use(fileupload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.static(path.join(__dirname, "/frontend/public")));
app.use(
  cookieSession({
    name: "session", 
    keys: ["spendsavvy"],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(passport.initialize());
app.use(passport.session());




// routes
app.use("/auth", authRoutes);
readdirSync("./routes/dashboard").map((route) =>
  app.use("/api/v1", require("./routes/dashboard/" + route))
);

//////////////////////////// HANDLE REQUESTS ///////////////////////////

//login request
app.post("/login", async (req, res) => {
  const personLogin = req.body;
  console.log(personLogin);

  user.findOne({email: personLogin.email}).then((dbUser) => {
    if(!dbUser) {
        return res.json({
            status: "error",
            error: "Invalid login",
        }); 
    } 

    bcrypt.compare(personLogin.password, dbUser.password).then((isCorrect) => {
        if(isCorrect){
            const payload = {
                id: dbUser._id,
                email: dbUser.email,
                firstName: dbUser.firstName,
            };
            const token = jwt.sign(payload, "newSecretKey", {expiresIn: 86500});

            const personData = {
              fName: dbUser.firstName,
              lName: dbUser.lastName,
            }

            return res.json({ status: "ok", user: token, person: personData });
        }else {
            return res.json({ status: "error", user: false });
        }
    });

  })

});

//signup request
app.post("/signup", async (req, res) => {
  // const {firstName, lastName, email, password} = req.body;
  const person = req.body;
  console.log(person);

  try {
    const check = await user.findOne({ email: person.email });
    if (check != null) { 
      return res.json("user already exist");
    }
    person.password = await bcrypt.hash(req.body.password, 10);

    const data = new user({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      password: person.password,
    }); 

    await data.save();
    res.status(200).json("Signup successful");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// mongoose setup
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((error) => console.log(`${error} did not connect`));
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));

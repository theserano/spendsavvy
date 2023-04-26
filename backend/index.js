const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require('cors');
const app = express();
require('dotenv').config();
const path = require('path')

const PORT = process.env.PORT || 3002;

//middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(express.static(path.join(__dirname, '/frontend/public')));


//mongoose setup
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
}).catch((error) => console.log(`${error} did not connect`));
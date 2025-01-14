const express = require("express");
const path = require("path");
require("dotenv").config();
const bodyParser = require("body-parser")
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const session = require("express-session"); //package for session
const flash = require("connect-flash"); //package for displaying messages on the front end
const router = require("./routes/index");
const MongoStore = require("connect-mongo"); 





const PORT = process.env.PORT || 3000;
const uri = process.env.CONNECTION_URL;
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

//sesion store
let options = {
  mongoUrl: uri,
  collection: "sessions",
};

//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoStore.create(options),
    saveUninitialized: false,
    cookie: { maxAge: 100000 * 60 * 60 * 24 },
    unset: "destroy",
  })
);

app.use(flash());

//passport config for sessions and storing login data
const passportInit = require("./config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

//Global middleware can be used accessed anywhere so as to help store the user login in session
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("static"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//app.post("/student/register", (req, res) => {
//  console.log(req.body);
//})

app.use("/", router);

app.listen(PORT, console.log("server started"));

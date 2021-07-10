const express = require("express");
const sequelize = require("./util/database");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const ejs = require("ejs");
const session = require("express-session");

var bodyParser = require("body-parser");

// import all models here
const User = require("./models/user-model");

const app = express();

// import all error controllers here
const corsError = require("./middleware/error-handlers/cors-error");
const centralError = require("./middleware/error-handlers/err");

//handling the cors error here
app.use(corsError.corsErr);
app.use(
  session({ secret: "agentsecret", saveUninitialized: true, resave: true })
);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));//modified the data here Navneet
app.use(express.json());

app.use("/", require("./routes/auth"));

// central error handling middleware
app.use(centralError.getError);
// sync with database
sequelize
  .sync()
  .then(() => {
    app.listen(3002);
  })
  .catch((err) => {
    console.log(err);
  });

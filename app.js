var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const route = require("./routes/index");

const { initDbConnection } = require("./modules/db");
const firsebase = require("./modules/firsebase");
const cronSchedule = require("./modules/cronSchedule");
var session = require('express-session');
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'nhvhi3432j492j35nfdshfúydfy2h3nksjdmq5',
  resave: true,
  saveUninitialized: true
}));

route(app);
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

//Connect mongodb
initDbConnection().catch(() => {
  console.log(`error db connection`);
  process.exit(1);
});

// Init FiseBase
firsebase.initializeFiseBase();

// Init CronSchedule
cronSchedule.initializeCronSchedule();


// app.listen(3000,'192.168.1.12',function(){
//   console.log('Run 3000');
// })

module.exports = app;
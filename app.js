var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var activitiesRouter = require('./routes/activities');
var profilesRouter = require('./routes/profiles');
var calendarRouter = require('./routes/calendar');

var passport = require("passport");
require("./config/passport")(passport);
var session = require("express-session");


const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/fitTracker");
let connection = mongoose.connection;
connection.once("open", ()=>{console.log("Yay, Connected to database!")})
connection.once("error", (error)=>{console.log("Ouch! There was an error connecting to the database: " + error)})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  saveUninitialized:false,
  resave: false,
  cookie: {},
  secret : "aisjEnIa"
}))

app.use(passport.initialize());
app.use(passport.session());
app.get("*", (req, res, next)=>{
  res.locals.user = req.user || null
  next();
})


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/activities', activitiesRouter);
app.use('/profile', profilesRouter);
app.use('/calendar', calendarRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

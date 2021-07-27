require("dotenv").config();
const redisClient = require('./helpers/init_redis');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const redis = require("redis");
const passport= require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const redisStore = require('connect-redis')(session);   
var cloudinary = require('cloudinary').v2;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Passport config
require("./config/passport")(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set("layout", "./layout");

// Body Parser
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// MongoDB
mongoose
    .connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected DB"))
    .catch((err) => console.log(err));

// Method Override
app.use(methodOverride("_method"));

cloudinary.config({ 
  cloud_name: 'sherine', 
  api_key: process.env.API_KEY, 
  api_secret:  process.env.API_SECRET 
});

// Express session
app.use(
  session({
    
    store: new redisStore({ 
      host: 'localhost', 
      port: 6379, 
      client: redisClient 
    }),
    name: '_redisDemo', 
    secret: 'secret',
    resave: false,
    cookie: { secure: false, maxAge: 600000 }, // Set to secure:false and expire in 1 minute for demo purposes
    saveUninitialized: true
  })
);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// App Router
app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server running on ${PORT}`));

module.exports = app;

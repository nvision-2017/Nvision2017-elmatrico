require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);


// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

// require('./config/passport')(passport);

var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/elmatrico");

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: '127.0.0.1',
  port: '6379'
}

// required for passport
app.use(session({
  secret: 'Celestial Inquisition',
  store: new RedisStore(options),
  resave: true
})); // session secret
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions

app.use('/', routes);


// app.get('/img/:lvl/:pic/pic.png', function(req, res) {
//   if (req.user && req.user.level == req.params.lvl) {
//     return res.sendFile(`${__dirname}/questions/q${req.params.lvl}_${req.params.pic}.png`)
//   }
//   res.sendStatus(404)
// })

// app.get('/img/:lvl/:pic/pic.jpg', function(req, res) {
//   if (req.user && req.user.level == req.params.lvl) {
//     return res.sendFile(`${__dirname}/questions/q${req.params.lvl}_${req.params.pic}.jpg`)
//   }
//   res.sendStatus(404)
// })

// app.post('/signup', passport.authenticate('local-signup', {
//   successRedirect: '/profile', // redirect to the secure profile section
//   failureRedirect: '/' // redirect back to the signup page if there is an error
// }));

// app.post('/login', passport.authenticate('local-login', {
//   successRedirect: '/profile', // redirect to the secure profile section
//   failureRedirect: '/login' // redirect back to the signup page if there is an error
// }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

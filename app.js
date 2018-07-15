var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
//import mongo-connect after importing session
//this exports a function
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var user = require('./routes/user');
var cards = require('./routes/cards');

var app = express();

mongoose.connect('mongodb://localhost/test').then(() => { console.log("Connected to mongodb.")}).catch((err) => {console.log(err)});
//run passport config file
require('./config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/**need to initialize after bodyParser has been set up
 * will take the parameters you want to validate from submitted
 *  request body (from bodyParser)
 */
app.use(validator());
app.use(cookieParser());
//configure the session
//resave: session saved on server on each request regardless if something changed
/**set up the mongo connection key to tell it not to set up a new
 * connection on its own & use existing mongoose connection
 * configure how long the cookie should last: how long the session should
 * last before it expires: 3 hours
 * convert the time to milliseconds
 */
app.use(session({secret: 'secretkey2saveursessions', 
resave: false, 
saveUninitialized: false,
store: new MongoStore({mongooseConnection: mongoose.connection}),
cookie: {maxAge: 180 * 60 * 1000}
}));
//saveUninitialized: session saved on server even if it wasn't initialized first
//for some reason, both of these defaults are set to true but are also depreceated!
/**The session has to be served on the server, currently it is saved
 * in memory.This is not something we want in production, due to memroy
 * leaks.
 * Go to express-session page to choose place to store sessions.
 */
//make sure session is used before using flash()
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  //set up global variable available in the views
  //is the user logged in?
  res.locals.login = req.isAuthenticated();
  //make session available in views
  //pass it the session object
  res.locals.session = req.session;
  next();
});
app.use('/', index);
app.use('/user', user);
app.use('/cards', cards)
/**Academind says that / should always be listed last, bc
 * the server will use the route in order
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

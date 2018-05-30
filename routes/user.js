var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');


//all routers should be protected by csrf protection
router.use(csrfProtection);

/*check to see if user is logged in before allowing them to access
the profile page
Order is the model we imported
find() is the mongoose method for querying the database
find() is also used in the mongo shell (db.orders.find())
find() takes the same parameters from the order object
the current user is stored in req.user; mongoose will use the id stored
in req.user and compare it to the id stored in the database
generate a new cart for each order
we need the generatArray method from the cart model 
*/
router.get('/profile', isLoggedIn, function(req, res, next) {
  Order.find({user: req.user}, function(err, orders){
    if (err) {
      return res.write('Error!');
    }
    var cart;
    orders.forEach(function(order){
      cart = new Cart(order.cart);
      orders.items = cart.generateArray();
    });
    res.render('user/profile', {orders: orders});
  });
});

router.get('/logout', isLoggedIn, function(req, res, next) {
  //logout with function provided by passport
  req.logout();
  //redirect to homepage
  res.redirect('/');
});

/**instead of writing notLoggedIn for every route, we can do
 * this and havve the ISlogged in routes come before it
 */
router.use('/', notLoggedIn, function(req, res, next) {
  next();
});

router.get('/signup', function(req, res, next) {
  //store possible flash messages
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), 
    messages: messages, hasErrors: messages.length > 0});
});

/*Version of POST signin used before forcing users to login when
checking out
router.post('/signup', /*
instead of rerouting, we will replace this function instead with 
passport
function(req, res, next) {
  res.redirect('/');
}
//takes the strategy, that was used from the passport.js file
passport.authenticate('local.signup', {
  /**tell passport you want to redirect 
  //you need to add this route with .get!
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  /**if failed, flashed the message set in passport.js's
   * passport.use -> if (user)
   * using the connect flash package
   
  failureFlash: true
})); */

/**setting oldUrl to null needs to be done before redireting 
 * redirecting to null will give you an error
*/
router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
}); 

router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), 
    messages: messages, hasErrors: messages.length > 0});
});

/*Version of POST signin used before forcing users to login when
checking out

router.post('/signin', passport.authenticate('local.signin', {
  //redirect to profile page if successful
  successRedirect: '/user/profile',
  //redirect to signin page if not
  failureRedirect: '/user/signin',
  failureFlash: true
})); */

/**If there is an old URL stored, redirect end user to the last page
 * viewed,otherwise redirect to user's homepage
*/
router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    res.redirect(req.session.oldUrl);
    req.session.oldUrl = null;
  } else {
    res.redirect('/user/profile');
  }
}); 



module.exports = router;

//create own middleware isLoggedin
function isLoggedIn(req, res, next){
  /**the isAuthenticated method is managed by passport
 * passport manages the authentication state for you 
 * when you login this is set to true*/
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

/**create middleware for routes you want only non-authenticated
 * users to access
 */
function notLoggedIn(req, res, next){
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
};
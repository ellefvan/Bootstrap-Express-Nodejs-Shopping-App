var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');


/* GET home page. */
router.get('/', function(req, res, next) {
  //save flash success msg if customer successfully purchased item
    var successMsg = req.flash('success')[0];

  //this is the same find() method as in the mongo shell
    var products = Product.find(function(err, docs) {
        if (err) {
            console.log(err);
            return handleError(err);
        }
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
          productChunks.push(docs.slice(i, i+chunkSize));
        };
        res.render('shopping', 
            {products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});

/**you can leave the next parameter out if you're not using it*/
router.get('/add-to-cart/:id', function(req, res) {
  var productId = req.params.id;
  /*a new cart will be created each time we add an item & the old cart
  will be passed to it
  check if cart property exists with a turnary expression
  if it does exist, pass the old cart, otherwise pass object with 
  items key and empty value so that items itself will not be null

  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});
  We can pass in {} like this or deal with logic in the Cart model file
  */
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  /**define a callback 
   * inside the callback, check to see if we have an error
   * if no error, add a product to our cart
   * store cart object in our session
  */
  console.log(productId);
  Product.findById(productId, function(err, product) {
    if (err) {
      console.log('was err' + err);
      return res.redirect('/');
    } 
    cart.add(product, product.id);
    req.session.cart = cart;
    /**log session cart so that we can see it */
    console.log(req.session.cart);
    res.redirect('/');
  });
});
 
router.get('/reduce/:id', function(req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

/* check to see if the cart is set in the session
set products value to null to be able to check if we have products in 
our cart
if there is a cart, create a new cart from the cart stored in our session
use generatearray to get a list of the product groups in the cart
*/
router.get('/shopping-cart', function(req, res) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(),
  totalPrice: cart.totalPrice});
});

/**Force users to signin in order to checkout. By using isLoggedin,
 * redirect them to login page
 * If there is no shopping cart, redirect users to shopping cart page */
router.get('/checkout', isLoggedIn, function(req, res) {
  if (!req.session.cart) {
    return res.render('shop/checkout');
  }
  var cart = new Cart(req.session.cart);
  //we know we are only storing 1 error from post checkout
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg,
  noError: !errMsg});
});

/**Force users to signin in order to checkout. By using isLoggedin,
 * redirect them to login page */
router.post('/checkout', isLoggedIn, function(req, res) {
  if (!req.session.cart) {
    return res.render('shop/checkout');
  }
  var cart = new Cart(req.session.cart);
  /**This code was copied from the Stripe API Reference
   * This key is the test secret key, since this is server-side &
   * the end user cannot access it
   * 
   * amount: multiply $$ amt by 100 to get amt in pennies
   * source: token crated by Stripe.js SDK; it was added as a hidden
   * HTML element in the checkout.js file in javascripts; Because
   * it is now in the Web page, we can access it using req.body & the
   * name of the element
   * 
   * After checking for an error, create a new order and save to the
   * database
   * Passport stores the user in the request for us; the user is easy
   * to get, because we will require the user to be logged in in order
   * to make a purchasee
imagePath: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true} 
   * save current cart
   * The address field in the checkout.jade file must have a name
   * attribute added to it in order to access it with the req 
   * variable; the same goes for the name field 
   * obtain requestid from charge object that was passed in through
   * the callback; Charge object is defined in Stripe docs
   * use save function to save order object to database
   * move success code inside callback of save function
   */
  var stripe = require("stripe")("sk_test_FVrXVUdc5BtpPn3Y8yvePnjN"
  );
  
  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken,
    description: "Test Charge"
  }, function(err, charge) {
    // asynchronously called
    if (err) {
      console.log("There was an error at post checkout: " + err.message);
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function(err, result){
      if (err) {
        console.log(err.message);
        //also redirect to another page when making own site
      }
      console.log("Product successfully bought on post checkout");
      req.flash('success', 'Successfully bought product!');
      req.cart = null;
      res.redirect('/');
    });
    
  });

});

module.exports = router;

/**copied from user.js routes file & only use it when forcing users
 * to login to checkout
 */
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
};
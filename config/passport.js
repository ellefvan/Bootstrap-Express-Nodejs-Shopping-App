var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    /*able to access parameters passed in from callback function
    because this is set to true
    */
    passReqToCallback: true 
}, function (req, email, password, done) {
    //validate passed parameters
      //chain checkBody with validation functions
      req.checkBody('email', 'Invalid email').notEmpty().isEmail();
      req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    /**these functions check if errors, but don't do anything*/
    var errors = req.validationErrors();
    if (errors) {
        //create array of messages to pass back to the view
        var messages = [];
        //push each error onto messages array
        errors.forEach(function(error) {
            /**each error object has a message field, a paremeter field
             * which shows which parameter threw the error, etc.
             */
            messages.push(error.msg);
        });
        /**return no errors, not successful (false), assign messages
         * to error field in flash  */
        return done(null, false, req.flash('error', messages));
    }
    
      User.findOne({'email': email}, function(err, user) {
            if (err) {
                return done(err);
            } //Error: user already exists
            else if (user) {
                //return was not successful & reason why
                /*this message will later be a flash message stored 
                in the view 
                flash this message when the page is rerouted using
                the connect flash pacakge*/
                return done(null, false, {message: 
                    "E-mail is already in use."});
            }
            var newUser = new User();
            newUser.email = email;
            /*newUser.password = password;
            We don't want to use this, because password will not be
            encrypted. Instead, we went to models/user.js to create
            helper functions to encrypt our password for us
            */
            newUser.password = newUser.encryptPassword(password);
            newUser.save(function (err, result) {
                if (err) {
                    return done(err);
                }
                //return error=null & the new user
                else {
                    return done (null, newUser);
                }
            });
        });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function(error) {
          messages.push(error.msg);
        });
      return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        } 
        ///return an error if we DON'T find the user
        if (!user) {
            return done(null, false, {message: 
                "No user was found with that e-mail address."});
        }
        //check to see if password is invalid
        //verify password using encrypted password in database
        if (!user.validPassword(password)) {
            return done(null, false, {message: 
                "Incorrect password or username."});
        }
        //return done with no error & returned user
        return done(null, user);
    });
}));
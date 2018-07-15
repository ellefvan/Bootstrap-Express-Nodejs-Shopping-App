var express = require('express');
var router = express.Router();

var Product = require('../models/product');

/* reroute to index if user did not enter a search query */
router.get('/', function(req, res, next) {
	/* We will do it this way, bc we are only going to search for one category at a time. To search for multiple categories at once, 
 * we could have a form submit button on our left nav. */
    if (req.query.name) { 
        var product = Product.findOne({title: {$regex: pokemonName, $options: "i"}}, function(err, docs) {
            if (err) {
                console.log(err);
                return handleError(err);
            }
            console.log("docs:" + docs);
            res.render('card', {pokemon: docs});
        });
    } else if (req.query.type) {
        Product.find({type: req.query.type}, function(err, docs) {
            if (err) {
                console.log(err);
                return handleError(err);
            }
            res.render('card', {pokemon: docs});
        });

    } else if (req.query.price) {
        let cardPrice = req.query.price;
        // you can use gte, lte to search in between numbers
        Product.find({price: { $gte: cardPrice, $lte: ???}}, function(err, docs) {
            if (err) {
                console.log(err);
                return handleError(err);
            }
            console.log("docs:" + docs);
            res.render('card', {pokemon: docs});
        });
    } else {
    res.redirect('/');
    }

    if (!req.query.name) { 
        // return res.send(req.query.name);
        res.redirect('/');
    }
    var pokemonName = req.query.name;
    console.log("req params: " + JSON.stringify(req.params));
    console.log("body: " + JSON.stringify(req.body));
    console.log("body: " + JSON.stringify(req.query));

    //save flash success msg if customer successfully purchased item
    var successMsg = req.flash('success')[0];

    // use a regex expression so that the search will ignore case
    
    console.log("Product: " + JSON.stringify(product._id));
    // when using get, the form info is in the response's query instead of the body as in post
    
});

module.exports = router;
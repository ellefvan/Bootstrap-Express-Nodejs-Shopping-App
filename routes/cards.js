var express = require('express');
var router = express.Router();

var Product = require('../models/product');

/* reroute to index if user did not enter a search query */
router.get('/', function(req, res, next) {
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
    var product = Product.findOne({title: {$regex: pokemonName, $options: "i"}}, function(err, docs) {
        if (err) {
            console.log(err);
            return handleError(err);
        }
        console.log("docs:" + docs);
        res.render('card', {pokemon: docs});
    });
    console.log("Product: " + JSON.stringify(product._id));
    // when using get, the form info is in the response's query instead of the body as in post
    
});

router.get('/price/:price', function(req, res, next) {
    console.log("req params: " + JSON.stringify(req.params));
    //save flash success msg if customer successfully purchased item
    var successMsg = req.flash('success')[0];

    let cardPrice = req.params.price;
    let searchParams = null;
    if (cardPrice == 0) {
        searchParams = { $lte: 4 };
    }
    else if (cardPrice == 5) {
        searchParams = { $gte: cardPrice, $lte: 9 };
    }
    else if (cardPrice == 10) {
        searchParams = { $gte: cardPrice };
    } else {
        res.redirect('/');
    }
    // you can use gte, lte to search in between numbers
    Product.find({price: searchParams}, function(err, docs) {
        if (err) {
            console.log(err);
        }
        console.log("docs:" + docs);
        res.render('shopping', 
            {products: docs, successMsg: successMsg, noMessages: !successMsg});
    });
});

module.exports = router;
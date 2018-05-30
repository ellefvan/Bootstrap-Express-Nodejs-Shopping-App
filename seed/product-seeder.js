/*manually run this file with Node.js at the beginning of an
//application to add data to the database
node product-seeder.js
the collection products will have been saved in the test database
*/
var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var products = [new Product({
    imagePath: '/images/Snorlax-card.jpg',
    title: "Snorlax",
    description: "shiny Snorlax card",
    price: 10
}),
new Product({
    imagePath: '/images/Charizard-card.jpg',
    title: "Charizard",
    description: "just a Charizard card",
    price: 15
}),
new Product({
    imagePath: '/images/Pikachucard.jpg',
    title: "Pikachu",
    description: "just a Pikachu card",
    price: 1
}),
new Product({
    imagePath: '/images/Squirtlecard.jpg',
    title: "Squirtle",
    description: "pretty Squirtle card",
    price: 1
}),
new Product({
    imagePath: '/images/MewTwocard.jpg',
    title: "MewTwo",
    description: "Save your master ball for this! It's a MewTwo card!",
    price: 10
}),
new Product({
    imagePath: '/images/Vaporeon-card.jpg',
    title: "Vaporeon",
    description: "a shiny Vaporeon card",
    price: 5
})
];

/**because save is an asynchronous function, you will have
 * to call disconnect once you are sure the documents have finished
 * saving
 */
var done = 0;
for (var i = 0; i < products.length; i++) {
    //save takes the parameters of a callback function
    products[i].save(function (err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {mongoose.disconnect();}
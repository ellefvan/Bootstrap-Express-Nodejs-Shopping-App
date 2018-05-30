var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**user refers to the User schema created in models/user.js 
 * storing objects in a NoSQL database is easy, since we are storing 
 * JSON anyway
 * store the address of the customer
 * store customer's name
 * take these from checkout page's input fields
 * PaymentId can be found on Stripe dashboard on Payments page
*/
var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String, requried: true }
});

module.exports = mongoose.model('Order', schema);
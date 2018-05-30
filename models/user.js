var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});

//create helper methods to allow us to easily encrypt password
userSchema.methods.encryptPassword = function(password) {
    //return hashed password
    /** hash password & generate salt synchronously
     * use 5 rounds of salt creation */
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

//check if is a valid password
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);
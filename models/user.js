var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');

var userSchema = mongoose.Schema({
	userId: String,
	email: String,
	college: String,
	phone: String,
	name: {
		first: String,
		last: String
	},
	uname: {
		type: String
	},
	level: {
		type: Number,
		default: 1
	}
});

userSchema.plugin(timestamps);

// methods ======================
// generating a hash
// userSchema.methods.generateHash = function(password) {
// 	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// checking if password is valid
// userSchema.methods.validPassword = function(password) {
// 	return bcrypt.compareSync(password, this.password);
// };

module.exports = mongoose.model('User', userSchema);

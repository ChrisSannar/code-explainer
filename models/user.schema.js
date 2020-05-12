var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var UserSchema = Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  permissions: [{
    language: { type: String, required: true },
    read: { type: Boolean, required: true },
    write: { type: Boolean, required: true },
    execute: { type: Boolean, required: true },
  }]
});

// Hashs the update's password
function hashPassword(next) {
  var query = this;

  // Not sure what this is for exactly because, because the 'user' is actually a query...
  //   However it was included in the example on mongodb for how to properly authenticate
  // if (!user.isModified('password')) return next();

  // Get some salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) throw err;

    // Hash the password
    bcrypt.hash(query._update.password, salt, function (err, hash) {
      if (err) throw err;

      // Save it in before we attempt to store it
      query._update.password = hash;
      next();
    });
  });
}

// Hashes the password before we update one
UserSchema.pre('updateOne', hashPassword);

// Compares the the incoming password with the hashed one in the database
UserSchema.methods.comparePassword = function (candidate, callback) {

  bcrypt.compare(candidate, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
}

// collection: Where we're getting the users from (to be used for each call)
module.exports = function (mongooseConnection) {
  return mongooseConnection.model('Users', UserSchema, 'users');
}
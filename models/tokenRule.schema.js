var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenRuleSchema = Schema({
  tag: { type: String, required: true, index: { unique: true } },
  token: { type: String, required: true },
  html: { type: String, required: true },
  links: [String]
});

// mongooseConnection: A specific connection with the database (to be used throughout the course of a module)
module.exports = function (mongooseConnection) {
  // collection: Where we're getting the token rules from (to be used for each call)
  return function (collection) {
    return mongooseConnection.model('TokenRule', TokenRuleSchema, collection)
  }
}
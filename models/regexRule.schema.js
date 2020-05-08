var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Allow for regex to be empty
mongoose.Schema.Types.String.checkRequired(v => v != null);

var RegexRuleSchema = Schema({
  tag: { type: String, required: true, index: { unique: true } },
  regex: { type: String, required: true },
  tokenType: { type: String, required: true },
  html: { type: String, required: true },
  links: [String]
});

// mongooseConnection: A specific connection with the database (to be used throughout the course of a module)
module.exports = function (mongooseConnection) {
  // collection: Where we're getting the regex rules from (to be used for each call)
  return function (collection) {
    return mongooseConnection.model('RegexRule', RegexRuleSchema, collection)
  }
}
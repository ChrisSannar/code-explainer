var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenRuleSchema = Schema({
  tag: { type: String, required: true, index: { unique: true } },
  token: { type: String, required: true },
  html: { type: String, required: true },
  links: [String]
});

module.exports = function (collection) {
  return mongoose.model('TokenRule', TokenRuleSchema, collection);
}
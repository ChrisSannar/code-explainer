var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegexRuleSchema = Schema({
  tag: { type: String, required: true, index: { unique: true } },
  regex: { type: String, required: true },
  tokenType: { type: String, required: true },
  html: { type: String, required: true },
  links: [String]
});

module.exports = function (collection) {
  return mongoose.model('RegexRule', RegexRuleSchema, collection);
}
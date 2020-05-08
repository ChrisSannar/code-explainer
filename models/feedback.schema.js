var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Allow for regex to be empty
mongoose.Schema.Types.String.checkRequired(v => v != null);

var FeedbackSchema = Schema({
  tag: String,
  feedback: { type: String, required: true }
});

// mongooseConnection: A specific connection with the database (to be used throughout the course of a module)
module.exports = function (mongooseConnection) {
  // collection: Where we're sending and getting the feed from (to be used for each call)
  return function (collection) {
    return mongooseConnection.model('Feedback', FeedbackSchema, collection)
  }
}
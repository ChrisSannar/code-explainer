// Used for specific interactions with the application

var { Router } = require('express');
var router = Router();
const path = require('path');
const rulesUtil = require(path.join(__dirname, '../', 'util', 'rules'));

// Our mongoose connection to the database
let mongooseConnection;

// The functions to generate schemas based on programming language
let TokenRulesGenerator;
let RegexRulesGenerator;
let FeedbackGenerator;
let StatsGenerator;

// GET a list of rules given the matching tokens
// (Using POST to not limit the number of tokens to URL length)
router.post('/rules/:language', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Extract our values from the body and parameters
      let tokens = req.body.tokens;
      let lang = req.params.language;
      console.log('tokens', tokens, lang);

      // Get all the rules from the database
      let TokenRules = TokenRulesGenerator(lang + 'TokenRules');
      let RegexRules = RegexRulesGenerator(lang + 'RegexRules');
      let dbTokens = await TokenRules.find();
      let dbRegex = await RegexRules.find();

      // Filter out the rules given the tokens
      let rules = rulesUtil.getRulesFromTokens(tokens, dbTokens, dbRegex);
      res.status(200).json(rules);
    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// import the connection when we set up the router
module.exports = function (connection) {
  mongooseConnection = connection;

  // The functions to generate schemas based on programming language
  TokenRulesGenerator = require(path.join(__dirname, '..', 'models', 'tokenRule.schema'))(mongooseConnection);
  RegexRulesGenerator = require(path.join(__dirname, '..', 'models', 'regexRule.schema'))(mongooseConnection);
  FeedbackGenerator = require(path.join(__dirname, '..', 'models', 'feedback.schema'))(mongooseConnection);
  StatsGenerator = require(path.join(__dirname, '..', 'models', 'stats.schema'))(mongooseConnection);

  return router;
}
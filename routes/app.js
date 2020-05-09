// Used for specific interactions with the application

var { Router } = require('express');
var router = Router();
const path = require('path');
const rulesUtil = require(path.join(__dirname, '../', 'util', 'rules'));

// Our mongoose connection to the database
const mongooseConnection =
  require(path.join(__dirname, '..', 'util', 'mongoose-connect'))
    (process.env.DB_URI);

// The functions to generate schemas based on programming language
const TokenRulesGenerator =
  require(path.join(__dirname, '..', 'models', 'tokenRule.schema'))
    (mongooseConnection);
const RegexRulesGenerator =
  require(path.join(__dirname, '..', 'models', 'regexRule.schema'))
    (mongooseConnection);
const FeedbackGenerator =
  require(path.join(__dirname, '..', 'models', 'feedback.schema'))
    (mongooseConnection);
const StatsGenerator =
  require(path.join(__dirname, '..', 'models', 'stats.schema'))
    (mongooseConnection);

// GET a list of rules given the matching tokens
// (Using POST to not limit the number of tokens to URL length)
router.post('/rules/:language', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Extract our values from the body and parameters
      let tokens = req.body.tokens;
      let lang = req.params.language;

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

// router.post('/feedback/:lang', function (req, res) {
//   if (mongooseConnection) {
//     // let Feedback = FeedbackGenerator(lang + 'Feedback');

//     mongodb.collection("javascriptFeedback").insert(req.body, function (err, resp) {
//       if (err) {
//         res.status(500).send("ERR");
//         throw err;
//       }
//       res.status(200).send("OK");
//     });
//   } else {
//     next(new Error('Database not set'));
//   }
// });

// router.post('/stat/:lang', async function (req, res) {
//   if (mongooseConnection) {
//     let Stats = StatsGenerator(lang + 'Stats');

//     let stats = await mongodb.collection("javascriptStats").find({ tag: req.body.tag }).toArray()
//     if (stats.length > 0) {
//       mongodb.collection("javascriptStats").update({ tag: req.body.tag }, { $inc: { click: 1 } })
//     } else {
//       mongodb.collection("javascriptStats").insert({ tag: req.body.tag, click: 1 })
//     }
//     res.status(200).send("OK");
//   } else {
//     next(new Error('Database not set'));
//   }
// });


module.exports = router;
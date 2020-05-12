// Used for CRUD operations on the database
const express = require('express');
const router = express.Router();
const path = require('path');
const rulesUtil = require(path.join(__dirname, '..', 'util', 'rules'));

// Our mongoose connection to the database
let mongooseConnection;

// The functions to generate schemas based on programming language
let TokenRulesGenerator;
let RegexRulesGenerator;

// GET all the rules of a particular language
router.get('/:lang', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Pull the language and get the database call
      let lang = req.params.lang;
      let TokenRules = TokenRulesGenerator(lang + 'TokenRules');
      let RegexRules = RegexRulesGenerator(lang + 'RegexRules');
      let tokens = await TokenRules.find();
      let regex = await RegexRules.find();

      // Send back the data
      res.status(200).json(tokens.concat(regex));

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// GET all the tokenized rules of the given language
router.get('/token/:lang', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Pull the language and get the database call
      let lang = req.params.lang;

      // Set up the mongoose model
      let TokenRules = TokenRulesGenerator(lang + 'TokenRules');
      let tokens = await TokenRules.find();

      // Filter the tags given the query
      let tags = req.query.tag;
      if (tags) {
        tokens = tokens.filter(toke => tags.includes(toke.tag));
      }

      // Send back the data
      res.status(200).json(tokens);

    } catch (err) {
      next(err)
    }
  } else {
    next(new Error('Database not set'));
  }
});

// GET the regex rules of the given language
router.get('/regex/:lang', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Pull the language and get the database call
      let lang = req.params.lang;

      // Set up the mongoose model
      let RegexRules = RegexRulesGenerator(lang + 'RegexRules');
      let regex = await RegexRules.find();

      // Filter the tags given the query
      let tags = req.query.tag;
      if (tags) {
        regex = regex.filter(toke => tags.includes(toke.tag));
      }

      // Send back the data
      res.status(200).json(regex);

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// PUT update a token rule
router.put('/token/:lang/:id', function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Set up the Schema/collection we want to update to
      let lang = req.params.lang;
      const TokenRule = TokenRulesGenerator(lang + 'TokenRules');

      // Format the rule
      const updatedRule = rulesUtil.formatTokenRule(req.body);

      // Update the rule
      TokenRule.findByIdAndUpdate(req.params.id, updatedRule)
        .then(() => res.status(200).send(`OK`))
        .catch(result => next(result));

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// PUT update a regex rule
router.put('/regex/:lang/:id', function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Get and set the various value and parameters
      let lang = req.params.lang;
      const RegexRule = RegexRulesGenerator(lang + 'RegexRules');

      // Format the rule
      const updatedRule = rulesUtil.formatRegexRule(req.body);

      // Update the rule
      RegexRule.findByIdAndUpdate(req.params.id, updatedRule)
        .then(() => res.status(200).send(`OK`))
        .catch(result => next(result));

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// POST a new token rule
router.post('/token/:lang', function (req, res, next) {
  if (mongooseConnection) {

    try {
      // Set up the Schema based on the language
      let lang = req.params.lang;
      const TokenRule = TokenRulesGenerator(lang + 'TokenRules');

      // Make the new Schema from a properly formatted token rule
      const newRule = new TokenRule(rulesUtil.formatTokenRule(req.body));

      // Save to the database and send back the new id
      newRule.save()
        .then(result => res.status(201).send(result._id))
        .catch(err => next(err));

    } catch (err) {
      next(err);
    }

  } else {
    next(new Error('Database not set'));
  }
});

// POST a new regex rule
router.post('/regex/:lang', function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Set up the internal specifics of the object
      let lang = req.params.lang;
      const RegexRule = RegexRulesGenerator(lang + 'RegexRules');

      // Make the new Schema from a properly formatted regex rule
      let newRule = new RegexRule(rulesUtil.formatRegexRule(req.body));

      // Save to the database and send back the new id
      newRule.save()
        .then(result => res.status(201).send(result._id))
        .catch(err => next(err));

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// DELETE a token rule given an id
router.delete('/token/:lang/:id', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Select the collection based on language
      let lang = req.params.lang;
      const TokenRule = TokenRulesGenerator(lang + 'TokenRules');

      // Remove, the respond accordingly
      TokenRule.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send(`OK`))
        .catch(next);

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// DELETE a regex rule given an id
router.delete('/regex/:lang/:id', async function (req, res, next) {
  if (mongooseConnection) {
    try {
      // Select the collection based on language
      let lang = req.params.lang;
      const RegexRule = RegexRulesGenerator(lang + 'RegexRules');

      // Remove, the respond accordingly
      RegexRule.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send(`OK`))
        .catch(next);

    } catch (err) {
      next(err);
    }
  } else {
    next(new Error('Database not set'));
  }
});

// Set up the connection when we set up the route
module.exports = function (connection) {
  mongooseConnection = connection;

  // The functions to generate schemas based on programming language
  TokenRulesGenerator = require(path.join(__dirname, '..', 'models', 'tokenRule.schema'))(mongooseConnection);
  RegexRulesGenerator = require(path.join(__dirname, '..', 'models', 'regexRule.schema'))(mongooseConnection);

  return router;
}
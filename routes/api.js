// Used for CRUD operations on the database

const express = require('express');
const router = express.Router();
const path = require('path');

// Get the mongodb url through the environment variables
// var mongodb;
// const MongoClient = require('mongodb').MongoClient;
// const MongoID = require('mongodb').ObjectID;
// const mongoURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN_ROOT}`;
// const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// client.connect(async function (err, client) {
//   if (err) { throw err; }
//   mongodb = client.db("code-explainer");
//   console.log("MongoDB connected api");
// });

var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB_DOMAIN, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
var mongoError = false;
db.on('error', function () {
  mongoError = true;
  console.error.bind(console, 'connection error:')
});

const TokenRulesGenerator = require(path.join(__dirname, '..', 'models', 'tokenRule.schema'));
const RegexRulesGenerator = require(path.join(__dirname, '..', 'models', 'regexRule.schema'));

// *** TESTING
router.get('/', async function (req, res) {
  res.json("OK");
});
// ***

// GET all the rules of a particular language
router.get('/:lang', async function (req, res, next) {
  // req query token: {"type":"storage.type","value":"let","line":"let x = 0; "}
  if (!mongoError) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let TokenRules = TokenRulesGenerator(lang + 'TokenRules');
    let RegexRules = RegexRulesGenerator(lang + 'RegexRules');
    let tokens = await TokenRules.find();
    let regex = await RegexRules.find();

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens.concat(regex));
  } else {
    next('Database not set');
  }
});

// GET all the tokenized rules of the given language
router.get('/token/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let tokens = await mongodb.collection(`${lang}TokenRules`).find({}).toArray();

    // Filter the tags given the query
    let tags = req.query.tag;
    if (tags) {
      tokens = tokens.filter(toke => tags.includes(toke.tag));
    }

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens);
  } else {
    next('Database not set');
  }
});

// GET the tokenized rules of the given language
router.get('/regex/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let regex = await mongodb.collection(`${lang}RegexRules`).find({}).toArray();

    // Filter the tags given the query
    let tags = req.query.tag;
    if (tags) {
      tokens = tokens.filter(toke => tags.includes(toke.tag));
    }

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(regex);
  } else {
    next('Database not set');
  }
});

// PUT update a token rule
router.put('/token/:lang/:id', function (req, res, next) {
  if (mongodb) {

    try {
      // Get and set the various value and parameters
      let lang = req.params.lang;
      let updatedRule = req.body;
      if (!updatedRule.tokenType || !updatedRule.tokenValue) {
        let tokenInfo = updatedRule.token.split(`:`);
        updatedRule.tokenType = tokenInfo[0];
        updatedRule.tokenValue = tokenInfo[1];
      }

      let mongoId = new MongoID(req.params.id);
      mongodb.collection(`${lang}TokenRules`)
        .updateOne(
          { _id: mongoId },
          {
            $set: updatedRule
          })
        .then(() => res.status(200).send(`OK`))
        .catch(result => next(result));
    } catch (err) {
      next(err);
    }
  } else {
    next('Database not set');
  }
});

// PUT update a regex rule
router.put('/regex/:lang/:id', function (req, res, next) {
  if (mongodb) {
    try {
      // Get and set the various value and parameters
      let lang = req.params.lang;
      let updatedRule = req.body;

      let mongoId = new MongoID(req.params.id);
      mongodb.collection(`${lang}RegexRules`)
        .updateOne(
          { _id: mongoId },
          {
            $set: updatedRule
          })
        .then(() => res.status(200).send(`OK`))
        .catch(result => next(result));
    } catch (err) {
      next(err);
    }

    res.status(201).send(`OK`);
  } else {
    next('Database not set');
  }
});

// POST a new token rule
router.post('/token/:lang', function (req, res, next) {
  if (mongodb) {

    try {
      // Set up the internal specifics of the object
      let lang = req.params.lang;
      let newRule = req.body;
      if (!newRule.tokenType || !newRule.tokenValue) {
        let tokenInfo = newRule.token.split(`:`);
        newRule.tokenType = tokenInfo[0];
        newRule.tokenValue = tokenInfo[1];
      }

      mongodb.collection(`${lang}TokenRules`)
        .insertOne(newRule)
        .then(result => res.status(201).send(result.insertedId))
        .catch(err => next(err));
    } catch (err) {
      next(err);
    }

  } else {
    next('Database not set');
  }
});

// POST a new regex rule
router.post('/regex/:lang', function (req, res, next) {
  if (mongodb) {
    try {
      // Set up the internal specifics of the object
      let lang = req.params.lang;
      let newRule = req.body;

      mongodb.collection(`${lang}RegexRules`)
        .insertOne(newRule)
        .then(result => res.status(201).send(result.insertedId))
        .catch(err => next(err));
    } catch (err) {
      next(err);
    }
  } else {
    next('Database not set');
  }
});

// DELETE a token rule given an id
router.delete('/token/:lang/:id', async function (req, res, next) {
  if (mongodb) {

    try {
      let lang = req.params.lang;
      let mongoId = new MongoID(req.params.id);

      mongodb.collection(`${lang}TokenRules`)
        .deleteOne({ _id: mongoId })
        .then(result => res.status(204).send(`OK`))
        .catch(next);

    } catch (err) {
      next(err);
    }
  } else {
    next('Database not set');
  }
});

// DELETE a regex rule given an id
router.delete('/regex/:lang/:id', async function (req, res, next) {
  if (mongodb) {
    try {
      let lang = req.params.lang;
      let mongoId = new MongoID(req.params.id);

      mongodb.collection(`${lang}RegexRules`)
        .deleteOne({ _id: mongoId })
        .then(result => res.status(204).send(`OK`))
        .catch(next);

    } catch (err) {
      next(err);
    }
  } else {
    next('Database not set');
  }
});

module.exports = router;
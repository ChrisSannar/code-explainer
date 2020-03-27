// Used for CRUD operations on the database

var { Router } = require('express');
var router = Router();

// Get the mongodb url through the environment variables
var mongodb;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;
const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(async function (err, client) {
  if (err) { throw err; }
  mongodb = client.db("code-explainer");
  console.log("MongoDB connected");
});

// *** TESTING
router.get('/', function (req, res) {
  res.json({ message: 'MARK' });
})
// ***

// GET all the rules of a particular language
router.get('/all/:lang', async function (req, res, next) {
  // req query token: {"type":"storage.type","value":"let","line":"let x = 0; "}
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let tokens = await mongodb.collection(`${lang}TokenRules`).find({}).toArray();
    let regex = await mongodb.collection(`${lang}RegexRules`).find({}).toArray();

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens.concat(regex));
  } else {
    next('Database not set');
  }
});

// GET all the tokenized rules of the given language
router.get('/all/token/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let tokens = await mongodb.collection(`${lang}TokenRules`).find({}).toArray();

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens);
  } else {
    next('Database not set');
  }
});

// GET the tokenized rules of the language given a list of tokens
router.get('/all/token/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let tokens = await mongodb.collection(`${lang}TokenRules`).find({}).toArray();

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens);
  } else {
    next('Database not set');
  }
});

// GET the tokenized rules of the given language
router.get('/all/regex/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let regex = await mongodb.collection(`${lang}RegexRules`).find({}).toArray();

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(regex);
  } else {
    next('Database not set');
  }
});

module.exports = router;
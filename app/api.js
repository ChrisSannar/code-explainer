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
  console.log("MongoDB connected api");
});

// *** TESTING
router.get('/', function (req, res) {
  res.json({ message: 'MARK' });
})
// ***

// GET all the rules of a particular language
router.get('/:lang', async function (req, res, next) {
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
router.get('/token/:lang', async function (req, res, next) {
  if (mongodb) {

    // Pull the language and get the database call
    let lang = req.params.lang;
    let tokens = await mongodb.collection(`${lang}TokenRules`).find({}).toArray();

    // Filter the tags given the query
    let tags = req.query.tag;
    tokens = tokens.filter(toke => tags.includes(toke.tag))

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
    regex = regex.filter(toke => tags.includes(toke.tag))

    // Send back the data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(regex);
  } else {
    next('Database not set');
  }
});

// PUT update a token rule
router.put('/token/:lang/:id', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let id = req.params.id;

    res.status(201).send(`OK`);
  } else {
    next('Database not set');
  }
});

// PUT update a regex rule
router.put('/regex/:lang/:id', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let id = req.params.id;
    let updatedRule = req.body;

    res.status(201).send(`OK`);
  } else {
    next('Database not set');
  }
});

// POST a new roken rule
router.post('/token/:lang', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let newRule = req.body;

    res.status(201).send(`OK`);
  } else {
    next('Database not set');
  }
});

// POST a new roken rule
router.post('/regex/:lang', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let newRule = req.body;

    res.status(201).send(`OK`);
  } else {
    next('Database not set');
  }
});

// DELETE a token rule given an id
router.delete('/token/:lang/:id', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let id = req.params.id;

    res.status(200).send(`OK`);
  }
});

// DELETE a regex rule given an id
router.delete('/regex/:lang/:id', async function (req, res, next) {
  if (mongodb) {

    let lang = req.params.lang;
    let id = req.params.id;

    res.status(200).send(`OK`);
  }
});

module.exports = router;
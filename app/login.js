// Used for CRUD operations on the database

var { Router } = require('express');
var router = Router();

// Get the mongodb url through the environment variables
var mongodb;
const MongoClient = require('mongodb').MongoClient;
const MongoID = require('mongodb').ObjectID;
const mongoURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;
const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const sanitize = require('sanitize-html');

client.connect(async function (err, client) {
  if (err) { throw err; }
  mongodb = client.db("code-explainer");
  console.log("MongoDB connected api");
});

// *** TESTING
router.get('/', function (req, res) {
  res.json({ message: 'LOGIN' });
})
// ***

module.exports = router;
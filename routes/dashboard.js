// Handles dashboard operations (mostly users)
var { Router } = require('express');
var router = Router();

var isEmpty = require('is-empty');

// Get the mongodb url through the environment variables
var mongodb;
const MongoClient = require('mongodb').MongoClient;
// const MongoID = require('mongodb').ObjectID;
const mongoURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;
const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
// const sanitize = require('sanitize-html');

client.connect(async function (err, client) {
  if (err) { throw err; }
  mongodb = client.db("code-explainer");
  console.log("MongoDB connected login");
});

// General Login
router.post('/', async function (req, res) {
  try {
    let { username, hashedPassword } = req.body

    // Check if we get the information what we need
    if (isEmpty(username)) {
      throw "No Username Given";
    }
    if (isEmpty(hashedPassword)) {
      throw "No Password Given";
    }

    let userInfo = (await mongodb.collection("users")
      .find({ "username": username, "password": hashedPassword })
      .toArray())[0];

    if (isEmpty(userInfo)) {
      throw "Incorrect Username or Password";
    }

    res.json(userInfo);
  } catch (e) {
    res.status(401).send(e);
  }
});

// Reset Password
router.post('/reset', async function (req, res) {
  try {
    let { oldHashedPassword, hashedPassword } = req.body

    // Check if we get the information what we need
    if (isEmpty(hashedPassword)) {
      throw "No New Password Given";
    }
    if (isEmpty(oldHashedPassword)) {
      throw "Your old password is incorrect";
    }

    res.status(201).send('OK');

  } catch (e) {
    res.status(401).send(e);
  }
});

module.exports = router;
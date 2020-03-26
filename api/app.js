// REST API for code explainer
var { Router } = require('express');
var router = Router();

// the tokens used throughout the program
const sanitize = require('sanitize-html');

// This is used particularly for cachinge. Since this is a REST API do we need that?
let dbTokens;
let dbRegex;

// Get the mongodb url through the environment variables
// *** UNCOMMENT FOR DATABASE
// var mongodb;
// const MongoClient = require('mongodb').MongoClient;
// const mongoURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;
// const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// client.connect(async function (err, client) {
//   if (err) { throw err; }
//   mongodb = client.db("code-explainer");
//   console.log("MongoDB connected");
// });
// ***

router.get('/test/:lang', async function (req, res, next) {
  // ***
  // req query token: {"type":"storage.type","value":"let","line":"let x = 0; "}
  if (mongodb) {
    let lang = req.params.lang;
    let tokens = await mongodb.collection(lang + "TokenRules").find({}).toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(tokens);
  }
  // ***
});

let prevLang = "";

// GET a list of all the rules for a given language
router.get('/rules/:lang', async function (req, res) {

  // Filter out each of the tokens
  if (mongodb) {

    // Get the incoming tokents
    let tokens = JSON.parse(req.query.tokens);
    let lang = req.params.lang;

    // If we don't have the rules or we just change the language, get them
    if (!dbTokens || prevLang != lang) {
      dbTokens = await mongodb.collection(lang + "TokenRules").find({}).toArray();
    }

    if (!dbRegex || prevLang != lang) {
      dbRegex = await mongodb.collection(lang + "RegexRules").find({}).toArray();
    }

    let rules = {};
    // First make sure we have all our stuff
    if (dbTokens && dbRegex && tokens) {
      tokens.forEach(token => {
        let tokenSig = `${token.type}:${token.value}`;  // Get the token signature
        let found = dbTokens.find(val => val.token == tokenSig); // lets see if it's found in the tokens database
        if (found) {  // If so, then we just stick it in our return result
          found.html = sanitize(found.html, {
            allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2'])
          });  // Just to make sure all our input is squeeky clean
          rules[tokenSig] = found;
        } else { // Otherwise, we check the regex database

          found = dbRegex.find(val => {

            if (!val.regex) { // If we don't have a regex value, then we just check if the types match
              return val.tokenType == token.type;
            } else {
              // Otherwise we check to see if 
              let regy = new RegExp(val.regex, 'g');
              let result = regy.test(token.line) && val.tokenType == token.type;
              return result;
            }

          });
          if (found) {
            found.html = sanitize(found.html, {
              allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2'])
            });
            rules[tokenSig] = found;
          } else {
            // console.log("Token not found: ", token);
          }
        }
      });
    }
    console.log(`RULES2: ${JSON.stringify(rules)}`);
    res.status(200).send(JSON.stringify(rules));
  } else {
    res.status(500).send("Unable to access database");
  }
});

router.post('/feedback', function (req, res) {
  if (mongodb) {
    mongodb.collection("javascriptFeedback").insert(req.body, function (err, resp) {
      if (err) {
        res.status(500).send("ERR");
        throw err;
      }
      res.status(200).send("OK");
    });
  }
});

router.post('/stat', async function (req, res) {
  if (mongodb) {
    let stats = await mongodb.collection("javascriptStats").find({ tag: req.body.tag }).toArray()
    if (stats.length > 0) {
      mongodb.collection("javascriptStats").update({ tag: req.body.tag }, { $inc: { click: 1 } })
    } else {
      mongodb.collection("javascriptStats").insert({ tag: req.body.tag, click: 1 })
    }
    res.status(200).send("OK");
  }
});


module.exports = router;
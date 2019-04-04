console.log('Loading Server ...');
//console.log(__dirname)

//load core modules
const express = require('express');

//load expess middleware
const compression = require('compression');
const logger = require('morgan');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const sanitize = require('sanitize-html');

const MongoClient = require('mongodb').MongoClient;

let dbTokens;
let dbRegex;

let app = express();
app.use(express.static(`${__dirname}/web`));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing 
// app.use(logger("short"));

//use the middleware
// app.use(logger('dev'));

// app.use(compression());

// app.use(favicon(`${__dirname}/web/img/favicon.ico`))

var mongodb;
var mongoURL = "mongodb://localhost:27017/code-explainer";

MongoClient.connect(mongoURL, function(err, db) {
  if(err) { throw err; }
  console.log("MongoDB connected");
  mongodb = db;
});


app.get('/test', async function (req, res) {
  if (mongodb){
    if (!dbTokens){
      dbTokens = await mongodb.collection("tokenRules").find({}).toArray();
    }
    res.status(200).json(dbTokens); 
  }
})

app.get('/', function (req, res) {
    res.status(200).sendFile(`${__dirname}/web/html/index.html`);
});

app.get('/get/rules', async function(req, res) {
  if (mongodb) {
    let tokens = JSON.parse(req.query.tokens);

    //*
    if (!dbTokens){
      dbTokens = await mongodb.collection("tokenRules").find({}).toArray();
    }
    /* */

    /* TEMP ***
    dbTokens = [
      {
        "tag": "bracket",
        "token" : "paren.lparen:[",
        "tokenType" : "paren.lparen",
        "tokenValue" : "[",
        "html": "<h1>Brackets</h1><p>Brackets are used for defining arrays and retrieving data out of them. Arrays are sets of variables that can be any kind of data.</p><pre><code type=\"javascript\">let arr = ['a', 'b'];\n// arr holds both 'a' and 'b'</code></pre><p>To access the different parts of an array, the brackets need to be used with an index that starts count at 0. Any attempt to access an index outside of the array range results in an error.</p><pre><code type=\"javascript\">let arr = [11, 22]\narr[0] // 11\narr[1] // 22\narr[-1] // Error\narr[2] // Error</code></pre><p>Learn more about arrays here <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array\">here</a>.</p>",
        "links" : []
      },
    ];
    // ***/

    //*
    if (!dbRegex){
      dbRegex = await mongodb.collection("regexRules").find({}).toArray();
    }
    /* */

    /* TEMP ***
    dbRegex = [
      {
        "tag": "equalityOperators",
        "regex" : "(==|===|!==|===)",
        "tokenType" : "keyword.operator",
        "html": "<h1>Equality Operators</h1><p>Equality operators compare only if the paried values are identical or not. They are as follows: equal (==), not equal (!=), identical (===), and not identical (!===).</p><pre><code type=\"javascript\">let a = 0;\nlet b = 0;\na == b // true\na != b // false</code></pre><p>The primary difference between the '==' and the '===' operator is that '===' checks type with comparison.</p><pre><code type=\"javascript\">0 == '0' // true\n0 === '0' // false\n0 === 0 // true</code></pre><p>Learn more about equality operations <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators#Equality\">here</a>.</p>",
        "links" : []
      },
    ];
    // ***/

    // <h2>Assignment Operators</h2><p>Javascript also has a shorthand for performing numerical operations on self assigned variables. They follow the same shorthand as the 6 basic operations as well as string concatenation.</p><pre><code type=\"javascript\">let x = 1;\nx += 3; // x == 4\nx *= 3; // x == 12\nlet temp = \"test\";\ntemp += \"ed\"; // temp == \"tested\"</code></pre><h2></h2><p></p>

    let rules = {};

    // First make sure we have all our stuff
    if (dbTokens && dbRegex && tokens){
      tokens.forEach(token => {
        let tokenSig = `${token.type}:${token.value}`;  // Get the token signature
        let found = dbTokens.find(val => val.token == tokenSig); // lets see if it's found in the tokens database
        if (found) {  // If so, then we just stick it in our return result
          found.html = sanitize(found.html, {
            allowedTags: sanitize.defaults.allowedTags.concat([ 'h1', 'h2' ])
          });  // Just to make sure all our input is squeeky clean
          rules[tokenSig] = found;
        } else { // Otherwise, we check the regex database
          
          found = dbRegex.find(val => {

            if (!val.regex){ // If we don't have a regex value, then we just check if the types match
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
              allowedTags: sanitize.defaults.allowedTags.concat([ 'h1', 'h2' ])
            });
            rules[tokenSig] = found;
          } else {
            // console.log("Token not found: ", token);
          }
        }
        /* */
      });
    }
    res.status(200).send(JSON.stringify(rules));
  } else {
    res.status(500).send("Unable to access database");
  }
});

app.get('*', function(req, res) {
  res.status(404).sendFile(`${__dirname}/web/html/404.html`);
});

//start the server
if (!process.env.PORT) { process.env.PORT = 8080 }
if (!process.env.IP) { process.env.IP = "0.0.0.0" }
const server = app.listen(process.env.PORT, process.env.IP, 511, function() {
  console.log(`Server listening on port ${process.env.IP}:${process.env.PORT}`);
})

//server close functions
function gracefulShutdown() {
  console.log();
  console.log('Starting Shutdown ...');
  server.close(function() {
    console.log('Shutdown complete');
    process.exit(0);
  })
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);
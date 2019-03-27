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
// const helmet = require('helmet')
// let ace = require('ace-builds');

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
        "tag": "break",
        "token" : "keyword:break",
        "tokenType" : "keyword",
        "tokenValue" : "break",
        "html": "<h1>break</h1><p>'break' statements are simply used inside loops to end the looping no matter the circumstance. It works for both types of loops.</p><pre><code type=\"javascript\">for (let i = 1; i < 5; i++) {\n  console.log(i)\n  break;\n}\n// this code prints '1'\nlet temp = 'a';\nwhile (temp == 'a') {\n  temp = 'b';\n  break; // this loop ends here\n}</code></pre><p>It is important to note that a break statement only exits the first loop it is contained within. Additional break statements are needed to exit any outer loops.</p><pre><code type=\"javascript\">for (let i = 0; i < 5; i++) {\n  let temp = 'a';\n  while (temp != 'b') {\n    temp = 'b';\n    break; // the 'while' loop stops\n  }\n  // the 'for' loop doesn't\n}</code></pre><p>Learn more about 'break' statements <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break\">here</a>.</p>",
        "links" : ["for", "while", "switch"]
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
        "tag": "string",
        "regex" : "",
        "tokenType" : "string",
        "html": "<h1>String</h1><p>Strings are a combination of characters and one of the <a href=\"https://developer.mozilla.org/en-US/docs/Glossary/Primitive\">primitive data types</a> in javascript. Strings can represent any set of text from any language depending on your browser/computer settings.</p><p>Strings are generally defined by a wrapping of quotation marks (\" \") or apostrophes (' '). Anything inside of these markers is considered part of the String.</p><pre><code type=\"javascript\">let demo = \"I'm a String!\";\ndemo = 'Me too!';</code></pre><p>There are many operations and functions that you can do to change a String, however the most common is concatenation using the \"+\" operator. Any other javascript type that is concatenated is converted first into a String type and then added on.</p><pre><code type=\"javascript\">let x = \"Stringy\" + 123;\nconsole.log(x): // prints \"Stringy123\"</code></pre><p>Learn more about Strings <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String\">here</a></p>",
        "links" : []
      },
    ];
    // ***/

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
if (!process.env.PORT) { process.env.PORT = 8082 }
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
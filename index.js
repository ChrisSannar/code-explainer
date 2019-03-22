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
        "tag": "rightParen",
        "token" : "paren.rparen:)",
        "tokenType" : "paren.rparen",
        "tokenValue" : ")",
        "html": "<h1>Parentheses</h1><p>Parentheses in javascript are used for 3 primary purposes: </p><ul><li>Function declaration and function calls</li><li>Holding conditions for 'if' or 'else if' statements</li><li>Enforcing an order of execution</li></ul><h2>Functions</h2><p>In this context, parentheses are used in both and declaration and calling of a function.</p>",
        "links" : ["function", "if"]
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
        "tag": "comment",
        "regex" : "",
        "tokenType" : "comment",
        "html": "<h2>Comment</h2><p>Comments are simply a way of telling the computer to not read this part of the code.</p><p>Often they are used to describe parts of the code that may be complicated and need an explination, or to summarize what the part of the code does in whole.</p><p>There are primarily two types of comments. The first being a single line comment which begins with '//' and covers the entire line. The second is a multi-line comment which spans many lines and starts with '/*' and ends with '\*\/'.</p><p>You can learn more about comments <a href=\"#\">here</a></p>",
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
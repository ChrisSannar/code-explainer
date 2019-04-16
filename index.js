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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing 
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

app.get('/', function (req, res) {
    res.status(200).sendFile(`${__dirname}/web/html/index.html`);
});

let currentLang;

app.get('/get/rules/:lang', async function(req, res) {

  // console.log(lang, currentLang);

  if (mongodb) {
    let tokens = JSON.parse(req.query.tokens);
    let lang = req.params.lang;
    //*
    if (!dbTokens){
      dbTokens = await mongodb.collection(lang + "TokenRules").find({}).toArray();
    }
    /* */

    /* TEMP ***
    dbTokens = [
      {
        "tag": "print",
        "token" : "storage.type:console",
        "tokenType" : "storage.type",
        "tokenValue" : "console",
        "html": "<h1>Console</h1><p>This keyword is used for debugging purposes to see what values are held at the time it's called. Any value can be passed inside, even null or undefined values.</p><pre><code type=\"javascript\">console.log(2 + 2); // prints 4\nconsole.log('testing'); // prints 'testing'\nlet temp;\nconsole.log(temp); // prints 'undefined'</code></pre><p>To access the console right click on the page and select the 'inspect' option. From there click on the 'console' tab and the results of the operation will be printed there.</p><p>Learn more about the browser console <a href=\"https://developer.mozilla.org/en-US/docs/Web/API/console\">here</a>.</p>",
        "links" : []
      },
    ];
    // ***/

    //*
    if (!dbRegex){
      dbRegex = await mongodb.collection(lang + "RegexRules").find({}).toArray();
    }

    // lang = currentLang;
    /* */

    /* TEMP ***
    dbRegex = [
      {
        "tag": "functionParam",
        "regex" : "",
        "tokenType" : "variable.parameter",
        "html": "<h1>Function Parameter</h1><p>Parameters are variables that are passed into a function from outside its scope. They hold the same values and operations as they would outside the function.</p><pre><code type=\"javascript\">function temp(param1, param2) {\n  console.log(param1 + param2); // this will print 3\n}\n temp(1, 3);</code></pre><p>Learn more about function parameters <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#Function_parameters\">here</a>.</p>",
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

app.post('/feedback', function(req, res) {
  if (mongodb){
    mongodb.collection("javascriptFeedback").insert(req.body, function (err, resp) {
      if (err) {
        res.status(500).send("ERR");
        throw err;
      }
      res.status(200).send("OK");
    });
  }
});

app.post('/stat', async function (req, res) {
  if (mongodb) {
    let stats = await mongodb.collection("javascriptStats").find({tag: req.body.tag}).toArray()    
    if (stats.length > 0) {
      mongodb.collection("javascriptStats").update({tag: req.body.tag}, { $inc: { click: 1}})
    } else {
      mongodb.collection("javascriptStats").insert({tag: req.body.tag, click: 1})
    }
    res.status(200).send("OK");
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
});

//server close functions
function gracefulShutdown() {
  console.log();
  console.log('Starting Shutdown ...');
  server.close(function() {
    console.log('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);
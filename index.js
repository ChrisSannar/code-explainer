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
const MongoClient = require('mongodb').MongoClient;
// const helmet = require('helmet')
// let ace = require('ace-builds');

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


app.get('/', function (req, res) {
    res.status(200).sendFile(`${__dirname}/web/index.html`);
});

app.get('/get/rules', async function(req, res) {
  if (mongodb) {
    let tokens = req.query.tokens;

    let dbTokens = await mongodb.collection("tokenRules").find({}).toArray();
    let dbRegex = await mongodb.collection("regexRules").find({}).toArray();
    
    // *** TEMP
    let stubTokenRules = [
      {
        "tag": "function",
        "token" : "storage.type:function",
        "tokenType" : "storage.type",
        "tokenValue" : "function",
        "html": `
          <h2>Function</h2>
          <p>Functions are bundles of code that can be run on command. They often take input and return output</p>
          <p>Learn more about functions <a href="">here</a></p>
        `,
        "links" : ["functionName", "return"]
      },
      {
        "tag": "let",
        "token" : "storage.type:let",
        "tokenType" : "storage.type",
        "tokenValue" : "let",
        "html": "<p>This is let</p>",
        "links" : []
      },
      {
        "tag": "semicolon",
        "token" : "punctuation.operator:;",
        "tokenType" : "punctuation.operator",
        "tokenValue" : ";",
        "html": `
          <h2>Semicolon</h2>
          <p>This marks the end of a statment inside a javascript file and divides code into different pieces</p>
        `,
        "links" : []
      },
      {
        "tag": "return",
        "token" : "keyword:return",
        "tokenType" : "keyword",
        "tokenValue" : "return",
        "html": `
          <h2>Return</h2>
          <p>Placed inside a return statement, 'return' gives output when you call a function.</p>
        `,
        "links" : ["function"]
      },
      {
        "tag": "rightParen",
        "token" : "paren.rparen:)",
        "tokenType" : "paren.rparen",
        "tokenValue" : ")",
        "html": "<p>This is a right parentheses</p>",
        "links" : ["leftParen"]
      },
      {
        "tag": "leftParen",
        "token" : "paren.lparen:(",
        "tokenType" : "paren.lparen",
        "tokenValue" : "(",
        "html": "<p>This is a left parentheses</p>",
        "links" : ["rightParen"]
      },
      {
        "tag": "rightCurly",
        "token" : "paren.rparen:}",
        "tokenType" : "paren.rparen",
        "tokenValue" : "}",
        "html": `
          <h2>Curly Brace</h2>
          <p>These braces cut the code into different blocks of execution. They are usually preceded by a 'function' or 'conditional statement' to specify what code to run after a sepecific event.</p>
        `,
        "links" : ["leftCurly"]
      },
      {
        "tag": "leftCurly",
        "token" : "paren.lparen:{",
        "tokenType" : "paren.lparen",
        "tokenValue" : "{",
        "html":  `
          <h2>Curly Brace</h2>
          <p>These braces cut the code into different blocks of execution. They are usually preceded by a 'function' or 'conditional statement' to specify what code to run after a sepecific event.</p>
        `,
        "links" : ["rightCurly"]
      },
      {
        "tag": "assignment",
        "token" : "keyword.operator:=",
        "tokenType" : "keyword.operator",
        "tokenValue" : "=",
        "html": "<p>This is an assignment operator</p>",
        "links" : ["variable"]
      }
    ];
    
    let stubRegexRules = [
      {
        "tag": "functionName",
        "regex" : "function\\s+[a-zA-Z][a-z0-9A-Z]*\\(",
        "tokenType" : "entity.name.function",
        "html": `
          <h2>Function Name</h2>
          <p>This give a name by which to refer the function</p>
        `,
        "links" : ["function"]
      },
      {
        "tag": "variable",
        "regex" : ".*",
        "tokenType" : "identifier",
        "html": "<p>This is a variable name</p>",
        "links" : ["let"]
      },
      {
        "tag": "number",
        "regex" : "\\d",
        "tokenType" : "constant.numeric",
        "html": `
          <h2>Number</h2>
          <br>
          <p>Numbers are what you expect: numeric values</p>
          <p>Anything you can do with 
        `,
        "links" : []
      },
      {
        "tag": "whiteSpace",
        "regex" : "\\s",
        "tokenType" : "text",
        "html": `
          <h2>Blank Space</h2>
        `,
        "links" : []
      },
      {
        "tag": "comment",
        "regex" : "",//"\/\/.*",
        "tokenType" : "comment",
        "html": `
          <h2>Comment</h2>
          <p>Comments are simply a way of telling the computer to not read this part of the code.</p>
          <p>Often they are used to describe parts of the code that may be complicated and need an explination, or to summarize what the part of the code does in whole.</p>
          <p>There are primarily two types of comments. The first being a single line comment which begins with "//" and covers the entire line. The second is a multi-line comment which spans many lines and starts with '/*' and ends with ''.</p>
          <p>You can learn more about comments <a href="#">here</a></p>
        `,
        "links" : []
      }
    ];

    let rules = {};

    // parse each of the tokens recieved
    // if (tokens){
      // tokens.forEach(token => {
    if (dbTokens && dbRegex && tokens){
      tokens.forEach(token => {
        let tokenSig = `${token.type}:${token.value}`;
        let found = dbTokens.find(val => val.token == tokenSig);
        if (found) {
          rules[tokenSig] = found;
        } else { 
          
          found = dbRegex.find(val => {
            if (!val.regex){
              val.tokenType == token.type;
            }
            let regy = new RegExp(val.regex, 'g');
            let result = regy.test(token.line) && val.tokenType == token.type;
            return result;
          });
          if (found) {
            rules[tokenSig] = found;
          } else {
            // console.log("Token not found: ", token);
          }
        }
      });
    }
    // ***
/*
    try {
    
      let rules = {};

      // *** Change this so it pulls the token Rules by key instead of pulling them all
      // *** is there a way to set a key for each one?
      let dbTokens = await mongodb.collection("tokenRules").find({}).toArray();
      let dbRegex = await mongodb.collection("regexRules").find({}).toArray();

      let tokenRules = [];
      let regexRules = [];
      // dbTokens.forEach(tok => {
      //   console.log(tok);
      //   tokenRules.push(tok);
      // });
      // dbRegex.forEach(tok => {
      //   console.log(tok);
      //   regexRules.push(tok);
      // });
      console.log(dbTokens);

      if (tokens){
        tokens.forEach(token => {
          let tokenSig = `${token.type}:${token.value}`;
          let found = tokenRules.find(val => val.token == tokenSig);
          if (found) {
            rules[tokenSig] = found;
          } else {
            
            found = regexRules.find(val => {
              if (!val.regex){
                val.tokenType == token.type;
              }
              let regy = new RegExp(val.regex, 'g');
              return regy.test(token.line) && val.tokenType == token.type;
            });
            if (found) {
              rules[tokenSig] = found;
            } else {
              console.log("Token not found: ", token);
            }
          }
        });
      }
      
      res.status(200).send(JSON.stringify(rules));
    } catch (err) {
      throw err;
    }*/
    res.status(200).send(JSON.stringify(rules));
  } else {
    res.status(500).send("Unable to access database");
  }
});

app.get('*', function(req, res) {
  res.status(404).sendFile(`${__dirname}/web/404.html`);
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
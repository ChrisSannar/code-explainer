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

app.get('/', function (req, res) {
    res.status(200).sendFile(`${__dirname}/web/index.html`);
});

app.get('/get/rules', function(req, res) {
  let tokens = req.query.tokens;
  
  // *** TEMP
  let stubbedRules = [
    {
      "tag": "function",
      "token": "storage.type:function",
      "html": "<p>This is a function<p>",
      "links" : ["return"]
    },
    {
      "tag": "semicolon",
      "token": "punctuation.operator:;",
      "html": "<p>This is a semicolon<p>",
      "links" : []
    },
    {
      "tag": "return",
      "token": "keyword:return",
      "html": "<p>This is a return statement<p>",
      "links" : ["function"]
    },
  ];
  // ***

  res.status(200).send(JSON.stringify(stubbedRules));
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
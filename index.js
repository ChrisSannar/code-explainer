console.log('Loading Server ...');

// Load core modules and middleware
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const path = require('path');

// Get our Enviroment Variables
require('dotenv').config();

// Connect to the database for session
const mongooseConnection =
  require(path.join(__dirname, 'util', 'mongoose-connect'))
    (process.env.DB_ADMIN_URI);
const rulesConnection =
  require(path.join(__dirname, 'util', 'mongoose-connect'))
    (process.env.DB_URI);

// Start up the app
let app = express();

// setting up directories, parsing, and middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing 
app.use(compression()); // Compression
app.use(helmet());  // Security
app.use(favicon(`${__dirname}/favicon.ico`));

// If we're in a development environement, use the logger
if (process.env.NODE_ENV === 'development') {
  const logger = require('morgan');
  app.use(logger('dev'));
}

// Error Handlers
// let error = require('./routes/error.js');

// Routes
let codeApp = require('./routes/app')(rulesConnection); // This is for the app to run
let pages = require('./routes/pages'); // This displays the pages of the application

app.use('/app', codeApp);
app.use('/', pages);

// app.use(error.notFound);
// app.use(error.errorHandler);

// Remaining rutes are static
app.use(express.static(`${__dirname}/public`));

// Start the server
if (!process.env.PORT) { process.env.PORT = 8080 }
if (!process.env.IP) { process.env.IP = '0.0.0.0' }
app.set('port', (process.env.PORT || 8080))
const server = app.listen(app.get('port'), process.env.IP, 511, function () {
  console.log(`Server listening on port ${process.env.IP}:${process.env.PORT}`);
});

// Server close functions
function gracefulShutdown() {
  console.log();
  console.log('Starting Shutdown ...');
  server.close(function () {
    console.log('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
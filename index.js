console.log('Loading Server ...');

// Load core modules and middleware
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('morgan');
// const favicon = require('serve-favicon');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Get our Enviroment Variables
require('dotenv').config();

var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB_ADMIN_DOMAIN, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
const MongoStore = require('connect-mongo')(session);  // Used to save the session to the db

// Start up the app
let app = express();

// setting up directories, parsing, and middleware
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing 
app.use(compression()); // Compression
app.use(helmet());  // Security
app.use(logger('dev'));
// app.use(favicon(`${__dirname}/web/img/favicon.ico`));
app.use(session({
  key: 'user_sid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db }),
}));
app.use(cors({    // Allow access from our dashboard app
  origin: process.env.CORS_ORIGIN
}));

// *** TESTING
// app.get('/', function (req, res, next) {
//   res.send('OK');
// });
// ***


// Error Handlers
// let error = require('./routes/error.js');

// Routes
let api = require('./routes/api'); // This is to perform CRUD oprations
let codeApp = require('./routes/app'); // This is for the app to run
// let login = require('./routes/login');  // Login to the application
let pages = require('./routes/pages'); // This displays the pages of the application

app.use('/api/v1', api);
app.use('/app', codeApp);
// app.use('/login', login);
app.use('/', pages);

// app.use(error.notFound);
// app.use(error.errorHandler);

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
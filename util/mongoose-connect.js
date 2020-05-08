// Sets up a connection to the database and all handlers with it
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = function (database) {
  let connection = mongoose.createConnection(database, { useNewUrlParser: true, useUnifiedTopology: true });

  connection.on('error', function () {
    mongoError = true;
    console.error.bind(console, 'connection error:')
  });

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Closing mongoose connection');
      process.exit(0)
    });
  });

  return connection;
}
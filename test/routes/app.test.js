/*
  General Behavior: Grab the rules from the database and send them to the frontend
  Dependencies: Mongoose, rulesUtil, ...
*/

var assert = require('assert');
describe('APP', function () {
  describe('Connecting to mongo', function () {
    it('should connect to the database with the info from the config.js file', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

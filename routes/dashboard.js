// Handles dashboard operations (mostly users)
var express = require('express');
var router = express.Router();
const path = require('path');


router.get('/login', function (req, res, next) {
  res.send('OK');
})

// Server the files statically for the main route
router.use(express.static('dashboard'));

router.get('/', function (req, res, next) {
  res.status(200).sendFile(path.join(__dirname, '..', 'dashboard', 'index.html'));
});

module.exports = router;
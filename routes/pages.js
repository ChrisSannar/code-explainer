var express = require('express');
var router = express.Router();
var path = require('path');

// Serves the main page for the application
router.get('/', function (req, res) {

  // Only send them the main page if they aren't on mobile
  if (/mobile/i.test(req.headers['user-agent'])) {
    res.status(200).sendFile(path.join(__dirname, '..', 'public', 'html', 'mobile.html'));
  } else {
    res.status(200).sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();

var passwordHash = require('password-hash');

// Serves all the pages for the html file
router.get('/', function (req, res) {
  if (/mobile/i.test(req.headers['user-agent'])){
    res.status(200).sendFile(`${__dirname}/web/html/mobile.html`);
  } else {
    res.status(200).sendFile(`${__dirname}/web/html/index.html`);
  }
});

// A page to build new rules
router.get('/build', function (req, res) {
  res.status(200).sendFile(`${__dirname}/web/html/build.html`);
});

// Get the statistics of the entire file
router.get('/stats', async function (req, res) {
  try {
    let stats = await mongodb.collection("javascriptStats").find({}).toArray();
    // console.log(stats);
    
    // res.status(200).json(stats);
    res.status(200).sendFile(`${__dirname}/web/html/stats.html`);
  } catch (e) {
    res.status(500).send(e);
  }
});

let pass = false;
let hash = 'sha1$69a6f84c$1$c1a80e1cadeb6bc4dd1fdb74577d82bbd4f4476e';
router.post('/password', function(req, res) {
  let password = req.body.password;
  if (passwordHash.verify(password, hash)) {
    pass = true;
    res.status(200).send({ status: `SUCCESS` });
  } else {
    pass = false;
    res.status(200).send({ status: `FAIL`});
  }
});

router.get('/admin', function(req, res) {
  if (pass) {
    res.status(200).sendFile(`${__dirname}/web/html/admin.html`);
  } else {
    res.status(200).sendFile(`${__dirname}/web/html/password.html`);
  }
});

router.get('*', function(req, res) {
  res.status(404).sendFile(`${__dirname}/web/html/404.html`);
});


module.exports = router;
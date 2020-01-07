var express = require('express');
var router = express.Router();

// Serves all the pages for the html file

router.get('/', function (req, res) {
  if (/mobile/i.test(req.headers['user-agent'])){
    res.status(200).sendFile(`${__dirname}/web/html/mobile.html`);
  } else {
    res.status(200).sendFile(`${__dirname}/web/html/index.html`);
  }
});

router.get('/build', function (req, res) {
  res.status(200).sendFile(`${__dirname}/web/html/build.html`);
});

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

router.get('*', function(req, res) {
  res.status(404).sendFile(`${__dirname}/web/html/404.html`);
});


module.exports = router;
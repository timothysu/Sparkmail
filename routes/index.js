var express = require('express');
var router = express.Router();
var gm = require('gm');
var paintText = require('./js/paintText');


/* Draw text to base image */
console.log("trying paintText...");
paintText(gm, 'C:/Users/Nick/Github/canadia/public/img/textBase.png', 'hello world', 12, 6);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express', baseImg: './img/textBase.png' });
});

module.exports = router;

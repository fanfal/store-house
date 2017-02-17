var express = require('express');
var router = express.Router();
var db = require('../database.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  //db.get().query("INSERT INTO project (project_name) VALUES ('haha');");
});

module.exports = router;

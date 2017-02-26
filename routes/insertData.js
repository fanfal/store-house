var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")


router.get('/project', function (req, res, next) {
    dbOperation.insertProject(req.query.name);
});

module.exports = router;

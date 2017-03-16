var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")


router.post('/project', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    dbOperation.insertProject(req.body.project_name, res);
});

router.post('/project-info', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    dbOperation.insertProjectInfo(req.body, res);
});

module.exports = router;

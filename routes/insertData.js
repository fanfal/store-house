var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")


router.post('/project', function (req, res, next) {
    dbOperation.insertProject(req.body.project_name);
});

router.post('/projectInfo', function (req, res, next) {
    dbOperation.insertProjectInfo(req.body.project_info);
});

module.exports = router;

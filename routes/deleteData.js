var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dbOperation.js")

router.post('/project-info', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    dbOperation.deleteProjectInfo(req.body.project_info_list, res);
});

module.exports = router;

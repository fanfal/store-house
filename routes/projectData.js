var express = require('express');
var router = express.Router();
var dbOperation = require('../dbOperation.js');

router.get('/project', function (req, res, next) {
    dbOperation.getProject(req.query.name, function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    });
})

router.get('/projects', function (req, res, next) {
    dbOperation.getProjects(function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({project_list: data}));
    });
})

module.exports = router;

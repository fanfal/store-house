var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")

router.get('/project', function (req, res, next) {
    try {
        dbOperation.getProject(req.query.name, function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        });
    } catch (err) {
        //TODO send error back
    }
})


router.get('/projects', function (req, res, next) {
    try {
        dbOperation.getProjects(function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({project_list: data}));
        });
    } catch (err) {
        //TODO send error back
    }

})

router.get('/projectInfo', function (req, res, next) {
    try {
        dbOperation.getProjectInfoByName(req.query.name, function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({project_info_list: data}));
        })
    } catch (err) {
        //TODO send error back
    }
})

router.get('/projectsInfo', function (req, res, next) {
    try {
        dbOperation.getProjectsInfo(req.query.name, function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({project_info_list: data}));
        })
    } catch (err) {
        //TODO send error back
    }
})

module.exports = router;

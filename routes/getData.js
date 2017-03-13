var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")

router.get('/project', function (req, res, next) {
    dbOperation.getProject(req.query.name, res);
})


router.get('/projects', function (req, res, next) {
        if (req.query.status == null) {
            dbOperation.getProjects(res);
        } else {
            dbOperation.getProjectsWithStatus(req.query.status, res);
        }
})


//前端页面分页渲染机制，必须支持该post方法
router.post('/project-info', function (req, res, next) {
    try {
        if (!req.body == {}) {
            dbOperation.getProjectInfoByNameForPaggingRender(req.body.name,
                req.body.cPage,
                req.body.cSize
                , function (data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({'data': data, 'totals': data.length}));
                })
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({'data': {}, 'totals': 0}));
        }
    } catch (err) {
        //TODO send error back
    }
})

router.get('/projects-name', function (req, res, next) {
        dbOperation.getProjectsName(res);
})


router.get('/project-info', function (req, res, next) {
        dbOperation.getProjectInfoByName(req.query.name, res);
})

router.get('/projects-info', function (req, res, next) {
        dbOperation.getProjectsInfo(res);
})

module.exports = router;

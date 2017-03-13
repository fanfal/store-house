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
router.post('/projectInfo', function (req, res, next) {
    try {
        if(req.body.name != ""){
             dbOperation.getProjectInfoByNameForPaggingRender(req.body.name,
                   req.body.offset,
                   req.body.limit
                   ,function (data, total) {
             res.setHeader('Content-Type', 'application/json');
             res.send(JSON.stringify({'rows' : data, 'total' : total}));
        })}
        else {
             res.setHeader('Content-Type', 'application/json');
             res.send(JSON.stringify({'rows' : [], 'total' : 0}));
        }
    } catch (err) {
        //TODO send error back
    }
})

router.get('/projectsName', function (req, res, next) {
        dbOperation.getProjectsName(res);
})


router.get('/projectInfo', function (req, res, next) {
        dbOperation.getProjectInfoByName(req.query.name, res);
})

router.get('/projectsInfo', function (req, res, next) {
        dbOperation.getProjectsInfo(res);
})

module.exports = router;

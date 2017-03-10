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
        if (req.query.status == null) {
            dbOperation.getProjects(function (data) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({project_list: data}));
            });
        } else {
            dbOperation.getProjectsWithStatus(req.query.status, function (data) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({project_list: data}));
            });
        }


    } catch (err) {
        //TODO send error back
    }

})

router.post('/projectInfo', function(req, res, next) {
    try {
        if(req.body.name != ""){
             console.log(req.body.offset);
             console.log(req.body.limit);
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

router.get('/projectInfo', function (req, res, next) {
    try {
        dbOperation.getProjectInfoByName(req.query.name, function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({'data' : data, 'totals' : data.length}));
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

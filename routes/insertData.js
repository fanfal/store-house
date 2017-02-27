var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")


router.post('/project', function (req, res, next) {
    dbOperation.insertProject(req.body.project_name);
    //返回, 必须是这个格式
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify("{'success':true,'id':'1'}"));
});

router.post('/projectInfo', function (req, res, next) {
    dbOperation.insertProjectInfo(req.body.project_info);
});

module.exports = router;

var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dbOperation.js")


router.post('/', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var projectName = req.body.project_name;
    var projectStatus = req.body.status;

    if (projectName == null || projectStatus == null) {
        res.status(400).send(JSON.stringify({errorMessage: "project or status is null"}));
    } else {
        dbOperation.updateProjectStatusByRequest(projectName, projectStatus);
    }
});
module.exports = router;
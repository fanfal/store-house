var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")

router.get("/", function (req, res, next) {
    var projectName = req.query.name;
    var productId = req.query.productId;
    if (projectName == null || productId == null) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({errorMessage: "请确保项目名和产品ID发送成功"}));
        return;
    }

    dbOperation.productOutGoing(projectName, productId, function(data){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({project_info_list: data}));
    });

});

module.exports = router;
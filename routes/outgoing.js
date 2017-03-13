var express = require('express');
var router = express.Router();
var dbOperation = require("../public/dom/dbOperation.js")

router.get("/", function (req, res, next) {
    var projectName = req.query.name;
    var productId = req.query.productId;
    if (projectName == null || productId == null) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({errorMessage: "请确保项目名和产品ID发送成功"}));
        return;
    }

    dbOperation.productOutGoing(projectName, productId, res)
});

module.exports = router;
var express = require('express');
var router = express.Router();
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var dbOperation = require("../public/dom/dbOperation.js")


var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


router.post('/', function (req, res) {
    var exceltojson;
    res.setHeader('Content-Type', 'application/json');
    upload(req, res, function (err) {
        if (err) {
            res.status(400).send({errorMessage: err});
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.status(400).send({errorMessage: "No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            console.log(req.query.name);
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    res.status(400).send({errorMessage: "Data is null"});
                }
                dbOperation.insertProjectInfoByExcel(result, res);
            });
        } catch (e) {
            res.status(400).send({errorMessage: "Corrupted excel file."});
        }
    })
});


module.exports = router;
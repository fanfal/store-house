var db = require('./database')
require('date-utils')

const PROJECT_TABLE = "test";
const PORJECT_INFO_TABLE = "project_info";

const QUERY_PROJECT_WITH_NAME = "SELECT * FROM " + PROJECT_TABLE + " WHERE project_name = '";
const QUERY_PROJECTS = "SELECT * FROM " + PROJECT_TABLE + ";";
const QUERY_PROJECT_INFO = "SELECT * FROM " + PORJECT_INFO_TABLE + " WHERE project_name = '";
const INSERT_PROJECT = "INSERT INTO " + PROJECT_TABLE + " (project_name, time_stamp) VALUES ";

exports.getProject = function (projectName, callback) {
    db.get().query(QUERY_PROJECT_WITH_NAME + projectName + "';", function (err, rows, fields) {
        if (err) {
            console.log("Get project list data error");
            throw err;
        } else {
            callback(rows);
        }
    });
}


exports.getProjects = function (callback) {
    db.get().query(QUERY_PROJECTS, function (err, rows, fields) {
        if (err) {
            console.log("Get project list data error");
            throw err;
        } else {
            callback(rows);
        }
    });
}

exports.getProjectsInfo = function (projectName, callback) {
    db.get().query(QUERY_PROJECT_INFO + projectName + "';", function (err, rows, fields) {
        if (err) {
            console.log("Get project info data error");
            throw err;
        } else {
            callback(rows);
        }
    });
}
exports.insertProject = function (name) {
    db.get().query(INSERT_PROJECT + "('" + name + "', '" + Date.UTCtoday() + "');", function (err, rows, fields) {
        if (err) {
            console.log("Get project info data error");
            throw err;
        }
    });
}

exports.insertProjectInfo = function (data) {

    if (data.project_info != null) {
        db.get().load({tables: data.project_info})
    }

}
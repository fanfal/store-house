var db = require('./database')
const PROJECT_TABLE = "project";
const PORJECT_INFO_TABLE = "info";
const QUERY_PROJECT_WITH_NAME = "SELECT * FROM " + PROJECT_TABLE + " WHERE project_name = '";
const QUERY_PROJECTS = "SELECT * FROM " + PROJECT_TABLE + ";";

exports.getProject = function (projectName, callback) {
    db.get().query(QUERY_PROJECT_WITH_NAME + projectName + "';", function (err, rows, fields) {
        if (err) {
            console.log("Get project list data error");
        } else {
            callback(rows);
        }
    });
}


exports.getProjects = function (callback) {
    db.get().query(QUERY_PROJECTS, function (err, rows, fields) {
        if (err) {
            console.log("Get project list data error");
        } else {
            callback(rows);
        }
    });
}

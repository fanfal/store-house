var project = require("./model/project")
var projectInfo = require("./model/projectInfo")

exports.insertProject = function (projectName) {
    var projectModel = project.projectModel;
    projectModel.sync().then(function () {
        return projectModel.create({
            projectName: projectName,
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });
}

exports.getProject = function (projectName, callback) {
    var projectModel = project.projectModel;
    projectModel.findOne({where: {project_name: projectName}}).then(function (data) {
        callback(data);
    })
}

exports.getProjects = function (callback) {
    var projectModel = project.projectModel;
    projectModel.findAll().then(function (data) {
        callback(data);
    })
}

exports.getProjectsInfo = function (callback) {
    var projectInfoModel = projectInfo.projectInfoModel;
    projectInfoModel.findAll().then(function (data) {
        callback(data);
    })
}

exports.getProjectInfoByName = function (projectName, callback) {
    var projectInfoModel = projectInfo.projectInfoModel;
    projectInfoModel.findOne({where: {project_name: projectName}}).then(function (data) {
        callback(data);
    })
}
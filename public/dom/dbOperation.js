var project = require("./model/project")
var projectInfo = require("./model/projectInfo")

var projectModel = project.projectModel;
var projectInfoModel = projectInfo.projectInfoModel;

exports.insertProject = function (projectName, res) {
    projectModel.build({
            project_name: projectName
        })
        .save()
        .then(function () {
            res.status(200);
            res.send();
        })
        .catch(function (error) {
            res.status(403);
            res.send();
        });
}

exports.insertProjectInfo = function (data, callback) {
    data.forEach(function (element) {
        if (element.project_name != null) {
            projectInfoModel.build({
                    project_name: element.project_name,
                    building: element.building,
                    unit: element.unit,
                    floor: element.floor,
                    number: element.number,
                    position: element.position,
                    type: element.type,
                    width: element.width,
                    height: element.height,
                    is_stored: element.is_stored,
                    product_id: element.product_id
                })
                .save()
                .catch(function (error) {
                    throw error;
                });
        }
    });
}

exports.getProject = function (projectName, callback) {
    projectModel.findOne({where: {project_name: projectName}}).then(function (data) {
        callback(data);
    })
}

exports.getProjects = function (callback) {
    projectModel.findAll({order: 'created_at DESC'}).then(function (data) {
        callback(data);
    })
}

exports.getProjectsInfo = function (callback) {
    projectInfoModel.findAll({order: 'created_at DESC'}).then(function (data) {
        callback(data);
    })
}

exports.getProjectInfoByName = function (projectName, callback) {
    projectInfoModel.findOne({where: {project_name: projectName}, order: 'created_at DESC'}).then(function (data) {
        callback(data);
    })
}
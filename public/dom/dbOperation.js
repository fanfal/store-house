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
            res.status(200).send({"success": true});
        })
        .catch(function (error) {
            console.log('Error occured inser project: ', error);
            res.status(403).send({errorMessage: "project name has exist."});
        });
}

exports.insertProjectInfo = function (data, res) {
    var element = data;
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
            .then(function () {
                res.status(200).send({"success": true});
            })
            .catch(function (error) {
                console.log('Error occured insert project info: ', error);
                res.status(403).send({errorMessage: "project id has exist."});
            });
    }
}

exports.getProject = function (projectName, callback) {
    projectModel.findOne({where: {project_name: projectName}})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get project: ', error);
    });
}

exports.getProjects = function (callback) {
    projectModel.findAll({order: 'operation_status, created_at DESC'})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get projects: ', error);
    });
}

exports.getProjectsName = function (callback) {
    projectModel.findAll({attributes: ['project_name'], order: 'created_at DESC'})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get projects: ', error);
    });
}

exports.getProjectsWithStatus = function (operationStatus, callback) {
    projectModel.findAll({where: {operation_status: operationStatus}, order: 'created_at DESC'})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get projects: ', error);
    });
}

exports.getProjectsInfo = function (callback) {
    projectInfoModel.findAll({order: 'created_at DESC'})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get projects info: ', error);
    });
}

exports.getProjectInfoByName = function (projectName, callback) {
    projectInfoModel.findAll({where: {project_name: projectName}, order: 'created_at DESC'})
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get project info by name: ', error);
    });
}

exports.getProjectInfoByNameForPaggingRender = function (projectName, curPage, sizePerPage, callback) {
    projectInfoModel.findAll({
        where: {project_name: projectName},
        order: 'created_at DESC',
        'limit': sizePerPage,
        'offset': (curPage - 1) * sizePerPage
    }).then(function (data) {
        callback(data);
    }).catch(function (error) {
        console.log('Error occured get project info by name: ', error);
    });
}


exports.productOutGoing = function (projectName, productId, callback) {
    projectInfoModel.findAll({where: {project_name: projectName, product_id: productId, is_stored: true}})
        .then(function (data) {
            if (data.length > 0){
                updateProductStatus(projectName, productId);
            }
            callback(data);
        }).catch(function (error) {
        console.log('Error occured get project info by name and productId ', error);
    });
}

function updateProductStatus(projectName, productId){
    projectInfoModel.update({is_stored:false}, {where: {project_name: projectName, product_id: productId}})
        .catch(function(error){
            console.log('Update product store status error', error);
    });
}

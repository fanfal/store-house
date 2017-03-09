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
            console.log('Error occur insert project: ', error);
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
                console.log('Error occur insert project info: ', error);
                res.status(403).send({errorMessage: "Project id has exist."});
            });
    }
}

exports.getProject = function (projectName, res) {
    res.setHeader('Content-Type', 'application/json');
    projectModel.findOne({where: {project_name: projectName}})
        .then(function (data) {
            res.send(JSON.stringify(data));
        })
        .catch(function (error) {
            console.log('Error occur get project: ', error);
            res.status(400).send({errorMessage: "Get project data has database error."});
        });
}

exports.getProjects = function (res) {
    res.setHeader('Content-Type', 'application/json');
    projectModel.findAll({order: 'operation_status, created_at ASC'})
        .then(function (data) {
            res.send(JSON.stringify({project_list: data}));
        })
        .catch(function (error) {
            console.log('Error occur get projects: ', error);
            res.status(400).send({errorMessage: "Get projects data has database error."});
        });
}

exports.getProjectsName = function (res) {
    res.setHeader('Content-Type', 'application/json');
    projectModel.findAll({attributes: ['project_name'], order: 'created_at ASC'})
        .then(function (data) {
            res.send(JSON.stringify({project_list: data}));
        })
        .catch(function (error) {
            console.log('Error occur get projects: ', error);
            res.status(400).send({errorMessage: "Get projects name data has database error."});
        });
}

exports.getProjectsWithStatus = function (operationStatus, res) {
    res.setHeader('Content-Type', 'application/json');
    projectModel.findAll({where: {operation_status: operationStatus}, order: 'created_at ASC'})
        .then(function (data) {
            res.send(JSON.stringify({project_list: data}));
        })
        .catch(function (error) {
            console.log('Error occur get projects with status: ', error);
            res.status(400).send({errorMessage: "Get projects by status data has database error."});
        });
}

exports.getProjectsInfo = function (res) {
    res.setHeader('Content-Type', 'application/json');
    projectInfoModel.findAll({order: 'created_at ASC'})
        .then(function (data) {
            res.send(JSON.stringify({project_info_list: data}));
        })
        .catch(function (error) {
            console.log('Error occur get projects info: ', error);
            res.status(400).send({errorMessage: "Get project info database error."});

        });
}

exports.getProjectInfoByName = function (projectName, res) {
    res.setHeader('Content-Type', 'application/json');
    projectInfoModel.findAll({where: {project_name: projectName}, order: 'created_at ASC'})
        .then(function (data) {
            res.send(JSON.stringify({'project_info_list': data, 'totals': data.length}));
        })
        .catch(function (error) {
            console.log('Get project info by name has database error: ', error);
            res.status(400).send({errorMessage: "Get project info by name has database error."});
        });
}

exports.getProjectInfoByNameForPaggingRender = function (projectName, curPage, sizePerPage, callback) {
    projectInfoModel.findAll({
            where: {project_name: projectName},
            order: 'created_at DESC',
            'limit': sizePerPage,
            'offset': (curPage - 1) * sizePerPage
        })
        .then(function (data) {
            callback(data);
        })
        .catch(function (error) {
            console.log('Error occured get project info by name: ', error);
        });
}


exports.productOutGoing = function (projectName, productId, res) {
    res.setHeader('Content-Type', 'application/json');
    projectInfoModel.findAll({where: {project_name: projectName, product_id: productId, is_stored: true}})
        .then(function (data) {
            if (data.length > 0) {
                updateProductStatus(projectName, productId, false);
            }
            res.send(JSON.stringify({project_info_list: data}));
        })
        .catch(function (error) {
            console.log('Error occured get project info by name and productId ', error);
            res.status(400).send({errorMessage: "Get project info by name and productId has database error."});

        });
}

function updateProductStatus(projectName, productId, isStored) {
    projectInfoModel.update({is_stored: isStored}, {where: {project_name: projectName, product_id: productId}})
        .catch(function (error) {
            console.log('Update product store status error', error);
        });
}

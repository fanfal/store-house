var project = require("./dom/model/project");
var projectInfo = require("./dom/model/projectInfo");
var path = require('path');
var projectStatus = require("./model/projectStatus");
var dbUtil = require("./utils/dbUtils");

var projectModel = project.projectModel;
var projectInfoModel = projectInfo.projectInfoModel;
var projectType = {
    OPERABLE: 0,       //可以出库
    OPERATING: 1,      //正在出库
    EXHAUSTED: 2        //出库完成
}

exports.insertProject = function (projectName, res) {
    projectModel.findOne({where: {project_name: projectName}})
        .then(function (data) {
            if (data != null) {
                res.status(403).send({errorMessage: "project name has exist."});
            } else {
                insertProject(projectName, res);
            }
        })
        .catch(function (error) {
            console.log('Error occur get project: ', error);
            res.status(400).send({errorMessage: "Query project has database error."});
        });

}

exports.insertProjectInfo = function (data, res) {
    insertProjectInfo(data, res);
}

exports.insertProjectInfoByExcel = function (projectName, datas, res) {
    datas.forEach(function (data) {
        insertProjectInfoFromExcel(projectName, data);
    })
    res.status(200).send({success: true});
}

exports.deleteProjectInfo = function (datas, res) {
    var project_name = [];
    var project_id = [];
    datas.forEach(function (data) {
        project_name.push(data.project_name);
        project_id.push(data.product_id);
    })
    projectInfoModel.destroy({
            where: {
                project_name: project_name,
                product_id: project_id
            }
        })
        .then(function () {
            res.status(200).send({success: true});
        })
        .catch(function (error) {
            res.status(400).send({errorMessage: "Some data is error when delete."});
        })
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
    //get total
    projectInfoModel.findAll({where: {project_name: projectName}}).then(function (data) {
        var count = data.length;
        projectInfoModel.findAll({
            where: {project_name: projectName},
            order: 'created_at DESC',
            'limit': sizePerPage,
            'offset': curPage
        }).then(function (data, total) {
            callback(data, count);
        }).catch(function (error) {
            console.log('Error occured get project info by name: ', error);
        });
    }).catch(function (error) {
        console.log('Error occured get project info by name: ', error);
    });
}

exports.productOutGoing = function (projectName, productId, res) {
    projectInfoModel.findAll({where: {project_name: projectName, product_id: productId, is_stored: true}})
        .then(function (data) {
            if (data.length > 0) {
                updateProductStatusWhenOutGoing(projectName, productId, false);
            }
            res.send(JSON.stringify({project_info_list: data}));
        })
        .catch(function (error) {
            console.log('Error occured get project info by name and productId ', error);
            res.status(400).send({errorMessage: "Get project info by name and productId has database error."});

        });
}

exports.updateProjectStatusByRequest = function (projectName, status) {
    switch (status) {
        case "0":
            updateProjectStatusBaseOnProduct(projectName, function (data) {
                if (data.length > 0) {
                    updateProjectStatus(projectName, status);
                } else {
                    updateProjectStatus(projectName, projectType.EXHAUSTED);
                }
            })
            break;
        case "1":
            updateProjectStatus(projectName, status);
            break;
        default:
            break;
    }
}


function updateProjectStatusBaseOnProduct(projectName, callback) {
    projectInfoModel.findAll({
            where: {
                project_name: projectName,
                is_stored: true
            }
        })
        .then(function (result) {
            callback(result);
        })
}

function updateProjectStatus(projectName, status) {
    projectModel.update({operation_status: status}, {where: {project_name: projectName}});
}

function updateProjectStatusWhenInsertProjectInfo(projectName) {
    projectModel.findOne({where: {operation_status: projectType.EXHAUSTED, project_name: projectName}})
        .then(function (result) {
            if (result != null) {
                updateProjectStatus(projectName, projectType.OPERABLE);
            }
        })
}

function updateProductStatusWhenOutGoing(projectName, productId, isStored) {
    projectInfoModel.update({is_stored: isStored}, {where: {project_name: projectName, product_id: productId}})
        .then(function () {
            updateProjectStatusBaseOnProduct(projectName, function (data) {
                if (data.length == 0) {
                    updateProjectStatus(projectName, projectType.EXHAUSTED);
                }
            });
        })
        .catch(function (error) {
            console.log('Update product store status error', error);
        });
}

function insertProject(projectName, res) {
    projectModel.build({
            project_name: projectName
        })
        .save()
        .then(function () {
            res.status(200).send({success: true});
        })
}


function insertProjectInfo(data, res) {
    if (data.project_name != null) {
        projectInfoModel.findAll({
                where: {
                    project_name: data.project_name,
                    building: data.building,
                    unit: data.unit,
                    floor: data.floor,
                    number: data.number,
                    position: data.position,
                    type: data.type
                }
            })
            .then(function (result) {
                var productId = dbUtil.createProductId(data.project_name, data);

                if (result.length > 0) {
                    if (result[0].is_stored === true) {
                        res.status(400).send({errorMessage: "Product was stored."});
                    } else {
                        projectInfoModel.update({
                                width: data.width,
                                height: data.height,
                                product_id: productId,
                                is_stored: true
                            }, {
                                where: {
                                    project_name: data.project_name,
                                    building: data.building,
                                    unit: data.unit,
                                    floor: data.floor,
                                    number: data.number,
                                    position: data.position,
                                    type: data.type
                                }
                            })
                            .then(function () {
                                updateProjectStatusWhenInsertProjectInfo(data.project_name);
                                res.status(200).send({"success": true});
                            })
                            .catch(function (error) {
                                res.status(400).send({errorMessage: "Update product error."});
                            })
                    }

                } else {
                    projectInfoModel.build({
                            project_name: data.project_name,
                            building: data.building,
                            unit: data.unit,
                            floor: data.floor,
                            number: data.number,
                            position: data.position,
                            type: data.type,
                            width: data.width,
                            height: data.height,
                            is_stored: true,
                            product_id: productId
                        })
                        .save()
                        .then(function () {
                            updateProjectStatusWhenInsertProjectInfo(data.project_name);
                            res.status(200).send({"success": true});
                        })
                        .catch(function (error) {
                            console.log('Error occur insert project info: ', error);
                        });
                }

            })
            .catch(function (error) {
                console.log('Error occur insert project info: ', error);
                res.status(403).send({errorMessage: "Insert project info operation error."});
            })

    } else {
        res.status(400).send({errorMessage: "Must have project name."});
    }
}

function insertProjectInfoFromExcel(name, data) {
    projectInfoModel.findAll({
            where: {
                project_name: name,
                building: data.building,
                unit: data.unit,
                floor: data.floor,
                number: data.number,
                position: data.position,
                type: data.type
            }
        })
        .then(function (result) {
            var productId = dbUtil.createProductId(name, data)

            if (result.length > 0) {
                if (result[0].is_stored != true) {
                    projectInfoModel.update({
                            width: data.width,
                            height: data.height,
                            product_id: productId,
                            is_stored: true
                        }, {
                            where: {
                                project_name: name,
                                building: data.building,
                                unit: data.unit,
                                floor: data.floor,
                                number: data.number,
                                position: data.position,
                                type: data.type
                            }
                        })
                        .then(function () {
                            updateProjectStatusWhenInsertProjectInfo(name);
                        })
                        .catch(function (error) {
                            console.log("Update product error.");
                        })
                }
            } else {
                projectInfoModel.build({
                        project_name: name,
                        building: data.building,
                        unit: data.unit,
                        floor: data.floor,
                        number: data.number,
                        position: data.position,
                        type: data.type,
                        width: data.width,
                        height: data.height,
                        is_stored: true,
                        product_id: productId
                    })
                    .save()
                    .then(function () {
                        updateProjectStatusWhenInsertProjectInfo(name);
                    })
                    .catch(function (error) {
                        console.log('Error occur insert project info: ', error);
                    });
            }

        })
        .catch(function (error) {
            console.log('Error occur insert project info: ', error);
        })
}


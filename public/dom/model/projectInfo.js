var db = require("./../db")
var Sequelize = require('sequelize');

exports.projectInfoModel = db.sequelize.define('project_info', {
    project_name: {
        type: Sequelize.STRING,
        field: 'project_name'
    },
    building: {
        type: Sequelize.INTEGER,
        field: 'building'
    },
    unit: {
        type: Sequelize.INTEGER,
        field: 'unit'
    },
    floor: {
        type: Sequelize.INTEGER,
        field: 'floor'
    },
    number: {
        type: Sequelize.INTEGER,
        field: 'number'
    },
    position: {
        type: Sequelize.STRING,
        field: 'position'
    },
    type: {
        type: Sequelize.STRING,
        field: 'type'
    },
    width: {
        type: Sequelize.FLOAT,
        field: 'width'
    },
    height: {
        type: Sequelize.FLOAT,
        field: 'height'
    },
    is_stored: {
        type: Sequelize.BOOLEAN,
        field: 'is_stored'
    },
    product_id: {
        type: Sequelize.STRING,
        field: 'product_id'
    }
}, {
    underscored: true,
    freezeTableName: true,
    tableName: 'project_info'

});
var db = require("./../db")
var Sequelize = require('sequelize');

exports.projectModel = db.sequelize.define('project', {
    project_name: {
        type: Sequelize.STRING,
        field: 'project_name',
        unique: true
    },
    operation_status:{
        type: Sequelize.INTEGER,
        field:'operation_status'
    }
}, {
    underscored: true,
    freezeTableName: true,
    tableName: 'project'

});
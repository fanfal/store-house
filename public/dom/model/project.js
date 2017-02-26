var db = require("./../db")
var Sequelize = require('sequelize');

exports.projectModel = db.sequelize.define('project', {
    projectName: {
        type: Sequelize.STRING,
        field: 'project_name'
    }
}, {
    underscored: true,
    freezeTableName: true,
    tableName: 'project'

});
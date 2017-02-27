var db = require("./../db")
var Sequelize = require('sequelize');

exports.projectModel = db.sequelize.define('project', {
    project_name: {
        type: Sequelize.STRING,
        field: 'project_name'
    }
}, {
    underscored: true,
    freezeTableName: true,
    tableName: 'project'

});
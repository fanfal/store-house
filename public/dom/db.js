var Sequelize = require('sequelize');
var config = require('config');
exports.sequelize = new Sequelize(config.get("db.database"), config.get("db.user"), config.get("db.pass"), {
    host: config.get("db.host"),
    dialect: config.get("db.driver"),
    pool: {
        max: config.get("db.maxPool"),
        min: 0,
        idle: 10000
    }
});



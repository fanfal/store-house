var Sequelize = require('sequelize');
exports.sequelize = new Sequelize('storehouse', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    }
});



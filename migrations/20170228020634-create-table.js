'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    db.runSql("CREATE TABLE project (" +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "project_name VARCHAR(30) NOT NULL, " +
        "created_at DATETIME , " +
        "updated_at DATETIME , " +
        "PRIMARY KEY (id), " +
        "UNIQUE (project_name)" +
        ");").then(result => db.createTable('project_info', {
        id: {type: 'int', primaryKey: true, autoIncrement: true},
        project_name: 'string',
        building: 'string',
        unit: 'int',
        floor: 'int',
        number: 'int',
        position: 'string',
        type: 'string',
        width: 'float',
        height: 'float',
        is_stored: 'boolean',
        product_id: 'string',
        create_at: 'datetime',
        updated_at: 'datetime'
    })
    );


};

exports.down = function (db) {
    return db.dropTable('project').then(result => db.dropTable('project_info')
    );
};

exports._meta = {
    "version": 1
};

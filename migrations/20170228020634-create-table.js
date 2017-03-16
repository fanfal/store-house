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
   return db.runSql("CREATE TABLE project (" +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "project_name VARCHAR(30) NOT NULL, " +
        "operation_status INT DEFAULT 2, " +
        "created_at DATETIME , " +
        "updated_at DATETIME , " +
        "PRIMARY KEY (id), " +
        "UNIQUE (project_name)" +
        ");").then(result => db.runSql("CREATE TABLE project_info (" +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "project_name VARCHAR(30) NOT NULL, " +
        "building VARCHAR(255), " +
        "unit VARCHAR(255), " +
        "floor VARCHAR(255), " +
        "number VARCHAR(255), " +
        "position VARCHAR(255), " +
        "type VARCHAR(255), " +
        "width FLOAT, " +
        "height FLOAT, " +
        "is_stored BOOLEAN NOT NULL DEFAULT 1, " +
        "product_id VARCHAR(255) NOT NULL, " +
        "created_at DATETIME, " +
        "updated_at DATETIME, " +
        "PRIMARY KEY (id), " +
        "UNIQUE (product_id)" +
        ");")
    );
};

exports.down = function (db) {
    return db.dropTable('project').then(result => db.dropTable('project_info')
    );
};

exports._meta = {
    "version": 1
};

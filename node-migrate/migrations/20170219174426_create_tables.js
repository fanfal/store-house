var PROJECT_TABLE_NAME = "test";


var create_tables = new Migration({
    up: function () {
        this.execute("CREATE TABLE project (" +
            "id INT NOT NULL AUTO_INCREMENT, " +
            "project_name VARCHAR(30) NOT NULL, " +
            "created_at DATETIME , " +
            "updated_at DATETIME , " +
            "PRIMARY KEY (id), " +
            "UNIQUE (project_name)" +
            ");");

        this.create_table("project_info", function (t) {
            t.integer('id', {auto_increment: true});
            t.string('project_name', {limit: 30});
            t.integer('building');
            t.integer('unit');
            t.integer('floor');
            t.integer('number');
            t.string('position');
            t.string('type');
            t.float('width');
            t.float('height');
            t.boolean('is_stored');
            t.string('product_id');
            t.datetime('created_at');
            t.datetime('updated_at');
            t.primary_key('id');
            t.index('project_name');
        })
    },
    down: function () {
        this.drop_table("project");
        this.drop_table("project_info");
    }

});
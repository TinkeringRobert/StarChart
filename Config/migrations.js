module.exports = {
  getList: function() {
    return [
      {func:this.addModules, name:"addModules"},
      {func:this.addModuleRelations, name:"addModuleRelations"}
    ];
  },

  addModules: function(pool, cb){
    pool.query("CREATE TABLE IF NOT EXISTS Modules " +
          "(id        INTEGER   AUTO_INCREMENT, " +
          "identifier CHAR(255) NOT NULL, " +
          "name       CHAR(255) NOT NULL, " +
          "type       CHAR(255) NOT NULL, " +
          "last_seen  DATETIME, " +
          "first_seen DATETIME," +
          "PRIMARY KEY (id)) ");
    cb();
  },

  addModuleRelations: function(pool, cb){
    pool.query("CREATE TABLE IF NOT EXISTS ModulesRelations " +
          "(id        INTEGER AUTO_INCREMENT, " +
          "from_id    INTEGER NOT NULL, " +
          "to_id      INTEGER NOT NULL, " +
          "last_seen  DATETIME, " +
          "first_seen DATETIME," +
          "PRIMARY KEY (id)) ");
    cb();
  }
}

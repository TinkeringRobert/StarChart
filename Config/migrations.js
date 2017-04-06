module.exports = {
  getList: function() {
    return [
      {func:this.addModules, name:"addModules"},
      {func:this.addModuleRelations, name:"addModuleRelations"}
    ];
  },

  addModules: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS Modules " +
          "(id        INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
          "identifier CHAR(255) NOT NULL, " +
          "name       CHAR(255) NOT NULL, " +
          "type       CHAR(255) NOT NULL, " +
          "last_seen  DATETIME, " +
          "first_seen DATETIME) ");
    cb();
  },

  addModuleRelations: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS ModulesRelations " +
          "(id        INTEGER PRIMARY KEY   AUTOINCREMENT, " +
          "from_id    INTEGER NOT NULL, " +
          "to_id      INTEGER NOT NULL, " +
          "last_seen  DATETIME, " +
          "first_seen DATETIME) ");
    cb();
  }
}

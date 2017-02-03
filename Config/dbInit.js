var winston = require('winston');
var sqlite3 = require('sqlite3').verbose();

module.exports = {
  initialize: function(dbFile){
    winston.info('Starting : StarChart DbInit');
    winston.info('-------------------------------------------');
		winston.info("Step 1 : Initialise database   :: " + dbFile.database.infra);
    winston.info("Step 2 : At location           :: " + __dirname);

    var db = new sqlite3.Database(dbFile.database.infra);
    winston.info("Step 3 : Open database at path :: " + db);

    db.serialize(function(err) {
      winston.info("Step 4 : Serialize database    :: " + (err!==undefined ? err : "Success"));
      if(err !== undefined){
        console.log("err :" + err);
      }
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addModules(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addModuleRelations(db);
    });
    winston.info("Step 6 : Close database file   :: Success");
    db.close();
    winston.info("Step 7 : Database created      :: Success");
  }
}

// -------------------------------------------------
// Database table creators
// -------------------------------------------------
function addModules(db){
  winston.info("Add modules database table");

  db.run("CREATE TABLE IF NOT EXISTS Modules " +
        "(id        INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
        "identifier CHAR(255) NOT NULL, " +
        "name       CHAR(255) NOT NULL, " +
        "type       CHAR(255) NOT NULL, " +
        "last_seen  DATETIME, " +
        "first_seen DATETIME) ");
}

function addModuleRelations(db){
  winston.info("Add controllers database table");

  db.run("CREATE TABLE IF NOT EXISTS ModulesRelations " +
        "(id        INTEGER PRIMARY KEY   AUTOINCREMENT, " +
        "from_id    INTEGER NOT NULL, " +
        "to_id      INTEGER NOT NULL, " +
        "last_seen  DATETIME, " +
        "first_seen DATETIME) ");
}

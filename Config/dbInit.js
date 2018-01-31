var key = 'real secret keys should be long and random';
var pool = null;

var winston = require('winston');
var mysql = require('promise-mysql');
var encryptor = require('simple-encryptor')(key);
var async = require('async');
var migrations = require('./migrations');
var moment = require('moment');

module.exports = {
  initialize: function(db, name, cb){
    winston.info('Starting : ' + name + ' DbInit');
    winston.info('-------------------------------------------');
		winston.info("Step 1 : Initialise database   :: " + db.starchart + db.database_postfix);
    winston.info("          Credentials ");
    winston.info(" Address : " + db.hostaddress);
    winston.info(" Username: " + db.username);
    winston.info(" Password: " + db.password);
    pool = mysql.createPool(
      {
        host: db.hostaddress,
        user: db.username,
        password: encryptor.decrypt(db.password),
        database: db.starchart + db.database_postfix,
        connectionLimit: 4
      }
    );
    winston.info("Step 3 : Open database pool conn :: ");

    var step = 4;

    var migrationIndex = getCurrentMigrationIndex(function(migrationIndex) {
      if (migrationIndex === -1) {
        winston.error('Error while creating the migrations');
        return cb(null, 'Database init error');
      }

      var migrationFunctions = migrations.getList();

      if (migrationIndex !== migrationFunctions.length) {

      } else {
        winston.info('Step 4 : No migrations needed ');
        winston.info('-------------------------------------------');
    		return cb(pool);
      }

      winston.info("Step " + step++ + " : total migrations :" + migrationFunctions.length);
      winston.info("Step " + step++ + " : start migration at :" + migrationIndex);
      winston.info("Step " + step++ + " : create migrations list");

      var migArray = [];

      for(migrationIndex; migrationIndex < migrationFunctions.length; migrationIndex++) {
        winston.info("Push index " + migrationIndex);
        migArray.push(
          {
            func: migrationFunctions[migrationIndex].func,
            index: (migrationIndex + 1),
            name: migrationFunctions[migrationIndex].name
          });
      }

      async.eachLimit(migArray, 1, function(migration,callback){
        winston.info("Step " + step++ + " : Run migration with index: " + migration.index + " function : " + migration.name );
        migration.func(pool, function() {
          winston.info("Run migation " + migration.index + " name " + migration.name);
          addMigration(step++, migration.index, migration.name, function()
          {
            callback();
          });
        });

      }, function(err){
        if (err) {
          winston.error('Error durring database migrations :' + err);
        }
        winston.info("Step " + step++ + " : Database created      :: Success");
        winston.info('-------------------------------------------');
        return cb(pool);
      });
    });
  }
}

function getCurrentMigrationIndex(callback){
  var currentCount = 0;

  pool.query("SELECT MAX(count) as count FROM Migrations", function(error, results, fields){
    if(error !== null)
    {
      var insertMigrations =  "CREATE TABLE IF NOT EXISTS Migrations " +
                              "(id        INTEGER AUTO_INCREMENT, " +
                              "count      INTEGER, " +
                              "timestamp  DATETIME, " +
                              "action     CHAR(40) NOT NULL, " +
                              "PRIMARY KEY (id)) ";

      winston.info("Create the migrations table");
      pool.query(insertMigrations, function(error, results, fields)
      {
        addMigration(-1, currentCount, 'createMigrations', function(currentCount){
          return callback(currentCount);
        });
      });
    } else {
      callback(results[0].count);
    }
  });
}

function addMigration(step, count, action, cb){
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  var now = moment();

  pool.query("INSERT INTO Migrations (count, timestamp, action) VALUES (" + count + ",'"+ mysqlTimestamp +"','"+ action +"')").then(function(result){
    return cb(count);
  }).catch(function(err){
    winston.error('addMigration : ' + count + ', Err:' + err);
    return cb(count);
  });
}

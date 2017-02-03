var winston = require('winston');
var broker;

module.exports = {
	update: function(from, to, db)
	{
    winston.silly("IM : Update relation between " + from + ' -> ' + to);
    findRelation(from, to, db, function(rows){

      var index = rows[0].id;
      if (index === null){
        return;
      }
      if (index === -1){
        addRelation(from, to, db);
      }
      updateRelation(from, to, db);
    });
  },

	getAllRelations: function(db, callback){
		winston.debug("    Get relations from database");

    db.serialize(function() {
      db.all("SELECT id, from_id, to_id, last_seen, first_seen FROM ModulesRelations", function(err, rows) {
        if( err !== null)
        {
          winston.error("ERR: " + err);
          return callback("Err: Database call failed getAllModules");
        }
				winston.silly(rows);
        if (rows !== undefined && rows.length > 0)
        {
          callback(null, rows);
        }
        else {
          callback(null, null);
        }
      });
    });
	},

	deleteRelation: function(id, db, callback){
		winston.debug("    Delete relations from database");

		var query = "DELETE FROM ModulesRelations WHERE id = ?";
		var stmt = db.prepare(query);
		stmt.run(id, function(err) {
			if (err)
			{
				winston.error("ERR: " + err);
				stmt.finalize();
				return callback('Err: Database call failed deleteRelation for id : ' + id);
			}
		});
		stmt.finalize();
		return callback();
	}
}

function findRelation(from, to, db, callback){
  db.serialize(function() {
    db.all("SELECT id FROM ModulesRelations WHERE from_id = ? AND to_id = ?", from, to, function(err, rows) {
			if( err !== null )
      {
        winston.error('findRelation : ' + from + ', ' + to + ' Err:' + err);
        return callback(null);
      }
			if (rows !== undefined && rows.length > 0)
      {
				var index = rows;
        callback(index);
      }
      else {
				callback([{id:-1}]);
      }
    });
  });
}

function addRelation(from, to, db){
  var date = new Date();
  date.setMilliseconds(0);

  var stmt = db.prepare("INSERT INTO ModulesRelations (from_id, to_id, first_seen, last_seen) VALUES (?,?,?,?)");
  stmt.run(from, to, date, date, function(err) {
    if (err)
    {
      winston.error('addRelation : ' + from + ', ' + to + ' Err:' + err);
    }
  });
  stmt.finalize();
}

function updateRelation(from, to, db){
  var date = new Date();
  date.setMilliseconds(0);

  db.run("UPDATE ModulesRelations SET last_seen = ? WHERE from_id = ? AND to_id = ?", date, from, to, function(err) {
    if (err)
    {
      winston.error('updateRelation : ' + from + ', ' + to + ' Err:' + err);
    }
  });
}

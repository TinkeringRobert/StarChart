var winston = require('winston');
var moment = require('moment');

module.exports = {
	update: function(from, to, db)
	{
    winston.silly("IM : Update relation between " + from + ' -> ' + to);
    findRelation(from, to, db, function(err, rows){

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

	getAllRelations: function(pool, callback){
		winston.debug("    Get relations from database");
		var queryStr = "SELECT id, from_id, to_id, last_seen, first_seen FROM ModulesRelations";

		//console.log(queryStr);
		pool.query(queryStr, function(err, results){
			//console.log(error);
			// console.log(results);
			// console.log(results.length);
			if( err !== null )
			{
				winston.error('getAllRelations : Err:' + err);
				return callback(err, null);
			}
			// Parse result
			if (results !== undefined && results.length > 0)
			{
				var qres = results;
				callback(null, qres);
			}
			else
			{
				callback(null, null);
			}
		});
	},

	deleteRelation: function(id, db, callback){
		winston.debug("    Delete relations from database");

		var queryStr = "DELETE FROM ModulesRelations WHERE id = " + id;

		//console.log(queryStr);
		pool.query(queryStr, function(error, results){
			//console.log(error);
			//console.log(results.affectedRows);
			if (error)
			{
				winston.error("ERR: " + error);
				return callback('Err: Database call failed deleteRelation for id : ' + id);
			}
			else
			{
				return callback(null, results.affectedRows);
			}
		});
	}
}

function findRelation(from, to, pool, callback){
  // db.serialize(function() {
  //   db.all("SELECT id FROM ModulesRelations WHERE from_id = ? AND to_id = ?", from, to, function(err, rows) {
	var queryStr = "SELECT id FROM ModulesRelations WHERE from_id = "+from+" AND to_id = "+to;

	//console.log(queryStr);
	pool.query(queryStr, function(error, results){
		//console.log(error);
		//console.log(results);
		//console.log(results.length);
		if( error !== null )
		{
			winston.error('findModule : ' + name + ', ' + type + ' Err:' + error);
			return callback('findModule : ' + name + ', ' + type + ' Err:' + error, null);
		}
		// Parse result
		if (results !== undefined && results.length > 0)
		{
			var index = results;
			callback(null, index);
		}
		else {
			callback(null, [{id:-1}]);
		}
	});
}

function addRelation(from, to, pool){
	var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  var queryStr = "INSERT INTO ModulesRelations (from_id, to_id, first_seen, last_seen) VALUES ('"+
    from+"','"+
    to+"','"+
    mysqlTimestamp+"','"+
    mysqlTimestamp+"')";

  //console.log(queryStr);
  pool.query(queryStr, function(error, results){
    //console.log(error);
    //console.log(results);
    if (error)
    {
      winston.error('addRelation : ' + name + ', ' + type + ' Err:' + error);
    }
  });

}

function updateRelation(from, to, pool){
	var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  pool.query("UPDATE ModulesRelations SET last_seen = '"+mysqlTimestamp+"' WHERE from_id = "+ from +" AND to_id = " + to + "", function(error){
    //console.log(error);
    //console.log(results);
    if (error)
    {
      winston.error('updateRelation : ' + from + ', ' + to + ' Err:' + error);
    }
  });
}

var winston = require('winston');
var Haikunator = require('haikunator');
var moment = require('moment');

var haikunator = new Haikunator({
  adjectives: ['Andromeda','Antlia','Apus','Aquarius','Aquila','Ara','Aries','Auriga','Boötes','Caelum','Camelopardalis','Cancer','Canes_Venatici','Canis_Major','Canis_Minor','Capricornus','Carina','Cassiopeia','Centaurus','Cepheus','Cetus','Chamaeleon','Circinus','Columba','Coma_Berenices','Corona_Australis','Corona_Borealis','Corvus','Crater','Crux','Cygnus','Delphinus','Dorado','Draco','Equuleus','Eridanus','Fornax','Gemini','Grus','Hercules','Horologium','Hydra','Hydrus','Indus','Lacerta','Leo','Leo_Minor','Lepus','Libra','Lupus','Lynx','Lyra','Mensa','Microscopium','Monoceros','Musca','Norma','Octans','Ophiuchus','Orion','Pavo','Pegasus','Perseus','Phoenix','Pictor','Pisces','Piscis_Austrinus','Puppis','Pyxis','Reticulum','Sagitta','Sagittarius','Scorpius','Sculptor','Scutum','Serpens','Sextans','Taurus','Telescopium','Triangulum','Triangulum_Australe','Tucana','Ursa_Major','Ursa_Minor','Vela','Virgo','Volans','Vulpecula'],
  nouns: ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon','Phi','Chi','Psi','Omega'],
  defaults: {
      tokenLength: 0,
      delimiter: "_"
  }
});

module.exports = {
	update: function(name, type, pool)
	{
    winston.silly("IM : Update module " + name + ', ' + type);
    findModule(name, type, pool, function(err, rows){
      var index = rows[0].id;
      if (index === null){
        return;
      }
      if (index === -1){
        addModule(name, type, pool);
      }
      updateModule(name, type, pool);
    });
  },

	findModule: function(name, pool, callback)
	{
		winston.silly("IM : Find single module " + name);
		findSingleModule(name, pool, function(err, rows){
			var index = rows[0].id;
			if (index === null){
				return callback(err, null);
			}
			if (index === -1){
				return callback(null, -1);
			}
			return callback(null, index);
		});
	},

	getAllModules: function(pool, callback){
		winston.debug("    Get modules from database");
    var queryStr = "SELECT id, identifier, name, type, last_seen, first_seen FROM Modules";

    //console.log(queryStr);
    pool.query(queryStr, function(err, results){
      //console.log(error);
      //console.log(results);
      //console.log(results.length);
      if( err !== null )
      {
        winston.error('getAllModules : Err:' + err);
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

	deleteModule: function(id, pool, callback){
		winston.debug("    Delete modules from database with id: " + id);

    var queryStr = "DELETE FROM Modules WHERE id = "+id;

    //console.log(queryStr);
    pool.query(queryStr, function(error, results){
      //console.log(error);
      //console.log(results.affectedRows);
      if (error)
			{
				winston.error("ERR: " + error);
				return callback('Err: Database call failed deleteModule for id : ' + id);
			}
      else
      {
        return callback(null, results.affectedRows);
      }
    });
	}
}

function findSingleModule(name, pool, callback){
  var queryStr = "SELECT id FROM Modules WHERE name = '"+name+"'";

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

function findModule(name, type, pool, callback){

  var queryStr = "SELECT id FROM Modules WHERE name = '"+name+"' AND type = '"+type+"'";

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

function addModule(name, type, pool){
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  var queryStr = "INSERT INTO Modules (identifier, name, type, first_seen, last_seen) VALUES ('"+
    haikunator.haikunate()+"','"+
    name+"','"+
    type+"','"+
    mysqlTimestamp+"','"+
    mysqlTimestamp+"')";

  //console.log(queryStr);
  pool.query(queryStr, function(error, results){
    //console.log(error);
    //console.log(results);
    if (error)
    {
      winston.error('addModule : ' + name + ', ' + type + ' Err:' + error);
    }
  });
}

function updateModule(name, type, pool){
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  pool.query("UPDATE Modules SET last_seen = '"+mysqlTimestamp+"' WHERE name = '"+name+"' AND type = '" + type + "'", function(error){
    //console.log(error);
    //console.log(results);
    if (error)
    {
      winston.error('updateModule : ' + name + ', ' + type + ' Err:' + error);
    }
  });
}

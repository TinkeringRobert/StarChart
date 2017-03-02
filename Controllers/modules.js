var winston = require('winston');
var Haikunator = require('haikunator');

var haikunator = new Haikunator({
  adjectives: ['Andromeda','Antlia','Apus','Aquarius','Aquila','Ara','Aries','Auriga','Boötes','Caelum','Camelopardalis','Cancer','Canes_Venatici','Canis_Major','Canis_Minor','Capricornus','Carina','Cassiopeia','Centaurus','Cepheus','Cetus','Chamaeleon','Circinus','Columba','Coma_Berenices','Corona_Australis','Corona_Borealis','Corvus','Crater','Crux','Cygnus','Delphinus','Dorado','Draco','Equuleus','Eridanus','Fornax','Gemini','Grus','Hercules','Horologium','Hydra','Hydrus','Indus','Lacerta','Leo','Leo_Minor','Lepus','Libra','Lupus','Lynx','Lyra','Mensa','Microscopium','Monoceros','Musca','Norma','Octans','Ophiuchus','Orion','Pavo','Pegasus','Perseus','Phoenix','Pictor','Pisces','Piscis_Austrinus','Puppis','Pyxis','Reticulum','Sagitta','Sagittarius','Scorpius','Sculptor','Scutum','Serpens','Sextans','Taurus','Telescopium','Triangulum','Triangulum_Australe','Tucana','Ursa_Major','Ursa_Minor','Vela','Virgo','Volans','Vulpecula'],
  nouns: ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon','Phi','Chi','Psi','Omega'],
  defaults: {
      tokenLength: 0,
      delimiter: "_"
  }
});

module.exports = {
	update: function(name, type, db)
	{
    winston.silly("IM : Update module " + name + ', ' + type);
    findModule(name, type, db, function(rows){
      var index = rows[0].id;
      if (index === null){
        return;
      }
      if (index === -1){
        addModule(name, type, db);
      }
      updateModule(name, type, db);
    });
  },

	findModule: function(name, db, callback)
	{
		winston.silly("IM : Find single module " + name);
		findSingleModule(name, db, function(rows){
			var index = rows[0].id;
			if (index === null){
				return callback(null);
			}
			if (index === -1){
				return callback(-1);
			}
			return callback(index);
		});
	},

	getAllModules: function(db, callback){
		winston.debug("    Get modules from database");

    db.serialize(function() {
      db.all("SELECT id, identifier, name, type, last_seen, first_seen FROM Modules", function(err, rows) {
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

	deleteModule: function(id, db, callback){
		winston.debug("    Delete modules from database");

		var query = "DELETE FROM Modules WHERE id = ?";
		var stmt = db.prepare(query);
		stmt.run(id, function(err) {
			if (err)
			{
				winston.error("ERR: " + err);
				stmt.finalize();
				return callback('Err: Database call failed deleteModule for id : ' + id);
			}
		});
		stmt.finalize();
		return callback();
	}
}

function findSingleModule(name, db, callback){
  db.serialize(function() {
    db.all("SELECT id FROM Modules WHERE name = ?", name, function(err, rows) {
      if( err !== null )
      {
        winston.error('findSingleModule : ' + name + ' Err:' + err);
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

function findModule(name, type, db, callback){
  db.serialize(function() {
    db.all("SELECT id FROM Modules WHERE name = ? AND type = ?", name, type, function(err, rows) {
      if( err !== null )
      {
        winston.error('findModule : ' + name + ', ' + type + ' Err:' + err);
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

function addModule(name, type, db){
  var date = new Date();
  date.setMilliseconds(0);

  var stmt = db.prepare("INSERT INTO Modules (identifier, name, type, first_seen, last_seen) VALUES (?,?,?,?,?)");
  stmt.run(haikunator.haikunate(), name, type, date, date, function(err) {
    if (err)
    {
      winston.error('addModule : ' + name + ', ' + type + ' Err:' + err);
    }
  });
  stmt.finalize();
}

function updateModule(name, type, db){
  var date = new Date();
  date.setMilliseconds(0);

  db.run("UPDATE Modules SET last_seen = ? WHERE name = ? AND type = ?", date, name, type, function(err) {
    if (err)
    {
      winston.error('updateModule : ' + name + ', ' + type + ' Err:' + err);
    }
  });
}

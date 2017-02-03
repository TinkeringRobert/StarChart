const path = require('path');
var mqtt = require('mqtt');
var sqlite3 = require('sqlite3').verbose();
var winston = require('winston');

var modules = require('./modules');
var relations = require('./relations');

var db = null;
var db_initalized = false;
var sub_module_reg;
var sub_modules_relation;

module.exports = {
	initialize: function(params)
	{
		var client  = mqtt.connect(params.mqtt.host);

		winston.debug('Starting : InfraReceiver');
    winston.debug('-------------------------------------------');
		winston.debug('File :' + dbFile.database.infra);
    var db = new sqlite3.Database(dbFile.database.infra);
    db_initalized = true;
    winston.debug('Database initialized');

		client.on('connect', function () {

			// Modules this will be reported at initialisation
			// param: name the name of the module itself
			// param: type the type of the module itself
			sub_module_reg = params.mqtt.prefix + 'module_reg';
			winston.debug('Subscribe to :: ' + sub_module_reg);
		  client.subscribe(sub_module_reg);

			sub_modules_relation = params.mqtt.prefix + 'modules_relation';
			winston.debug('Subscribe to :: ' + sub_modules_relation);
		  client.subscribe(sub_modules_relation);

			// Publish the channel registration
			client.publish(
				sub_module_reg,
			  JSON.stringify({name:params.mqtt.prefix + 'module_reg', type:'queue'})
			);

			// Publish the channel registration
			client.publish(
				sub_module_reg,
				JSON.stringify({name:params.mqtt.prefix + 'modules_relation', type:'queue'})
			);

			// Publish itself
			client.publish(
				sub_module_reg,
			  JSON.stringify({name:'infraReceiver', type:'application'})
			);

			// Publish relation from to channels
			client.publish(
				sub_modules_relation,
				JSON.stringify({from:sub_module_reg, to:'infraReceiver'})
			);

			// Publish relation from to channels
			client.publish(
				sub_modules_relation,
				JSON.stringify({from:sub_modules_relation, to:'infraReceiver'})
			);
		});

		client.on('message', function (topic, message) {
		  // message is Buffer
			if (topic === sub_module_reg){
				//winston.silly(message);

				var module = JSON.parse(message)
				winston.debug('Received module registration : ' + module.name + ', ' + module.type);

				modules.update(module.name, module.type, db);
			} else if (topic == sub_modules_relation) {
				//winston.silly(message);
				var module = JSON.parse(message)

				modules.findModule(module.from, db, function(from_id) {
					if (from_id === null || from_id === -1){
						return winston.debug("Invalid module from id");
					}
					modules.findModule(module.to, db, function (to_id) {
						if (from_id === null || from_id === -1){
 							return winston.debug("Invalid module to id");
 						}
						winston.debug('Received module relation from: ' + module.from + ':' + from_id + ' to: ' + module.to + ':' + to_id);
						relations.update(from_id, to_id, db);
				  });
				});
			} else {
				winston.silly(topic.toString());
			  winston.silly(message.toString());
			}
		});
	},

	getAllModules: function(callback)
	{
		winston.debug('  infra getAllModules');
		if(db === null || db_initalized === false){
			winston.error("Database call not handled db:" + db + " init:" + (db_initalized===true ? "true" : "false"));
			return callback('Err: Database not available');
		}
		modules.getAllModules(db, function(err, result){
			callback(err, result);
		});
	},

	deleteModule: function(id, callback)
	{
		winston.debug('  infra deleteModule');
		if(db === null || db_initalized === false){
			winston.error("Database call not handled db:" + db + " init:" + (db_initalized===true ? "true" : "false"));
			return callback('Err: Database not available');
		}
		modules.deleteModule(id, db, function(err, result){
			callback(err, result);
		});
	},

	getAllRelations: function(callback)
	{
		winston.debug('  infra getAllRelations');
		if(db === null || db_initalized === false){
			winston.error("Database call not handled db:" + db + " init:" + (db_initalized===true ? "true" : "false"));
			return callback('Err: Database not available');
		}
		relations.getAllRelations(db, function(err, result){
			callback(err, result);
		});
	},
}

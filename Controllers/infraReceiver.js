var mqtt = require('mqtt');
var winston = require('winston');

var modules = require('./modules');
var relations = require('./relations');

var db_initalized = false;
var sub_module_reg;
var sub_modules_relation;
var pool = null;

module.exports = {
	initialize: function(params, dbPool)
	{
		var client  = mqtt.connect(params.mqtt.host);

		winston.debug('Starting : StarChart');
    winston.debug('-------------------------------------------');
		winston.debug('File :' + params.database.starchart);
    db_initalized = true;
		pool = dbPool;
		winston.debug('Database loaded');
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

			broadcastUpdate(client, params);

			var interval = setInterval(function() {
				broadcastUpdate(client, params);
			}, 5 * 60 * 1000); // 5 minutes
		});

		client.on('message', function (topic, message) {
		  // message is Buffer
			if (topic === sub_module_reg){
				//winston.silly(message);

				var module = JSON.parse(message)
				winston.debug('Received module registration : ' + module.name + ', ' + module.type);

				modules.update(module.name, module.type, pool);
				winston.debug('Registration passed');
			} else if (topic == sub_modules_relation) {
				//winston.silly(message);
				var module = JSON.parse(message)

				modules.findModule(module.from, pool, function(err, from_id) {
					if (from_id === null || from_id === -1){
						return winston.debug("Invalid module from id");
					}
					modules.findModule(module.to, pool, function (err, to_id) {
						if (from_id === null || from_id === -1){
 							return winston.debug("Invalid module to id");
 						}
						winston.debug('Received module relation from: ' + module.from + ':' + from_id + ' to: ' + module.to + ':' + to_id);
						relations.update(from_id, to_id, pool);
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
		winston.debug('  starchart getAllModules');

		if(pool === null || db_initalized === false){
		 	winston.error("Database call not handled db:" + pool + " init:" + (db_initalized===true ? "true" : "false"));
		  return callback('Err: Database not available');
		}
		modules.getAllModules(pool, function(err, result){
		  callback(err, result);
		});
	},

	deleteModule: function(id, callback)
	{
		winston.debug('  starchart deleteModule');
		if(pool === null || db_initalized === false){
			winston.error("Database call not handled db:" + pool + " init:" + (db_initalized===true ? "true" : "false"));
			return callback('Err: Database not available');
		}
		modules.deleteModule(id, pool, function(err, result){
			callback(err, result);
		});
	},

	getAllRelations: function(callback)
	{
		winston.debug('  starchart getAllRelations');
		if(pool === null || db_initalized === false){
			winston.error("Database call not handled db:" + pool + " init:" + (db_initalized===true ? "true" : "false"));
			return callback('Err: Database not available');
		}
		relations.getAllRelations(pool, function(err, result){
			callback(err, result);
		});
	},
}

function broadcastUpdate(client, params) {
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
		JSON.stringify({name:'StarChart', type:'application'})
	);

	// Publish relation from to channels
	client.publish(
		sub_modules_relation,
		JSON.stringify({from:sub_module_reg, to:'StarChart'})
	);

	// Publish relation from to channels
	client.publish(
		sub_modules_relation,
		JSON.stringify({from:sub_modules_relation, to:'StarChart'})
	);

	return;
}

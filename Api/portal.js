var winston = require('winston');
var pjson = require('../package.json');
var async = require('async');
var http = require('http');

var lParams;
module.exports = {
	initialize: function(params, app, infraRecv)
	{
		lParams = params;
    app.delete('/:id', function (req, res) {
      winston.debug('Delete module :: ' + req.params.id);
      infraRecv.deleteModule(req.params.id, function(err, result){
        if (err){
          return res.status(500).send('deleteModule :: ' + err);
        }
        return res.status(200).send({remove:result});
      });
    })

    app.get('/allModules', function (req, res) {
      winston.debug('Get basic module information');
      infraRecv.getAllModules(function(err, result){
        if (err){
          return res.status(500).send('getAllModules :: ' + err);

        }
        return res.status(200).send(result);
      });
    })

    app.get('/allRelations', function (req, res) {
      winston.debug('Get relation information');
      infraRecv.getAllRelations(function(err, result){
        if (err){
          return res.status(500).send('getAllRelations :: ' + err);

        }
        return res.status(200).send(result);
      });
    })

    app.get('/status', function (req, res) {
      res.json({status: 'online', application: pjson.name, version: pjson.version, description: pjson.description});
    })

		app.get('/statusAll', function(req, res) {
			getStatusAllModules( function(result) {
				res.json(result);
			});
		})
  }
}

// Function to get the status of all applications
function getStatusAllModules(callback) {
	var results = [];
	async.each(lParams.application_port, function(port, cb) {
		var options = {
			host: lParams.server_ip,
			port: port,
			path: '/status'
		};

		http.get(options, function(request) {
	 	var body = '';
	 	request.on('data', function(chunk) {
	 		body += chunk;
	 	});
	 	request.on('end', function() {
	 		var result = JSON.parse(body);
			// Add port number to the results
			result.port = port;
			results.push(result);
			cb();
	 	});
	 }).on('error', function(e) {
		 // Add port number for offline service
		 results.push({status: 'offline', port: port});
 		 cb();
	 });
	}, function(err) {

		callback(results);
	});
}

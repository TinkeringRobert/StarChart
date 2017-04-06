var express = require('express');
var winston = require('winston');

// Application settings
var isWin = /^win/.test(process.platform);
if (isWin){
  var params = require('../Gravitation/Windows');
}
else{
  var params = require('../Gravitation/Linux');
}

//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
winston.level = 'info';

var app = express();

var pjson = require('./package.json');
var dbInit = require('./Config/dbInit');
// Local requires
var infraRecv = require('./Controllers/infraReceiver');
var portal = require('./Api/portal');

function initialize(){
  winston.info('Boot Infra manager Starting');
  winston.info(JSON.stringify(params,null,4));

  dbInit.initialize(params.database.starchart, 'StarChart', function(){
    infraRecv.initialize(params);
    portal.initialize(params, app, infraRecv);

    app.listen(params.application_port.starchart, function () {
      winston.info('StarChart active on port ' + params.application_port.starchart)
    });

    winston.info("Boot StartChart started");
  });
};

initialize();

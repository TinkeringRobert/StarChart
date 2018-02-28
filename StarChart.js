var bodyParser = require('body-parser');
var express = require('express');
var pjson = require('./package.json');
var winston = require('winston');

//*************************************************************************
// Application settings
//*************************************************************************
var isWin = /^win/.test(process.platform);
if (isWin){
  var params = require('../Gravitation/Windows');
}
else{
  var params = require('../Gravitation/Linux');
}
//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
winston.level = 'info';

//*************************************************************************
// Local requires
//*************************************************************************
var dbInit = require('../Gravitation/Tools/dbInit');
var migrations = require('./Config/migrations');
var infraRecv = require('./Controllers/infraReceiver');
var portal = require('./Api/portal');

//*************************************************************************
// Service http functions
//*************************************************************************
var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//*************************************************************************
// Service initialisation
//*************************************************************************
function initialize(){
  winston.info('Boot :: ' + pjson.name + ' :: ' + pjson.version);

  dbInit.initialize(
    params.database,
    params.database.starchart,
    pjson.name,
    migrations,
    function(pool, err) {
      // Pool is database interface
      infraRecv.initialize(params, pool);
      portal.initialize(params, app, infraRecv);

      app.listen(params.application_port.star_chart, function () {
      winston.info(pjson.name + ' server gestart op poort ' + params.application_port.star_chart)
    });
  });
};

initialize();

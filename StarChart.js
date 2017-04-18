var express = require('express');
var winston = require('winston');
var bodyParser = require('body-parser');

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

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/status', function (req, res) {
  res.json(
    {
      status: 'online',
      application: pjson.name,
      version: pjson.version,
      description: pjson.description
    }
  );
});

function initialize(){
  winston.info('Boot Infra manager Starting');
  winston.info(JSON.stringify(params,null,4));

  dbInit.initialize(params.database.starchart, 'StarChart', function(){
    infraRecv.initialize(params);
    portal.initialize(params, app, infraRecv);

    app.listen(params.application_port.star_chart, function () {
      winston.info('StarChart active on port ' + params.application_port.star_chart)
    });

    winston.info("Boot StartChart started");
  });
};

initialize();

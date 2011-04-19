// requires & objects ------------------------------------------------------
var express = require('express');
var util = require('util');
var http = require('http');
var mongoose = require('mongoose');

// variables ---------------------------------------------------------------
var port = 8124;
var msg_limiter = '~|~';
var cmd_limiter = '~%~';
var is_verbose = false;
var app;
var LogrMessageModel;
var db;

var last_project = '';
var filters_type = [];

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

function run() {
  if(process.argv.length === 7) {
    setup_db(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);

    // init app
    init_app(port);
  } else {
    console.log('# Arguments mismatch.');
    console.log('$ node app.js db_host db_port db_user db_pass db_name');

    process.exit(1);
  }  
}

function init_app() {
  app = express.createServer();

  // configure app
  app.configure(function() {
    // enable haml view engine
    app.register('.haml', require('hamljs'));
    app.set('view engine', 'haml');

    // use bodyparser for form POST
    app.use(express.bodyParser());

    // static file provider
     app.use(express.static(__dirname + '/public')); 
  });

  //------------------------------------------------------------------------
  // routes
  //------------------------------------------------------------------------

  // get unique project types
  app.get('/', function(req, res) {
    get_projects(res);
  });

  // get logs for a projects
  app.get('/:project', function(req, res) {
    // first parse the logr types
    if(last_project != req.params.project) {
      parse_filter_types(req.params.project, res, function(){
        get_logs_by_project(req.params.project, res);
      });
    } else {
      get_logs_by_project(req.params.project, res);
    }
  });

  // post for filter
  app.post('/:project', function(req, res) {
    console.dir(req.body);
    //get_logs_by_project_by_type(req.params.project, req.body.logtype, res);
    
    get_logs(res, [], {
        project: req.params.project,
        type: req.body.logtype
      },{
        'limit': 10,
        'sort': parse_sort(req.body.sort)},
      {'project': req.params.project}, {'project': req.params.project});

  });

  app.listen(port);

  util.log('###############################');
  util.log('# Webserver ready');
  util.log('# Listening on port ' + port);
  util.log('################################');
}

function setup_db(host, port, user, pass, db_name) {
	util.log('# database setup');
	
	var conn = 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db_name;
	
	db = mongoose.connect(conn);
	
	util.log('# Connected to \'' + conn + '\'');

	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var LogrMessage = new Schema({
		id: ObjectId, 
		guid: String, 
		msg: String, 
		type: String, 
		meta: String, 
		project: String, 
		uid: String, 
		date: {type: Date, default: Date.now}
	});

	mongoose.model('LogrMessage', LogrMessage);

  LogrMessageModel = mongoose.model('LogrMessage');
}

function parse_sort(sort) {
  try {
    util.log(sort);
    JSON.parse(sort);
    return JSON.parse(sort);
  } catch(err) {
    console.log('ERR: error parsing JSON sort');
    console.log(err);
    return {};
  }
}

function parse_dates(logs) {
  for( var i in logs) 
    logs[i].date = new Date(logs[i].date);
}

function parse_filter_types(project, res, callback) {
  util.log("parse_filter_types");
  last_project = project;

  LogrMessageModel.find({project: project}, ['type'], function(err, logtypes) {
    for (var i = 0; i < logtypes.length; i++) {
      if(!filters_type.contains(logtypes[i].type))
        filters_type.push(logtypes[i].type);
    }

    callback();
  });
}

function get_projects(res) {
  var projects = new Array();

  LogrMessageModel.find({}, ['project'], {'group': 'type'}, function(err, logs) {
    for(var i = 0; i < logs.length; i++){
      var log = logs[i];

      if(!projects.contains(log.project))
        projects.push(log.project);
    }

    res.render('index', {'title': 'Proximity Logr', 'projects': projects} );
  });
}

function get_logs_by_project(project, res, callback) {
  util.log("get_logs_by_project");
  LogrMessageModel.find({project: project}, [], {'limit': 10, 'skip': 1, 'sort' : {'date': -1}}, function(err, logs) {
    
    parse_dates(logs);
    
    res.render(
      'project', {
        'title': 
        'Proximity Logr', 
        'logs': logs, 
        'project': project, 
        'logtypes': filters_type
      });
  });
}

function get_logs_by_project_by_type(project, logtype, res, callback) {
  util.log("get_logs_by_project_by_type");
  LogrMessageModel.find({project: project, type: logtype}, function(err, logs) {

    parse_dates(logs);

    res.render(
      'project', {
        'title': 'Proximity Logr',
        'logs': logs, 
        'project': project, 
        'logtypes': filters_type
      });
  });
}

function get_logs(res, fields, where_clause, ops, appdata, callback) {
  LogrMessageModel.find(where_clause, fields, ops, function(err, logs) {
    
    parse_dates(logs);
    
    res.render(
      'project', {
        'title': 
        'Proximity Logr', 
        'logs': logs, 
        'project': appdata.project,
        'logtypes': filters_type
      });
  });
}

run();


/*
TODO: 
Make loading of services and agents from arbitrary locations possible in a sane way

*/

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');

var Eve = require('eve-nodejs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// app.use(express.bodyParser()); //dont really seem to need this?
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// 
var eveOptions = {
	services: { topics: {}, evep2p: {transports: {localTransport: {}, httpRequest: {} } } }, // httpRequest 
	//agents: {filename: "mathAgent.js" }
	agents: {}  //currently agents at startup can only be loaded from the eve/agents directory... TODO: fix that!
} 

var eve = new Eve(eveOptions);

// add our own custom learning modules service to eve
var LearningService = require('./learningmodules/learning');
eve.addService(LearningService, {}, 'learning');

var ProxyAgent = require('./agents/esbProxyAgent');
eve.addAgent(ProxyAgent, 'esbProxy', 'agents/esbProxypAgent.js', {});

var WorkerAgent = require('./agents/workerAgent');
eve.addAgent(WorkerAgent, 'Remco', 'agents/workerAgent.js', {});
eve.addAgent(WorkerAgent, 'Ludo', 'agents/workerAgent.js', {});
eve.addAgent(WorkerAgent, 'Giovanni', 'agents/workerAgent.js', {});



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/management', routes.management);
//app.get('/users', user.list);
app.post('/agents/*', eve.incomingFromExpress);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



///////////////         testing code

// generating event messages in lieu of the esb service for testing purposes
var randgen = require('randgen');
var jobTimes = {Ludo:20, Giovanni:30, Remco:40};

function generateNewJob(worker) {
	console.log("new job for " + worker);
	var date = new Date();
	var message = {id:0, method:"routeEvent", params:{worker:worker, type: "jobStarted", timestamp: date.getTime() }};
	//send event to esbproxy agent
	eve.useServiceFunction("send", "local://esbProxy", message, function(answer){ console.log(answer); }); 

	//take a random number from a distribution centered around jobTimes[worker]
	var realTime = randgen.rnorm(jobTimes[worker], 10);
	if (realTime < 2) realTime = 2; // making sure we dont have negative or ultrashort times
	console.log(realTime);

	setTimeout(function() {
		var date2 = new Date();
		var message2 = {id:0, method:"routeEvent", params:{worker:worker, type: "jobFinished", timestamp: date2.getTime() }};
		//send event to esbproxy agent
		eve.useServiceFunction("send", "local://esbProxy", message2, function(answer){ console.log(answer); }); 

		console.log("task finished for " + worker);
		setTimeout(function() { generateNewJob(worker); }, 2000); // and send the worker a new job
	}, realTime * 1000);

}

generateNewJob("Remco");
generateNewJob("Giovanni");
generateNewJob("Ludo");



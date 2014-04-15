/*

	This agent represents a worker and keeps track of the events coming in

*/

var myAgent = {RPCfunctions: {}};

myAgent.init = function() {

	var working = false;
	var timeout = null;
	var startTime = null;
	
	var expectedTime = null; //TODO: set sane defaults here
	var minTime = null;
	var maxTime = null;
	
	this.registerAddressForRPCs('http', "agents/" + this.agentName);  

	var timeline = []  // schedule format: array of {id:i, content:task, start:date.getTime(), end:date2.getTime()} objects

	//TODO instantiate module
	//var that = this;
	//setTimeout(function() { 
	//	that.learningModule = that.getModule('EveModule'); 
	//	that.learningModule.WriteInfrared(10);
	//} , 1000);

	//TODO register callback for incoming messages from module and setting the expected, min and maxTime variables
	
	// no further init necessary
	console.log("worker Agent (Remco) added");
}

/*
	incoming event; for this demo, only 'jobStarted' or 'jobFinished'
*/
myAgent.RPCfunctions.processEvent = function(params, callback) {

	if (params.type == "jobStarted") {
		if (working == true) {
			callback({result: null, error:"was already working"}) //id should be inserted by utilityFunctions.. (check if it works)
			return;
		}
		working = true;
		//TODO startTime = now

		//TODO let the learning modules know something happened
		
		//TODO start the timeout based on the currently known maxTime; if it takes too long, generate an event and add to timeline

		callback({result:"confirmed"});
		return;
	}
	
	if (params.type == "jobFinished") {

		if (working == false) {
			callback({result: null, error:"was already finished"}) //id should be inserted by utilityFunctions.. (check if it works)
			return;
		}
		working = false;

		//TODO: add period to the timeline

		//TODO if (now - startTime < minimalTime) {
		//	generate warning event and add to timeline
		//}
		

		//TODO let the learning modules know something happened

		//TODO:
		// remove timeout
		// remove startTime

		callback({result:"confirmed"});
		return;
	}

};

myAgent.RPCfunctions.getHistory = function(params, callback) {

	callback(result:timeline);
};

//TODO a function to reset the learned stuff?


myAgent.RPCfunctions.getState = function(params, callback) {

	callback(result:{busy:working, start:startTime, minDuration:minTime, maxDuration:maxTime, expectedDuration:expectedTime });
};

/*
myAgent.RPCfunctions.indirectAdd = function(params, callback) {
	// just a function to see whether http transport is still working correctly when using an external http server

	this.send("http://127.0.0.1:3000/agents/" + this.agentName,  ///hrmm... prefix?
						{method:"add", id:0, params: {a: params.a, b: params.b} }, 
						function(answer){ callback(answer); }); //dont have to do anything with the answer... we're just pushing the result


};
*/

var AgentBase = require("./agentBase2.js");  // requiring the factory that will wrap a constructor function around our code
module.exports = AgentBase(myAgent);



/*

	ESB proxy agent, routing esb messages to the right agent and possibly keeping track of ontology

	this agent should have the address localhost:3000/agents/esbproxy

	TODO: check whether this proxy is actually necessary or that we can move all this functionality to the ESB service

*/


var myAgent = {RPCfunctions: {}};

myAgent.init = function() {
	
	this.registerAddressForRPCs('http', "agents/" + this.agentName);  


	// no further init necessary
	console.log("ESB proxy agent instantiated");
}

myAgent.RPCfunctions.routeEvent = function(params, callback) {
	// just a function to route an event to the right agent over the internal transport

	/*
		we expect the following params:

			type : "jobStarted" / "jobFinished"
			worker : "Remco" / "Giovanni" / "Ludo"
			timestamp : date

	*/

	this.send("local://" + params.worker, {method:"processEvent", id:0, params: {type: params.type, timestamp: params.timestamp} }, 
		function(answer){ callback(answer); }); //dont have to do anything with the answer... we're just passing it along

};

myAgent.RPCfunctions.generateEvent = function(params, callback) {
	//function to give useful output to ARUM

	/*
		we expect the following params:

			type: "delayedJob" / "briefJob"
			worker: "Remco" / "Giovanni" / "Ludo"
			timestamp: date
			
	*/

	console.log("generating ESB event! " + params.type + params.worker);

	//TODO send to the esb service
/*
	this.send("http://127.0.0.1:3000/esbServiceAgent", 
						{method:"fireEvent", id:0, params: {a: params.a, b: params.b} }, 
						function(answer){ callback(answer); }); //dont have to do anything with the answer... we're just pushing the result
*/

}

var AgentBase = require("./agentBase2.js");  // requiring the factory that will wrap a constructor function around our code
module.exports = AgentBase(myAgent);



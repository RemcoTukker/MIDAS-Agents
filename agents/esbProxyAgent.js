
/*

	ESB proxy agent, routing esb messages to the right agent and possibly keeping track of ontology

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
	this.send("http://127.0.0.1:3000/agents/" + this.agentName,  ///hrmm... prefix?
						{method:"add", id:0, params: {a: params.a, b: params.b} }, 
						function(answer){ callback(answer); }); //dont have to do anything with the answer... we're just pushing the result
*/

};

myAgent.RPCfunctions.generateEvent = function(params, callback) {
	//function to give useful output to ARUM

	//TODO send to the esb service
}

var AgentBase = require("./agentBase2.js");  // requiring the factory that will wrap a constructor function around our code
module.exports = AgentBase(myAgent);



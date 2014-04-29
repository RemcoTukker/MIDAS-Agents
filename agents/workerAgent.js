/*

	This agent represents a worker and keeps track of the events coming in 

	this agent should have the address local://Remco (or another name) and perhaps also http://localhost:3000/agents/Remco 

*/

var myAgent = {   // this stuff sits in the prototype, shared between agents instantiated from this file
	RPCfunctions: {}
};


myAgent.init = function() { // this is stuff that is specific to the agent

	this.working = false;
	this.timeout = null;
	this.startTime = null;
	this.expectedTime = null; //TODO set sane defaults here (?)
	this.minTime = null;
	this.maxTime = null;
	this.timelineId = 0;
	this.timeline = []; // schedule format: array of {id:i, content:task, start:date.getTime(), end:date2.getTime()} objects
	

	this.registerAddressForRPCs('http', "agents/" + this.agentName);  

	this.learningModule = this.getModule('MeanAndVarianceModule');

	var that = this;
	this.learningModule.RegReadMean(function(mean){
		that.expectedTime = mean;
		console.log("settting mean for " + that.agentName + " to: " + mean);
	});

	this.learningModule.RegReadVariance(function(variance){
		if (variance > 0) {
			that.minTime = that.expectedTime - Math.sqrt(variance);
			that.maxTime = that.expectedTime + 2 * Math.sqrt(variance);
			console.log("settting min/max for " + that.agentName + " to: " + that.minTime + " / " + that.maxTime);

		}
	});

	// no further init necessary
	console.log("worker Agent (Remco) added");
}

/*
	incoming event; for this demo, only 'jobStarted' or 'jobFinished'
*/
myAgent.RPCfunctions.processEvent = function(params, callback) {

	/*
		we expect the following params:

			type : "jobStarted" / "jobFinished"
			worker : "Remco" / "Giovanni" / "Ludo"
			timestamp : date

		only type is used here; messages are supposed to be sent at the same moment as the timestamp is placed 
		(and arrive in order; we're robust to out of order arrivals though, it just means we'll learn from wrong data)

	*/

	if (params.type == "jobStarted") {
		if (this.working == true) {
			callback({result: null, error:"was already working"}) //id is inserted by utilityFunctions.. 
			return;
		}
		this.working = true;
		this.startTime = new Date(); //startTime = now

		console.log("job assignment arrived");

		//start the timeout based on the currently known maxTime; if it takes too long, generate an event and add to timeline
		if (this.maxTime != null) {
			var that = this;
			this.timeout = setTimeout( function() { 
				var now = new Date();
				that.send("local://esbProxy", {method:"generateEvent", id:0, params: {type: "delayedJob", worker: that.agentName, timestamp: now.getTime()} }, 
						function(answer){ console.log(answer); }); //dont have to do anything with the answer... 
				// add event to timeline		
				that.timeline.push({id:that.timelineId, content:"jobDelayed", start: now.getTime()});
				that.timelineId++;
			}, this.maxTime * 1000);
		}

		this.timeline.push({id:this.timelineId, content:"jobStarted", start: this.startTime.getTime()});
		this.timelineId++;

		callback({result:"confirmed"});
		return;
	}
	
	if (params.type == "jobFinished") {

		if (this.working == false) {
			callback({result: null, error:"was already finished"}) //id is inserted by utilityFunctions
			return;
		}
		this.working = false;

		var now = new Date(); 
		var duration = now - this.startTime; // duration is a number in milliseconds

		// find the last jobStarted in the timeline and edit it so that it becomes a period
		for (var i = 1; i <= this.timeline.length; i++) {
			if (this.timeline[this.timeline.length - i].content == "jobStarted") {
				this.timeline[this.timeline.length - i].content = "job";
				this.timeline[this.timeline.length - i].end = now.getTime();
				console.log("job in timeline converted to period");
				break;
			}
		}
		
		if (duration / 1000 < this.minTime) {
		//	generate warning event 
			this.send("local://esbProxy", {method:"generateEvent", id:0, params: {type: "briefJob", worker: this.agentName, timestamp: now.getTime()} }, 
					function(answer){ console.log(answer); }); //dont have to do anything with the answer... 
		// add event to timeline	
			this.timeline.push({id:this.timelineId, content:"briefJob", start: now.getTime()});
			this.timelineId++;
		}
		
		// clean up the timeline if it becomes too long
		if (this.timeline.length > 100) {
			this.timeline.shift(); //just remove first element
		}


		// let the learning modules know something happened
		this.learningModule.WriteDuration(duration / 1000); // in seconds

		clearTimeout(this.timeout); // remove timeout
		this.startTime = null; // remove startTime
		
		callback({result:"confirmed"});
		return;
	}

};

myAgent.RPCfunctions.getHistory = function(params, callback) {

	callback({result:this.timeline});
};

myAgent.RPCfunctions.reset = function(params, callback) {

	this.expectedTime = null;
	this.minTime = null;
	this.maxTime = null;
	
	callback({result:"done"});
}

myAgent.RPCfunctions.getState = function(params, callback) {

	callback({result:{busy:this.working, start:this.startTime, minDuration:this.minTime, maxDuration:this.maxTime, expectedDuration:this.expectedTime }});
};

/*
	// just a function to see whether http transport is still working correctly when using an external http server
	this.send("http://127.0.0.1:3000/agents/" + this.agentName,  ///hrmm... prefix?
						{method:"add", id:0, params: {a: params.a, b: params.b} }, 
						function(answer){ callback(answer); }); //dont have to do anything with the answer... we're just pushing the result
*/

var AgentBase = require("./agentBase2.js");  // requiring the factory that will wrap a constructor function around our code
module.exports = AgentBase(myAgent);


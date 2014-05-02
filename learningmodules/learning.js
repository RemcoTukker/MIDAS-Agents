'use strict';

module.exports = Learning;

function Learning(eve, options, addServiceFunction) {

	var modules = {};
	
	options = options || {};
	
	// interface to agents for subscribing to an address and sending messages
	addServiceFunction('getModule', function(moduleName) {
		//require and instantiate the desired module with the proper serial nr
		//return new NodeModule.EveModule('0');
		var ctor = modules[moduleName].ctor;
		var nr = modules[moduleName].count.toString();		
		modules[moduleName].count++;
		var obj = new ctor(nr);

		return obj;
	});
	
	//load the modules that are noted in options; alternative is to monitor some directory?
	//TODO load the learning modules specified in the options
/*
	var nodeModule = require('./EveModule/EveModule');
	modules['EveModule'] = {ctor: nodeModule.EveModule, count: 0};
*/
	var nodeModule2 = require('./MeanAndVarianceModule');
	modules['MeanAndVarianceModule'] = {ctor: nodeModule2.MeanAndVarianceModule, count: 0};

	//var obj = modules['EveModule'].ctor("0");
	
	//console.log('learning module loaded')
	//NOTE: this service will probably cause some crashes if restarted.. would need some persistent storage of the module numbers if its necessary that it survives

}

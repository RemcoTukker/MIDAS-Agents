
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.render('index', { title: 'Almende\'s MIDAS Learning Agents Demo'});

};

exports.management = function(req, res){

	res.render('management', { data: {agentAddress: "call here for info"} }); //TODO: put address of management agent here, will be relayed to page's javascript
};

exports.gui = function(req, res){

	console.log(req.url);

	var guipath = req.url.substring(1);
	var guipath2 = guipath.substring(0, guipath.lastIndexOf("/"));
	var agentname = guipath.substring(guipath.lastIndexOf("/") + 1);
	
	console.log(guipath2);
	console.log(agentname);

	try {
		res.render(guipath2, {agent: agentname});
	} catch (e) {
		//TODO nice error page
	}

};

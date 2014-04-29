/**
 * This makes sure the DOM is loaded before starting the code. This ensures we can find the DOM elements we manipulate.
 */
window.onload = function() {
  // < loading global variables
  var lastData = "";
  var agentUrl = "/agents/";
  var updateInterval = 3000; // ms
  var agentAlive = false;
  var states = {};
  var agents = {};

  var minTime = null;
  var maxTime = null;
  var expectedTime = null;
  var jobs;
  // end >


  // < loading the VIS library for the timeline functionality
  var container = document.getElementById('visualization');
  var items = new vis.DataSet({
    convert: {
      start: 'Date',
      end: 'Date'
    }
  });
  var date = new Date();
  var time = date.getTime();
  var options = {
    start: time - 150000,
    end: time + 250000,
    showCurrentTime:true,
    orientation:'bottom',
    height:250
  };
  var timeline = new vis.Timeline(container, items, options);
  // end >


  /**
   * This function communicates with the agent by construnction a HTTP POST request.
   *
   * @param {String} url
   * @param {String} method
   * @param {Object} params
   * @param {Function} callback
   */
  function askAgent(url,method,params,callback) {
    // create post request
    var POSTrequest = JSON.stringify({"id":0, "method": method, "params": params});

    // create XMLHttpRequest object to send the POST request
    var http = new XMLHttpRequest();

    // get a pointer to the DOM element that displays the status of the agent
    var agentStatusSpan = document.getElementById("agentStatusSpan");

    // open an asynchronous POST connection
    http.open("POST", url, false);

    // include header so the receiving code knows its a JSON object
    http.setRequestHeader("Content-type", "application/json");

    // insert the callback function. This is called when the message has been delivered and a response has been received
    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
        agentStatusSpan.innerHTML = "Agent status: ONLINE."
        agentAlive = true;

        // launch callback function
        callback(http.responseText);
      }
    }

    // using a try / catch to see if we can send a message to the agent. If this fails, the agent is down.
    try {
      http.send(POSTrequest);
      agentAlive = true;
    }
    catch(err) {
      agentAlive = false;
      agentStatusSpan.innerHTML = "Agent status: OFFLINE, attempting to reconnect.."
      return;
    }
  }

  function getScheduleData() {
    askAgent(agentUrl + agentName, "getHistory", {}, function(response) {
		console.log(response);      

		var receivedMsg = JSON.parse(response);
		jobs = receivedMsg.result;
		timeline.setItems(receivedMsg.result);

    });
  }

  function getStatus() {
    askAgent(agentUrl + agentName, "getState", {}, function(response) {
		console.log(response);      
		
		var receivedMsg = JSON.parse(response);
		var controlDiv = document.getElementById("agentControls");
		minTime = receivedMsg.result.minDuration;
		maxTime = receivedMsg.result.maxDuration;
		expectedTime = receivedMsg.result.expectedDuration;

		controlDiv.innerHTML = "Learned Duration: " + expectedTime +
			"<br> Minimal Expected Duration: " + minTime + 
			"<br> Maximal Expected Duration: " + maxTime + "<br>"; 


    });
  }

  function plotHistogram() {
	//TODO load data (while getting rid of events)
	var d3array = [];
	for (var x = 0; x < jobs.length; x++) {
		if (typeof jobs[x].end != undefined) {
			d3array.push((jobs[x].end - jobs[x].start) / 1000);
		}
	}


	// Generate a Bates distribution of 10 random variables.
	//var values = d3.range(1000).map(d3.random.bates(10));
	var values = d3array;

	// A formatter for counts.
	var formatCount = d3.format(",.0f");

	var margin = {top: 10, right: 30, bottom: 30, left: 30},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.domain([0, 90])
		.range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
		.bins(x.ticks(30))
		(values);

	var y = d3.scale.linear()
		.domain([0, d3.max(data, function(d) { return d.y; })])
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
	
	d3.select("svg").remove(); //remove the old histogram

	var svg = d3.select("#histogram").append("svg") //add the new histogram
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var bar = svg.selectAll(".bar")
		.data(data)
	  .enter().append("g")
		.attr("class", "bar")
		.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	bar.append("rect")
		.attr("x", 1)
		.attr("width", x(data[0].dx) - 1)
		.attr("height", function(d) { return height - y(d.y); });

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", 6)
		.attr("x", x(data[0].dx) / 2)
		.attr("text-anchor", "middle")
		.text(function(d) { return formatCount(d.y); });

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	var minLine = svg.append("svg:line")
	    .attr("x1", x(minTime))
	    .attr("y1", 0)
	    .attr("x2", x(minTime))
	    .attr("y2", height)
		.style("stroke-width", 5)
	    .style("stroke", "rgb(200,120,15)");

	var maxLine = svg.append("svg:line")
	    .attr("x1", x(maxTime))
	    .attr("y1", 0)
	    .attr("x2", x(maxTime))
	    .attr("y2", height)
		.style("stroke-width", 5)
	    .style("stroke", "rgb(200,120,15)");

	var expLine = svg.append("svg:line")
	    .attr("x1", x(expectedTime))
	    .attr("y1", 0)
	    .attr("x2", x(expectedTime))
	    .attr("y2", height)
		.style("stroke-width", 5)
	    .style("stroke", "rgb(200,210,15)");


  }  


  function addButton() {

	var histDiv = document.getElementById("histogramButton");
    var button1  = "<input type='button' value='Plot Histogram', id='b1'>";
    histDiv.innerHTML = button1;

	var b1 = document.getElementById('b1');

	b1.onclick = function() {

		plotHistogram();

	}
  }


  // get History on start.
  getScheduleData();
  getStatus();

  addButton();

  // recheck the agent for new information
  var refresher = window.setInterval( function() {
    getScheduleData();
	getStatus();
  }, updateInterval);
}

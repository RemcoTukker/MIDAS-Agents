/**
 * This makes sure the DOM is loaded before starting the code. This ensures we can find the DOM elements we manipulate.
 */
window.onload = function() {
  // < loading global variables
  var lastData = "";
  var agentUrl = "/agents/";
  var updateInterval = 2000; // ms
  var agentAlive = false;
  var states = {};
  var agents = {};
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
//      var data = receivedMsg['data'];
//       processData(data,"history");

		//var date = new Date();
		//var time = date.getTime();
 		//timeline.setItems([{id:1, content:"hai", start:time}]);
		
		timeline.setItems(receivedMsg.result);
    });
  }


  function addButton() {

	var controlDiv = document.getElementById("agentControls");

	var tf1 = "<input type='text' value='' id='t1'>";
    var button1  = "<input type='button' value='reportNC', id='b1'>";
  //  var button2 = "<input type='button' value='Reschedule', id='b2'>";


    var newNode = document.createElement('div');
    newNode.innerHTML = tf1.concat(button1);
	//newNode.innerHTML = button1

    controlDiv.appendChild(newNode);

	var b1 = document.getElementById('b1');
	var t1 = document.getElementById('t1');

	b1.onclick = function() {
		console.log("!");
		askAgent(agentUrl + agentName, "reportNC", {cause:t1.value}, function(response) {
			console.log(response);
		})
	}
  }


  // get History on start.
  getScheduleData();

  addButton();

  // recheck the agent for new information
  var refresher = window.setInterval( function() {
    getScheduleData();
  }, updateInterval);
}

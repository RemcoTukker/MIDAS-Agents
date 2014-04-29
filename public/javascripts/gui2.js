/**
 * This makes sure the DOM is loaded before starting the code. This ensures we can find the DOM elements we manipulate.
 */

//agentName is the variable with the name of the agent

window.onload = function() {
  // < loading global variables
  var lastData = "";
  var agentUrl = "/agents/";
  var updateInterval = 2000; // ms
  var agentAlive = false;
  var NCs = {};
  // end >


  var container = document.getElementById('visualization');
 

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


//document.getElementById("clickMe").onclick = function () { alert('hello!'); };
  function addButton() {

	var controlDiv = document.getElementById("agentControls");

    var button1  = "<input type='button' value='fixNCs', id='b1'>";
    var button2 = "<input type='button' value='Reschedule', id='b2'>";

    var newNode = document.createElement('div');
    newNode.innerHTML = button1.concat(button2);

    controlDiv.appendChild(newNode);

	var b1 = document.getElementById('b1');
	b1.onclick = function() {
		console.log("!");
		askAgent(agentUrl + agentName, "fixNCs", {}, function(response) {
			console.log(response);
		})
	}
	var b2 = document.getElementById('b2');
	b2.onclick = function() {
		askAgent(agentUrl + agentName, "cookUpNewSchedule", {}, function(response) {
			console.log(response);
		})
	}
	

  }

  function getNCData() {
    askAgent(agentUrl + agentName, "getNCs", {}, function(response) {

		var receivedMsg = JSON.parse(response);
		
		//receivedMsg.result = [{cause:"-", origin:"remco"},{cause:"-", origin:"gp"} ]

		// Make the list itself which is a <ul>
        var listElement = document.createElement("ul");

        // add it to the page
		container.innerHTML = ''; // remove old stuff
        container.appendChild(listElement);

        // Set up a loop that goes through the items in listItems one at a time
        var numberOfListItems = receivedMsg.result.length;

        for( var i =  0 ; i < numberOfListItems ; ++i){

                // create a <li> for each one.
                var listItem = document.createElement("li");

                // add the item text
				console.log(receivedMsg.result[i]);
                listItem.innerHTML = "NC reported by " + receivedMsg.result[i].origin + ": " + receivedMsg.result[i].cause;

                // add listItem to the listElement
                listElement.appendChild(listItem);

        }
    });
  }


  // get NCs on start.
  getNCData();

  //add buttons
  addButton();

  // recheck the agent for new information
  var refresher = window.setInterval( function() {
    getNCData();
  }, updateInterval);
}

//   Copyright (c) 2012 Sven "FuzzYspo0N" Bergström,
//                   2013 Robert XD Hawkins

//     written by : http://underscorediscovery.com
//     written for : http://buildnewgames.com/real-time-multiplayer/

//     modified for collective behavior experiments on Amazon Mechanical Turk

//     MIT Licensed.

// A window global for our game root variable.
var globalGame = {};
// Keeps track of whether player is paying attention...
var incorrect;
var dragging;
var waiting;

var client_onserverupdate_received = function(data){
  globalGame.my_role = data.trialInfo.roles[globalGame.my_id];

  // Update client versions of variables with data received from
  // server_send_update function in game.core.js
  //data refers to server information
  if(data.players) {
    _.map(_.zip(data.players, globalGame.players),function(z){
      z[1].id = z[0].id;
    });
  }
  
  if (globalGame.roundNum != data.roundNum) {
    var myCoords = (globalGame.my_role == globalGame.playerRoleNames.role1 ?
		    'speakerCoords' : 'listenerCoords');
    
    globalGame.objects = _.map(data.trialInfo.currStim.objects, function(obj) {
      // Extract the coordinates matching your role &
      // remove the speakerCoords and listenerCoords properties
      var customCoords = obj[myCoords];
      var customObj = _.chain(obj)
	  .omit('speakerCoords', 'listenerCoords')
	  .extend(obj, {
	    trueX : customCoords.trueX, trueY : customCoords.trueY,
	    gridX : customCoords.gridX, gridY : customCoords.gridY,
	    box : customCoords.box
	  })
	  .value();
      
      return _.extend(customObj);
    });
    console.log(data.trialInfo);
    globalGame.occlusions = data.trialInfo.currStim.occlusions[myCoords];
    console.log(globalGame.occlusions);
  };

  globalGame.game_started = data.gs;
  globalGame.players_threshold = data.pt;
  globalGame.player_count = data.pc;
  globalGame.roundNum = data.roundNum;
  globalGame.roundStartTime = new Date();
  globalGame.allObjects = data.allObjects;
  
  if(!_.has(globalGame, 'data')) {
    globalGame.data = data.dataObj;
  }

  // Get rid of "waiting" screen if there are multiple players
  if(data.players.length > 1) {
    $('#messages').empty();
    $("#chatbox").removeAttr("disabled");
    $('#chatbox').focus();
    globalGame.get_player(globalGame.my_id).message = "";

    // reset labels
    // Update w/ role (can only move stuff if agent)
    $('#roleLabel').empty().append("You are the " + globalGame.my_role + '.');

    if(globalGame.my_role === globalGame.playerRoleNames.role1) {
      globalGame.viewport.removeEventListener("click", mouseClickListener, false);
      $('#instructs')
	.empty()
	.append("<p>Click & drag one word down to the grey box</p>" +
		"<p>to tell the listener which object is the target.</p>");
    } else if(globalGame.my_role === globalGame.playerRoleNames.role2) {
      globalGame.viewport.addEventListener("click", mouseClickListener, false);
      $('#instructs')
	.empty()
	.append("<p>After you see the speaker drag a word into the box,</p>" +
		"<p>click the object they are telling you about.</p>");
    }
  }
    
  // Draw all this new stuff
  drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
};

var client_onMessage = function(data) {

  var commands = data.split('.');
  var command = commands[0];
  var subcommand = commands[1] || null;
  var commanddata = commands[2] || null;

  switch(command) {
  case 's': //server message
    switch(subcommand) {
      
    case 'feedback' :
      $("#chatbox").attr("disabled", "disabled");
      // update local score
      var clickedObjName = commanddata;
      var target = _.filter(globalGame.objects, (x) => {
	return x.targetStatus == 'target';
      })[0];
      var scoreDiff = target.name == clickedObjName ? globalGame.bonusAmt : 0;
      globalGame.data.subject_information.score += scoreDiff;
      $('#score').empty()
        .append("Bonus: $" + (globalGame.data.subject_information.score/100).toFixed(2));
      
      // draw feedback
      if (globalGame.my_role === globalGame.playerRoleNames.role1) {
	drawSketcherFeedback(globalGame, scoreDiff, clickedObjName);
      } else {
	drawViewerFeedback(globalGame, scoreDiff, clickedObjName);
      }

      break;
      
    case 'alert' : // Not in database, so you can't play...
      alert('You did not enter an ID');
      window.location.replace('http://nodejs.org'); break;

    case 'join' : //join a game requested
      var num_players = commanddata;
      client_onjoingame(num_players, commands[3]); break;

    case 'add_player' : // New player joined... Need to add them to our list.
      console.log("adding player" + commanddata);
      clearTimeout(globalGame.timeoutID);
      if(hidden === 'hidden') {
        flashTitle("GO!");
      }
      globalGame.players.push({id: commanddata,
             player: new game_player(globalGame)}); break;
    }
  }
};

var setupOverlay = function() {
  var closeButton = document.getElementById('transition_button');
  closeButton.onclick = () => {
    $('#transition_text').hide();
    $('#dimScreen').hide();    
  };
};

// We want to test both directions of the lexicon.
// Given a word, what objects does it apply to; given an object, what words apply to it?

var client_addnewround = function(game) {
  $('#roundnumber').append(game.roundNum);
};

var customSetup = function(game) {
  // Set up new round on client's browsers after submit round button is pressed.
  // This means clear the chatboxes, update round number, and update score on screen
  game.socket.on('newRoundUpdate', function(data){
    $('#messages').empty();
    if(game.roundNum + 2 > game.numRounds) {
      $('#roundnumber').empty();
      $('#instructs').empty()
        .append("Round\n" + (game.roundNum + 1) + "/" + game.numRounds);
    } else {
      $('#feedback').empty();
      $('#roundnumber').empty()
        .append("Round\n" + (game.roundNum + 2) + "/" + game.numRounds);
    }
  });
};

var client_onjoingame = function(num_players, role) {
  // set role locally
  globalGame.my_role = role;
  globalGame.get_player(globalGame.my_id).role = globalGame.my_role;
  _.map(_.range(num_players - 1), function(i){
    globalGame.players.unshift({id: null, player: new game_player(globalGame)});
  });

  if(num_players == 1) {
    this.timeoutID = setTimeout(function() {
      if(_.size(this.urlParams) == 4) {
        this.submitted = true;
        window.opener.turk.submit(this.data, true);
        window.close();
      } else {
        console.log("would have submitted the following :");
        console.log(this.data);
      }
    }, 1000 * 60 * 15);
    $("#chatbox").attr("disabled", "disabled");
    globalGame.get_player(globalGame.my_id).message = (
      'Waiting for another player to connect... Please do not refresh the page!'
    );
  }
};

/*
 MOUSE EVENT LISTENERS
 */

function mouseClickListener(evt) {
  var bRect = globalGame.viewport.getBoundingClientRect();
  var mouseX = Math.floor((evt.clientX - bRect.left)*
			  (globalGame.viewport.width/bRect.width));
  var mouseY = Math.floor((evt.clientY - bRect.top)*
			  (globalGame.viewport.height/bRect.height));
  if (globalGame.messageSent) { // if message was not sent, don't do anything
    _.forEach(globalGame.objects, function(obj) {
      if (hitTest(obj, mouseX, mouseY)) {
	globalGame.messageSent = false;
        globalGame.socket.send(["clickedObj", obj.name].join('.'));
      }
    });
  };
};

function hitTest(shape,mx,my) {
  var dx = mx - shape.trueX;
  var dy = my - shape.trueY;
  return (0 < dx) && (dx < shape.width) && (0 < dy) && (dy < shape.height);
}

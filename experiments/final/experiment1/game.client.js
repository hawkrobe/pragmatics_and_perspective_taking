/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström, 
                  2013 Robert XD Hawkins
    
    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    modified for collective behavior experiments on Amazon Mechanical Turk

    MIT Licensed.
*/

/* 
   THE FOLLOWING FUNCTIONS MAY NEED TO BE CHANGED
*/

// A window global for our game root variable.
var globalGame = {};
// Keeps track of whether player is paying attention...
var visible;
var incorrect;
var submitted = false;

function client_onserverupdate_received(data){
  // Update client versions of variables with data received from
  // server_send_update function in game.core.js
  if(data.players) {
    _.map(_.zip(data.players, globalGame.players), z => z[1].id = z[0].id);
  }

  var dataNames = _.map(data.objects, e => e.name);
  var localNames = _.map(globalGame.objects, e => e.name);
  
  // Preload objects if out of date...
  // Note, might have to insert this inside an initial occlusion drawing callback?
  if (globalGame.objects.length == 0 || !_.isEqual(dataNames, localNames)) {
    globalGame.objectCount = dataNames.length;
    globalGame.objects = _.map(data.objects, obj => {
      var imgObj = new Image();
      imgObj.src = obj.url;
      imgObj.onload = objectCounter;
      return _.extend({}, obj, {img: imgObj});
    });
  }
  
  globalGame.currentDestination = data.curr_dest;
  globalGame.scriptedInstruction = data.scriptedInstruction;

  globalGame.instructions = data.instructions;
  globalGame.instructionNum = data.instructionNum;
  globalGame.data = data.dataObj;
  globalGame.game_started = data.gs;
  globalGame.players_threshold = data.pt;
  globalGame.player_count = data.pc;

  // Draw all this new stuff
  drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
}; 

// This is where clients parse socket.io messages from the server. If
// you want to add another event (labeled 'x', say), just add another
// case here, then call

//          this.instance.player_host.send("s.x. <data>")

// The corresponding function where the server parses messages from
// clients, look for "server_onMessage" in game.server.js.
client_onMessage = function(data) {

  var commands = data.split('.');
  var command = commands[0];
  var subcommand = commands[1] || null;
  var commanddata = commands[2] || null;

  switch(command) {
  case 's': //server message
    switch(subcommand) {    
    case 'end' :
      // Redirect to exit survey
      ondisconnect();
      console.log("received end message...");
      break;

    case 'alert' : // Not in database, so you can't play...
      alert('You did not enter an ID'); 
      window.location.replace('http://nodejs.org'); break;

    case 'join' : //join a game requested
      var num_players = commanddata;
      client_onjoingame(num_players, commands[3]); break;

    case 'add_player' : // New player joined... Need to add them to our list.
      console.log("adding player" + commanddata)
      if(hidden === 'hidden') {
        flashTitle("GO!")
      }
      globalGame.players.push({id: commanddata, player: new game_player(globalGame)}); break;

    case 'begin_game' :
      client_newgame(); break;

    case 'feedback' :
      var type = commanddata;
      globalGame.get_player(globalGame.my_id).message = type ? type + " move!\n" : ""
      drawScreen(globalGame, globalGame.get_player(globalGame.my_id))
      break;
    }
  } 
}; 

var customSetup = function(game) {
  game.socket.on('objMove', function(data){
    game.objects[data.i].upperLeftX = data.x;
    game.objects[data.i].upperLeftY = data.y;
    drawScreen(game, game.get_player(globalGame.my_id));
  });

  // Set up new round on client's browsers after submit round button is pressed.
  // For mouse-tracking, matcher must wait until director sends message  
  game.socket.on('newRoundUpdate', function(data){
    $('#messages').empty();
    if(globalGame.my_role == globalGame.playerRoleNames.role2) {
      var msg = 'Waiting for your partner to send a message...';
      globalGame.get_player(globalGame.my_id).message = msg;
      globalGame.paused = true;
      globalGame.dragging = false;
    } else {
      globalGame.paused = false;
      $("#chatbox").removeAttr("disabled");
      $('#chatbox').focus();
      globalGame.get_player(globalGame.my_id).message = "";
    }
    drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
  });

  game.socket.on('chatMessage', function(data){
    var otherRole = (globalGame.my_role === game.playerRoleNames.role1 ?
		     game.playerRoleNames.role2 : game.playerRoleNames.role1);
    var source = data.user === globalGame.my_id ? "You" : otherRole;
    // Bar responses until speaker has uttered at least one message
    if(source !== "You"){
      globalGame.messageSent = true;
    }
    var col = source === "You" ? "#363636" : "#707070";
    $('.typing-msg').remove();
    $('#messages')
      .append($('<li style="padding: 5px 10px; background: ' + col + '">')
    	      .text(source + ": " + data.msg))
      .stop(true,true)
      .animate({
	scrollTop: $("#messages").prop("scrollHeight")
      }, 800);
    if(globalGame.my_role == globalGame.playerRoleNames.role2 && globalGame.paused) {
      var msg = 'Message received! Please click on the circle in the center to continue.'
      globalGame.get_player(globalGame.my_id).message = msg;
      drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
      drawClickPoint(game);
    }
  });
};

var client_onjoingame = function(num_players, role) {
  _.map(_.range(num_players - 1), i => {
    globalGame.players.unshift({id: null, player: new game_player(globalGame)});
  });

  // Update w/ role (can only move stuff if agent)
  $('#roleLabel').append('You are the ' + role + '.');
  if(role === globalGame.playerRoleNames.role1) {
    $('#instructs').append("Type instructions for the matcher to move the object in the direction of the arrow!");
  } else {
    $('#instructs').append("Click and drag objects to follow the director's instructions.");
    globalGame.viewport.addEventListener("click", clickListener, false);
    globalGame.viewport.addEventListener('mousemove', throttle(mouseTracking, 10))
    globalGame.viewport.addEventListener("mousedown", mouseDownListener, false);
  }

  // set role locally
  globalGame.my_role = role;
  globalGame.get_player(globalGame.my_id).role = role;
  globalGame.paused = true;
  constructOcclusions();

  if(num_players == 1)
    globalGame.get_player(globalGame.my_id).message = 'Waiting for other player to connect...';
}; 

/*
  MOUSE EVENT LISTENERS
*/

function mouseDownListener(evt) {
  var i;
  //We are going to pay attention to the layering order of the objects so that if a mouse down occurs over more than object,
  //only the topmost one will be dragged.
  var highestIndex = -1;
  
  //getting mouse position correctly, being mindful of resizing that may have occured in the browser:
  var bRect = globalGame.viewport.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(globalGame.viewport.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(globalGame.viewport.height/bRect.height);

  // if waiting flag is active, check if center was clicked
  //find which shape was clicked
  if(!globalGame.paused) {
    for (i=0; i < globalGame.objects.length; i++) {
      if (hitTest(globalGame.objects[i], mouseX, mouseY)) {
        globalGame.dragging = true;
        if (i > highestIndex) {
          //We will pay attention to the point on the object where the mouse is "holding" the object:
          dragHoldX = mouseX - globalGame.objects[i].upperLeftX;
          dragHoldY = mouseY - globalGame.objects[i].upperLeftY;
          highestIndex = i;
          dragIndex = i;
        }
      }
    }
  }
  if (globalGame.dragging) {
    window.addEventListener("mousemove", dragListener, false);
  }
  globalGame.viewport.removeEventListener("mousedown", mouseDownListener, false);
  window.addEventListener("mouseup", mouseUpListener, false);

  //code below prevents the mouse down from having an effect on the main browser window:
  if (evt.preventDefault) {
    evt.preventDefault();
  } //standard
  else if (evt.returnValue) {
    evt.returnValue = false;
  } //older IE
  return false;
}

function clickListener(evt) {
  var bRect = globalGame.viewport.getBoundingClientRect();
  var mouseX = Math.floor((evt.clientX - bRect.left) * (globalGame.viewport.width/bRect.width));
  var mouseY = Math.floor((evt.clientY - bRect.top) * (globalGame.viewport.height/bRect.height));
  if(globalGame.messageSent && hitCenter(mouseX, mouseY)) {
    globalGame.get_player(globalGame.my_id).message = "";
    globalGame.paused = false;
    globalGame.listenerStartTime = Date.now();      
    $("#chatbox").removeAttr("disabled");
    $('#chatbox').focus();
    drawScreen(globalGame, globalGame.get_player(globalGame.my_id));    
  }
}

function mouseUpListener(evt) {    
  globalGame.viewport.addEventListener("mousedown", mouseDownListener, false);
  window.removeEventListener("mouseup", mouseUpListener, false);
  if (globalGame.dragging) {
    // Set up the right variables
    var bRect = globalGame.viewport.getBoundingClientRect();
    dropX = (evt.clientX - bRect.left)*(globalGame.viewport.width/bRect.width);
    dropY = (evt.clientY - bRect.top)*(globalGame.viewport.height/bRect.height);
    var obj = globalGame.objects[dragIndex]
    var cell = globalGame.getCellFromPixel(dropX, dropY)
    console.log(cell)
    console.log(obj)
    
    // If you were dragging the correct object... And dragged it to the correct location...
    if (_.isEqual(obj.name, globalGame.instructions[globalGame.instructionNum].split(' ')[0])
        && _.isEqual(cell, globalGame.currentDestination)) {
      // center it
      obj.gridX = cell.gridX;
      obj.gridY = cell.gridY
      obj.upperLeftX = globalGame.getPixelFromCell(cell).centerX - obj.width/2
      obj.upperLeftYY = globalGame.getPixelFromCell(cell).centerY - obj.height/2
      globalGame.socket.send("drop.correct." + dragIndex + "." +
			     Math.round(obj.upperLeftX) + "." + Math.round(obj.upperLeftY))
      
      // If you didn't drag it beyond cell bounds, snap it back w/o comment
    } else if (obj.gridX == cell.gridX && obj.gridY == cell.gridY) {
      obj.upperLeftX = globalGame.getPixelFromCell(obj).centerX - obj.width/2
      obj.upperLeftY = globalGame.getPixelFromCell(obj).centerY - obj.height/2
      globalGame.socket.send("objMove." + dragIndex + "." + Math.round(obj.upperLeftX) +
			     "." + Math.round(obj.upperLeftY))
      // If you moved the incorrect object or went to the incorrect location, pause game to readjust mouse
    } else {
      obj.upperLeftX = globalGame.getPixelFromCell(obj).centerX - obj.width/2
      obj.upperLeftY = globalGame.getPixelFromCell(obj).centerY - obj.height/2
      var msg = ['drop', 'incorrect', dragIndex,
		 Math.round(obj.upperLeftX), Math.round(obj.upperLeftY),
		 cell.gridX, cell.gridY].join('.');
      globalGame.socket.send(msg);
    }
    // Tell server where you dropped it
    drawScreen(globalGame, globalGame.get_player(globalGame.my_id))
    window.removeEventListener("mousemove", dragListener, false);
  }
}

var throttle = function(func, delay) {
  var prev = Date.now() - delay;
	
  return function() {
    var current = Date.now();
    if (current - prev >= delay) {
      prev = current;
      func.apply(null, arguments);
    }
  };
};

var mouseTracking = function(event) {
  var bRect = globalGame.viewport.getBoundingClientRect();
  var mouseX = (event.clientX-bRect.left)*(globalGame.viewport.width/bRect.width);
  var mouseY = (event.clientY-bRect.top)*(globalGame.viewport.height/bRect.height);
  if(!globalGame.paused && !globalGame.dragging) {
    globalGame.socket.send(
      ['updateMouse', Date.now(), Math.floor(mouseX), Math.floor(mouseY)].join('.')
    );
  }
};

function dragListener(evt) {
  // prevent from dragging offscreen
  var minX = 25;
  var maxX = globalGame.viewport.width - globalGame.objects[dragIndex].width - 25;
  var minY = 25;
  var maxY = globalGame.viewport.height - globalGame.objects[dragIndex].height - 25;

  //getting mouse position correctly 
  var bRect = globalGame.viewport.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(globalGame.viewport.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(globalGame.viewport.height/bRect.height);

  //clamp x and y positions to prevent object from dragging outside of canvas
  var posX = mouseX - dragHoldX;
  posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
  var posY = mouseY - dragHoldY;
  posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

  // Update object locally
  var obj = globalGame.objects[dragIndex]
  obj.upperLeftX = Math.round(posX);
  obj.upperLeftY = Math.round(posY);

  // Tell server about it
  globalGame.socket.send("objMove." + dragIndex + "." + Math.round(posX) + "." + Math.round(posY))
  drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
}

function hitCenter(mouseX, mouseY) {
  return ((Math.pow(mouseX - globalGame.viewport.width/2, 2) +
	   Math.pow(mouseY - globalGame.viewport.height/2, 2))
	  <= Math.pow(30, 2));
};

function hitTest(shape,mx,my) {
  console.log(shape);
  var dx = mx - shape.upperLeftX;
  var dy = my - shape.upperLeftY;
  console.log([dx, dy])
  return (0 < dx) && (dx < shape.width) && (0 < dy) && (dy < shape.height)
}

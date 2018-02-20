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
// A window global for our id, which we can use to look ourselves up
var my_role = null;
// Keeps track of whether player is paying attention...
var visible;
var incorrect;
var dragging;
var waiting;
var submitted = false;

function client_onserverupdate_received(data){
  // Update client versions of variables with data received from
  // server_send_update function in game.core.js
  if(data.players) {
    _.map(_.zip(data.players, globalGame.players), z => z[1].id = z[0].id);
  }

  var dataNames = _.map(data.objects, e => e.name);
  var localNames = _.map(globalGame.objects, e => e.name);

  // If your objects are out-of-date (i.e. if there's a new round), update them
  if (globalGame.objects.length == 0 || !_.isEqual(dataNames, localNames)) { 
    globalGame.objects = _.map(data.objects, obj => {
      var imgObj = new Image();
      imgObj.src = obj.url;
      imgObj.onload = () => {
        globalGame.ctx.drawImage(imgObj, parseInt(obj.trueX), parseInt(obj.trueY),
			   obj.width, obj.height);
        drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
      };
      return _.extend(_.omit(obj, ['trueX', 'trueY']), {
	img: imgObj, trueX : obj.trueX, trueY : obj.trueY
      });
    });
  }

  // Update local object positions
  _.map(globalGame.objects, function(obj) {
    var data_obj = _.find(data.objects, o => o.name == obj.name);
    obj.trueX = data_obj.trueX;
    obj.trueY = data_obj.trueY;
  });

  if(data.players.length > 1) {
    globalGame.get_player(globalGame.my_id).message = "";
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

        case 'waiting' :
            var type = commanddata;
            globalGame.get_player(globalGame.my_id).message = type ? type + " move!\n" : ""
            if(type == 'incorrect')
                incorrect = true;
            if(my_role == "director") {
                globalGame.get_player(globalGame.my_id).message += 'Waiting for matcher to re-position mouse...';
            } else {
                globalGame.get_player(globalGame.my_id).message += 'Please click on the circle in the center and wait for the director to give you instructions.';
                waiting = true;
            }
            drawScreen(globalGame, globalGame.get_player(globalGame.my_id))
            break;
        }
    } 
}; 

var customSetup = function(game) {
  game.socket.on('objMove', function(data){
    game.objects[data.i].trueX = data.x;
    game.objects[data.i].trueY = data.y;
    drawScreen(game, game.get_player(globalGame.my_id));
  });
};

// // When loading the page, we store references to our
// // drawing canvases, and initiate a game instance.
// window.onload = function(){
//     //Create our game client instance.
//     game = new game_core();
    
//     //Connect to the socket.io server!
//     client_connect_to_server(game);
    
//     //Fetch the viewport
//     game.viewport = document.getElementById('viewport');
    
//     //Adjust its size
//     game.viewport.width = game.world.width;
//     game.viewport.height = game.world.height;

//     //Fetch the rendering contexts
//     game.ctx = game.viewport.getContext('2d');

//     //Set the draw style for the font
//     game.ctx.font = '11px "Helvetica"';

//     document.getElementById('chatbox').focus();

// };

// Associates callback functions corresponding to different socket messages
// client_connect_to_server = function(game) {
//     //Store a local reference to our connection to the server
//     game.socket = io.connect();

//     // Tell server when client types something in the chatbox
//     $('form').submit(function(){
//         var msg = 'chatMessage.' + $('#chatbox').val();
//         if($('#chatbox').val() != '') {
//             game.socket.send(msg);
//             $('#chatbox').val('');
//             // If you just sent a scripted instruction, get rid of it!
// //            game.scriptedInstruction = "none";
//         }
//         return false;
//     });

//     // Update messages log when other players send chat
//     game.socket.on('chatMessage', function(data){
//         var otherRole = my_role === "director" ? "Matcher" : "Director"
//         var source = data.user === globalGame.my_id ? "You" : otherRole
//         var col = source === "You" ? "#363636" : "#707070"
//         $('#messages').append($('<li style="padding: 5px 10px; background: ' + col + '">').text(source + ": " + data.msg));
//         $('#messages').stop().animate({
//             scrollTop: $("#messages")[0].scrollHeight
//         }, 800);
//     })

    // Draw objects when someone else moves them
//     game.socket.on('objMove', function(data){
//         game.objects[data.i].trueX = data.x;
//         game.objects[data.i].trueY = data.y;
//         drawScreen(game, game.get_player(globalGame.my_id))
//     })

//     //When we connect, we are not 'connected' until we have an id
//     //and are placed in a game by the server. The server sends us a message for that.
//     game.socket.on('connect', function(){}.bind(game));
//     //Sent when we are disconnected (network, server down, etc)
//     game.socket.on('disconnect', client_ondisconnect.bind(game));
//     //Sent each tick of the server simulation. This is our authoritive update
//     game.socket.on('onserverupdate', client_onserverupdate_received);
//     //Handle when we connect to the server, showing state and storing id's.
//     game.socket.on('onconnected', client_onconnected.bind(game));
//     //On message from the server, we parse the commands and send it to the handlers
//     game.socket.on('message', client_onMessage.bind(game));
// }; 

// client_onconnected = function(data) {
//     //The server responded that we are now in a game. Remember who we are
//     globalGame.my_id = data.id;
//     game.players[0].id = globalGame.my_id;
// };

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
  }

  // set role locally
  my_role = role;
  globalGame.get_player(globalGame.my_id).role = my_role;

  if(num_players == 1)
    globalGame.get_player(globalGame.my_id).message = 'Waiting for other player to connect...';

  // set mouse-tracking event handler
  if(role === globalGame.playerRoleNames.role2) {
    $('#viewport').mousemove(function(event){
      var bRect = globalGame.viewport.getBoundingClientRect();
      var mouseX = (event.clientX - bRect.left)*(globalGame.viewport.width/bRect.width);
      var mouseY = (event.clientY - bRect.top)*(globalGame.viewport.height/bRect.height);
      globalGame.socket.send('update_mouse.' + Math.floor(mouseX) + '.' + Math.floor(mouseY));
    });
    globalGame.viewport.addEventListener("mousedown", mouseDownListener, false);
  }
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
    if(waiting) {
        if((Math.pow(mouseX - globalGame.viewport.width/2, 2) + Math.pow(mouseY - globalGame.viewport.height/2, 2))
            <= Math.pow(8, 2)) {
            globalGame.get_player(globalGame.my_id).message = ""
            if (incorrect) {
                globalGame.socket.send("ready.incorrect")
                incorrect = false;
            } else {
                globalGame.socket.send("ready")
            }
            waiting = false
        }
    } else {
        //find which shape was clicked
        for (i=0; i < globalGame.objects.length; i++) {
            if  (hitTest(globalGame.objects[i], mouseX, mouseY)) {
                dragging = true;
                if (i > highestIndex) {
                    //We will pay attention to the point on the object where the mouse is "holding" the object:
                    dragHoldX = mouseX - globalGame.objects[i].trueX;
                    dragHoldY = mouseY - globalGame.objects[i].trueY;
                    highestIndex = i;
                    dragIndex = i;
                }
            }
        }
    }
    if (dragging) {
        window.addEventListener("mousemove", mouseMoveListener, false);
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

function mouseUpListener(evt) {    
    globalGame.viewport.addEventListener("mousedown", mouseDownListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    if (dragging) {
        // Set up the right variables
        var bRect = globalGame.viewport.getBoundingClientRect();
        dropX = (evt.clientX - bRect.left)*(globalGame.viewport.width/bRect.width);
        dropY = (evt.clientY - bRect.top)*(globalGame.viewport.height/bRect.height);
        var obj = globalGame.objects[dragIndex]
        var cell = globalGame.getCellFromPixel(dropX, dropY)
        console.log(cell)
        console.log([obj.gridX, obj.gridY])
        
        // If you were dragging the correct object... And dragged it to the correct location...
        if (_.isEqual(obj.name, globalGame.instructions[globalGame.instructionNum].split(' ')[0])
            && _.isEqual(cell, globalGame.currentDestination)) {
            // center it
            obj.gridX = cell[0]
            obj.gridY = cell[1]
            obj.trueX = globalGame.getPixelFromCell(cell[0], cell[1]).centerX - obj.width/2
            obj.trueY = globalGame.getPixelFromCell(cell[0], cell[1]).centerY - obj.height/2
            globalGame.socket.send("correctDrop." + dragIndex + "." + Math.round(obj.trueX) + "." + Math.round(obj.trueY))
        
        // If you didn't drag it beyond cell bounds, snap it back w/o comment
        } else if (obj.gridX == cell[0] && obj.gridY == cell[1]) {
            console.log("here!")
            obj.trueX = globalGame.getPixelFromCell(obj.gridX, obj.gridY).centerX - obj.width/2
            obj.trueY = globalGame.getPixelFromCell(obj.gridX, obj.gridY).centerY - obj.height/2
            globalGame.socket.send("objMove." + dragIndex + "." + Math.round(obj.trueX) + "." + Math.round(obj.trueY))
        
        // If you moved the incorrect object or went to the incorrect location, pause game to readjust mouse
        } else {
            obj.trueX = globalGame.getPixelFromCell(obj.gridX, obj.gridY).centerX - obj.width/2
            obj.trueY = globalGame.getPixelFromCell(obj.gridX, obj.gridY).centerY - obj.height/2
            globalGame.socket.send("incorrectDrop." + dragIndex + "." + Math.round(obj.trueX) + "." + Math.round(obj.trueY) 
			     + "." + cell[0] + "." + cell[1]);
        }
        // Tell server where you dropped it
        drawScreen(globalGame, globalGame.get_player(globalGame.my_id))
        dragging = false;
        window.removeEventListener("mousemove", mouseMoveListener, false);
    }
}

function mouseMoveListener(evt) {
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
    obj.trueX = Math.round(posX);
    obj.trueY = Math.round(posY);

    // Tell server about it
    globalGame.socket.send("objMove." + dragIndex + "." + Math.round(posX) + "." + Math.round(posY))
    drawScreen(globalGame, globalGame.get_player(globalGame.my_id));
}

function hitTest(shape,mx,my) {
    var dx = mx - shape.trueX;
    var dy = my - shape.trueY;
    return (0 < dx) && (dx < shape.width) && (0 < dy) && (dy < shape.height)
}

// This gets called when someone selects something in the menu during the exit survey...
// collects data from drop-down menus and submits using mmturkey
function dropdownTip(data){
  console.log(globalGame);
  var commands = data.split('::');
  switch(commands[0]) {
  case 'human' :
    $('#humanResult').show();
    globalGame.data.subject_information = _.extend(globalGame.data.subject_information, 
					     {'thinksHuman' : commands[1]}); break;
  case 'language' :
    globalGame.data.subject_information = _.extend(globalGame.data.subject_information, 
					     {'nativeEnglish' : commands[1]}); break;
  case 'partner' :
    globalGame.data.subject_information = _.extend(globalGame.data.subject_information,
                {'ratePartner' : commands[1]}); break;
  case 'submit' :
    globalGame.data.subject_information = _.extend(globalGame.data.subject_information, 
				   {'comments' : $('#comments').val(), 
				    'role' : my_role,
				    'totalLength' : Date.now() - globalGame.startTime});
    submitted = true;
    var urlParams;
    var match,
    pl     = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query  = location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }

    if(_.size(urlParams) == 4) {
      window.opener.turk.submit(globalGame.data, true)
      window.close(); 
    } else {
      console.log("would have submitted the following :")
      console.log(globalGame.data);
      // var URL = 'http://web.stanford.edu/~rxdh/psych254/replication_project/forms/end.html?id=' + globalGame.my_id;
      // window.location.replace(URL);
    }
    break;
  }
}

window.onbeforeunload = function(e) {
  e = e || window.event;
  var msg = ("If you leave before completing the task, "
	     + "you will not be able to submit the HIT.");
  if (!submitted) {
    // For IE & Firefox
    if (e) {
      e.returnValue = msg;
    }
    // For Safari
    return msg;
  }
};

// Automatically registers whether user has switched tabs...
(function() {
    document.hidden = hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide = window.onfocus 
             = window.onblur = onchange;
})();

function onchange (evt) {
    var v = 'visible', h = 'hidden',
    evtMap = { 
        focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h 
    };
    evt = evt || window.event;
    if (evt.type in evtMap) {
        document.body.className = evtMap[evt.type];
    } else {
        document.body.className = evt.target.hidden ? "hidden" : "visible";
    }
    visible = document.body.className;
    globalGame.socket.send("h." + document.body.className);
};

(function () {

    var original = document.title;
    var timeout;

    window.flashTitle = function (newMsg, howManyTimes) {
        function step() {
            document.title = (document.title == original) ? newMsg : original;
            if (visible === "hidden") {
                timeout = setTimeout(step, 500);
            } else {
                document.title = original;
            }
        };
        cancelFlashTitle(timeout);
        step();
    };

    window.cancelFlashTitle = function (timeout) {
        clearTimeout(timeout);
        document.title = original;
    };

}());

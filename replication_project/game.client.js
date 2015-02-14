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
var game = {};
// A window global for our id, which we can use to look ourselves up
var my_id = null;
// Keeps track of whether player is paying attention...
var visible;
var dragging;

client_ondisconnect = function(data) {
    // Redirect to exit survey
    console.log("server booted")
	var URL = 'http://projects.csail.mit.edu/ci/turk/forms/end.html?id=' + my_id;
    window.location.replace(URL);
};


/* 
Note: If you add some new variable to your game that must be shared
  across server and client, add it both here and the server_send_update
  function in game.core.js to make sure it syncs 

Explanation: This function is at the center of the problem of
  networking -- everybody has different INSTANCES of the game. The
  server has its own, and both players have theirs too. This can get
  confusing because the server will update a variable, and the variable
  of the same name won't change in the clients (because they have a
  different instance of it). To make sure everybody's on the same page,
  the server regularly sends news about its variables to the clients so
  that they can update their variables to reflect changes.
*/
client_onserverupdate_received = function(data){

    // Update client versions of variables with data received from
    // server_send_update function in game.core.js
    if(data.players) {
        _.map(_.zip(data.players, game.players),
            function(z){
                z[1].id = z[0].id
            })
    }
    console.log(data.objects)
    game.objects = data.objects;
    game.game_started = data.gs;
    game.players_threshold = data.pt;
    game.player_count = data.pc;
    game.waiting_remaining = data.wr;
    drawScreen(game)
    drawGrid(game);
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
          console.log("received end message...")
          var URL = 'http://projects.csail.mit.edu/ci/turk/forms/end.html?id=' + my_id;
          window.location.replace(URL); break;
        case 'alert' : // Not in database, so you can't play...
            alert('You did not enter an ID'); 
            window.location.replace('http://nodejs.org'); break;
        case 'join' : //join a game requested
            var num_players = commanddata;
            client_onjoingame(num_players); break;
        case 'add_player' : // New player joined... Need to add them to our list.
            console.log("adding player" + commanddata)
            game.players.push({id: commanddata, player: new game_player(game)}); break;
        case 'begin_game' :
            client_newgame(); break;
        case 'blink' : //blink title
            flashTitle("GO!");  break;
        }        
        break; 
    } 
}; 

// When loading the page, we store references to our
// drawing canvases, and initiate a game instance.
window.onload = function(){
    //Create our game client instance.
    game = new game_core();
    
    //Connect to the socket.io server!
    client_connect_to_server(game);
    
    //Fetch the viewport
    game.viewport = document.getElementById('viewport');
    
    //Adjust its size
    game.viewport.width = game.world.width;
    game.viewport.height = game.world.height;

    game.viewport.addEventListener("mousedown", mouseDownListener, false);

    //Fetch the rendering contexts
    game.ctx = game.viewport.getContext('2d');

    //Set the draw style for the font
    game.ctx.font = '11px "Helvetica"';

    drawScreen(game);
    document.getElementById('chatbox').focus();

};

// Associates callback functions corresponding to different socket messages
client_connect_to_server = function(game) {
    //Store a local reference to our connection to the server
    game.socket = io.connect();

    // Tell server when client types something in the chatbox
    $('form').submit(function(){
        var msg = 'chatMessage.' + $('#chatbox').val();
        game.socket.send(msg);
        $('#chatbox').val('');
        return false;
    });

    // Update messages log when other players send chat
    game.socket.on('chatMessage', function(data){
        var source = data.user === my_id ? "You" : "Your partner"
        var col = source === "You" ? "#363636" : "#707070"
        $('#messages').append($('<li style="padding: 5px 10px; background: ' + col + '">').text(source + ": " + data.msg));
        $('#messages').stop().animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 800);
    })

    game.socket.on('objMove', function(data){
        game.objects[data.i].x = data.x;
        game.objects[data.i].y = data.y;
        drawScreen(game)
    })

    //When we connect, we are not 'connected' until we have a server id
    //and are placed in a game by the server. The server sends us a message for that.
    game.socket.on('connect', function(){}.bind(game));

    //Sent when we are disconnected (network, server down, etc)
    game.socket.on('disconnect', client_ondisconnect.bind(game));
    //Sent each tick of the server simulation. This is our authoritive update
    game.socket.on('onserverupdate', client_onserverupdate_received);
    //Handle when we connect to the server, showing state and storing id's.
    game.socket.on('onconnected', client_onconnected.bind(game));
    //On message from the server, we parse the commands and send it to the handlers
    game.socket.on('message', client_onMessage.bind(game));
}; 

client_onconnected = function(data) {
    //The server responded that we are now in a game,
    //this lets us store the information about ourselves  
    // so that we remember who we are.  
    my_id = data.id;
    game.players[0].id = my_id;
};

client_onjoingame = function(num_players) {
    // Need client to know how many players there are, so they can set up the appropriate data structure
    _.map(_.range(num_players - 1), function(i){game.players.unshift({id: null, player: new game_player(game)})});
    // Set self color, leave others default white
    game.get_player(my_id).color = game.self_color;
    // Start 'em moving
    game.get_player(my_id).speed = game.min_speed;
    game.get_player(my_id).message = 'Please remain active while you wait.';
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
    var bRect = game.viewport.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(game.viewport.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(game.viewport.height/bRect.height);

    console.log(game.numObjects)
    //find which shape was clicked
    for (i=0; i < game.numObjects; i++) {
        if  (hitTest(game.objects[i], mouseX, mouseY)) {
            dragging = true;
            if (i > highestIndex) {
                //We will pay attention to the point on the object where the mouse is "holding" the object:
                dragHoldX = mouseX - game.objects[i].x;
                dragHoldY = mouseY - game.objects[i].y;
                highestIndex = i;
                dragIndex = i;
            }
        }
    }
    if (dragging) {
        window.addEventListener("mousemove", mouseMoveListener, false);
    }
    game.viewport.removeEventListener("mousedown", mouseDownListener, false);
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
    game.viewport.addEventListener("mousedown", mouseDownListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    if (dragging) {
        dragging = false;
        window.removeEventListener("mousemove", mouseMoveListener, false);
    }
}

function mouseMoveListener(evt) {
    var posX;
    var posY;
    var shapeRad = game.objects[dragIndex].rad;
    var minX = shapeRad;
    var maxX = game.viewport.width - shapeRad;
    var minY = shapeRad;
    var maxY = game.viewport.height - shapeRad;
    //getting mouse position correctly 
    var bRect = game.viewport.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(game.viewport.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(game.viewport.height/bRect.height);

    //clamp x and y positions to prevent object from dragging outside of canvas
    posX = mouseX - dragHoldX;
    posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
    posY = mouseY - dragHoldY;
    posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

    game.objects[dragIndex].x = Math.round(posX);
    game.objects[dragIndex].y = Math.round(posY);
    game.socket.send("objMove." + dragIndex + "." + Math.round(posX) + "." + Math.round(posY))
    drawScreen(game);
}

function hitTest(shape,mx,my) {

    var dx;
    var dy;
    dx = mx - shape.x;
    dy = my - shape.y;

    //a "hit" will be registered if the distance away from the center is less than the radius of the circular object        
    return (dx*dx + dy*dy < shape.rad*shape.rad);
    }

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
    game.socket.send("h." + document.body.className);
};


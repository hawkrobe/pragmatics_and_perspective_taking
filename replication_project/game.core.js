/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström, 
                  2013 Robert XD Hawkins
    
    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    substantially modified for collective behavior experiments on the web

    MIT Licensed.
*/

/*
  The main game class. This gets created on both server and
  client. Server creates one for each game that is hosted, and each
  client creates one for itself to play the game. When you set a
  variable, remember that it's only set in that instance.
*/
var has_require = typeof require !== 'undefined'

if( typeof _ === 'undefined' ) {
    if( has_require ) {
        _ = require('underscore')
    }
    else throw new Error('mymodule requires underscore, see http://underscorejs.org');
}

var game_core = function(game_instance){

    this.debug = false

    // Define some variables specific to our game to avoid
    // 'magic numbers' elsewhere
    this.instance = game_instance;

    //Store a flag if we are the server instance
    this.server = this.instance !== undefined;

    //Dimensions of world -- Used in collision detection, etc.
    this.world = {width : 500, height : 500};  // 160cm * 3
    this.numObjects = 2;
    this.objects = [];
    this.makeShapes(this.numObjects)
    this.num_rounds = 8;
}; 

/* The player class
        A simple class to maintain state of a player on screen,
        as well as to draw that state when required.
*/

// server side we set the 'game_core' class to a global type, so that
// it can use it in other files (specifically, game.server.js)
if('undefined' != typeof global) {
    module.exports = global.game_core = game_core;
}

// HELPER FUNCTIONS

game_core.prototype.makeShapes = function (numObjects) {
    var i;
    var tempX;
    var tempY;
    var tempRad;
    var tempR;
    var tempG;
    var tempB;
    var tempColor;
    for (i=0; i < numObjects; i++) {
        tempRad = 10 + Math.floor(Math.random()*25);
        tempX = Math.random()*(this.world.width - tempRad);
        tempY = Math.random()*(this.world.height - tempRad);
        tempR = Math.floor(Math.random()*255);
        tempG = Math.floor(Math.random()*255);
        tempB = Math.floor(Math.random()*255);
        tempColor = "rgb(" + tempR + "," + tempG + "," + tempB +")";
        tempShape = {x:tempX, y:tempY, rad:tempRad, color:tempColor};
        this.objects.push(tempShape);
    }
}

// SERVER FUNCTIONS

// Every second, we print out a bunch of information to a file in a
// "data" directory. We keep EVERYTHING so that we
// can analyze the data to an arbitrary precision later on.
// game_core.prototype.writeData = function() {
//     var local_game = this;
//     _.map(local_game.get_active_players(), function(p) {
// 	var player_angle = p.player.angle;
// 	if (player_angle < 0) 
// 	    player_angle = parseInt(player_angle, 10) + 360;
// 	//also, keyboard inputs,  list of players in visibility radius?
// 	var line = String(p.id) + ',';
// 	line += String(local_game.game_clock) + ',';
// 	line += p.player.visible + ',';
// 	line += p.player.pos.x +',';
// 	line += p.player.pos.y +',';
// 	line += p.player.speed +',';
// 	line += player_angle +',';
// 	line += p.player.curr_background +',';
// 	line += p.player.total_points.fixed(2) ;
// 	if(local_game.game_started) {
// 	    local_game.gameDataStream.write(String(line) + "\n",
// 					    function (err) {if(err) throw err;});
// 	} else {
// 	    local_game.waitingDataStream.write(String(line) + "\n",
// 					    function (err) {if(err) throw err;});
// 	}
//     })
// };

// This is a really important function -- it gets called when a round
// has been completed, and updates the database with how much money
// people have made so far. This way, if somebody gets disconnected or
// something, we'll still know what to pay them.
game_core.prototype.server_newgame = function() {
    var local_gamecore = this;
    
    // Don't want players moving during countdown
    //_.map(local_gamecore.get_active_players(), function(p) {p.player.speed = 0;})
        
    //Reset positions
    //this.server_reset_positions();

    //Tell clients about it so they can call their newgame procedure (which does countdown)
    _.map(local_gamecore.get_active_players(), function(p) {
	p.player.instance.send('s.begin_game.')})

    // Launch game after countdown;
    setTimeout(function(){
        local_gamecore.game_started = true;
	local_gamecore.game_clock = 0;
//        _.map(local_gamecore.get_active_players(), function(p) {
//	    p.player.speed = local_gamecore.min_speed});
    }, 3000);
};

// This gets called every iteration of a new game to reset positions
game_core.prototype.server_reset_positions = function() {
    var local_gamecore = this;
    _.map(local_gamecore.get_active_players(), function(p) {
        p.player.pos = get_random_center_position(local_gamecore.world);
        p.player.angle = get_random_angle(local_gamecore.world);
    })
}; 

// MATH FUNCTIONS

get_random_position = function(world) {
    return {
        x: Math.floor((Math.random() * world.width) + 1),
        y: Math.floor((Math.random() * world.height) + 1)
    };
};

// At beginning of round, want to start people close enough 
// together that they can see at least one or two others...
// In circle with radius quarter size of tank.
get_random_center_position = function(world) {
    var theta = Math.random()*Math.PI*2;
    return {
        x: world.width /2 + (Math.cos(theta)* world.width /16),
        y: world.height/2 + (Math.sin(theta)* world.height/16)
    };
}
    
get_random_angle = function() {
    return Math.floor((Math.random() * 360) + 1);
};

// (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}

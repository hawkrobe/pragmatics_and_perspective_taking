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
    this.world = {width : 600, height : 600};  // 160cm * 3
    this.numObjects = 2;
    this.objects = [];
    this.num_rounds = 8;

    if(this.server) {
        this.objects = this.makeObjects(1)
        console.log(this.objects)
        this.players = [{
            id: this.instance.player_instances[0].id, 
            player: new game_player(this,this.instance.player_instances[0].player)
        }];
    } else {
        this.players = [{
            id: null, 
            player: new game_player(this)
        }]
    }
}; 

var game_player = function( game_instance, player_instance) {
    //Store the instance, if any
    this.instance = player_instance;
    this.game = game_instance;
    this.role = ''
    //Set up initial values for our state information
    this.message = '';
    this.id = '';
}; 

/* The player class
        A simple class to maintain state of a player on screen,
        as well as to draw that state when required.
*/

// server side we set some classes to global types, so that
// it can use them in other files (specifically, game.server.js)
if('undefined' != typeof global) {
    module.exports = global.game_core = game_core;
    module.exports = global.game_player = game_player;
    var objectSet = require('./stimuli/objectSet')
}

// HELPER FUNCTIONS

// Method to easily look up player 
game_core.prototype.get_player = function(id) {
    var result = _.find(this.players, function(e){ return e.id == id; });
    return result.player
};

// Method to get list of players that aren't the given id
game_core.prototype.get_others = function(id) {
    return _.without(_.map(_.filter(this.players, function(e){return e.id != id}), 
        function(p){return p.player ? p : null}), null)
};

// Returns all other players
game_core.prototype.get_active_players = function() {
    return _.without(_.map(this.players, function(p){
        return p.player ? p : null}), null)
};

// Takes an objectSetID (between 0 and 8), and returns the corresponding set of objects to be drawn
game_core.prototype.makeObjects = function (objectSetID) {
    // if objectSetID == 1 ... objects = ... 
    var local_this = this;
    return _.map(objectSet.objects[objectSetID], function(obj) {
        var gridCell = local_this.getGridCell(obj.initialCell[0], obj.initialCell[1])
        return _.extend(obj, 
            {x: gridCell.centerX - (obj.width/2),
             y: gridCell.centerY - (obj.height/2)})
    })
}

// maps a grid location to the exact pixel coordinates
// for x = 1,2,3,4; y = 1,2,3,4
game_core.prototype.getGridCell = function (x, y) {
    return {
        centerX: 25 + 68.75 + 137.5 * (x - 1),
        centerY: 25 + 68.75 + 137.5 * (y - 1),
        width: 137.5,
        height: 137.5
    }
}

game_core.prototype.server_send_update = function(){
    //Make a snapshot of the current state, for updating the clients
    var local_game = this;
    
    // Add info about all players
    var player_packet = _.map(local_game.players, function(p){
        return {id: p.id,
            player: null}
        })

    var state = {
            gs : this.game_started,                      // true when game's started
            pt : this.players_threshold,
            pc : this.player_count,
        };
    _.extend(state, {players: player_packet})
    _.extend(state, {objects: this.objects})
    //Send the snapshot to the players
    this.state = state;
    console.log(state)
    _.map(local_game.get_active_players(), function(p){
        p.player.instance.emit( 'onserverupdate', state)})
};

// (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

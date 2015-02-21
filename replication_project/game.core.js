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
    this.round_num = 0;
    this.instruction_num = 0;
    this.num_rounds = 8;
    this.objects = [];
    this.instructions = []
    if(this.server) {
        this.trialList = this.makeTrialList()
        this.objects = this.trialList[this.round_num].objects
        this.instructions = this.trialList[this.round_num].instructions
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

var sampleConditionOrder = function() {
    var orderList = []
    var options = ['exp', 'base']
    _.map(_.range(8), function(i){
        var candidate = _.sample(options)
        // If already two in a row...
        if (_.every(orderList.slice(-2), function(v) {return v === candidate})) {
            orderList.push(_.filter(options, function(v) {return v != candidate})[0])
        } else {
            orderList.push(candidate)
        }
    })
    return orderList
}

var cartesianProductOf = function(listOfLists) {
    return _.reduce(listOfLists, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
};

// Returns random set of unique grid locations
var getLocations = function(numObjects) {
    var possibilities = cartesianProductOf([_.range(1, 5), _.range(1, 5)])

    function getRandomFromBucket() {
        var randomIndex = Math.floor(Math.random()*possibilities.length);
        return possibilities.splice(randomIndex, 1)[0];
    }

    return _.map(_.range(numObjects), function(v) {
        return getRandomFromBucket()
    })
}

// Randomizes objects in the way given by Keysar et al (2003)
game_core.prototype.makeTrialList = function () {
    // 1) Choose order of experimental & baseline (no more than 2 in a row)
    var local_this = this;
    var conditionOrder = sampleConditionOrder()

    // 2) Assign target & distractor based on condition
    var itemList = _.shuffle(objectSet.criticalItems)
    var trialList = _.map(_.range(8), function(i) {
        var condition = conditionOrder[i];
        var item = itemList[i];
        var other = condition === "exp" ? item['distractor'] : item['alt']
        var target = _.extend(item['target'], {target: true})
        var objects = item.hasOwnProperty('additional') ? [target, other, item['additional']] : [target,other]
        return _.extend(_.omit(itemList[i], ['distractor', 'alt', 'target', 'additional']), 
            {condition: condition,
             instructions: item.instructions,
             objects: objects}
            )})

    // 3. assign random initial locations (probably won't want to do this in the real exp.)
    var local_this = this;
    _.map(trialList, function(v) {
        var locs = getLocations(v.objects.length)
        _.map(_.zip(v.objects, locs), function(pair) {
            var obj = pair[0]
            var gridCell = local_this.getGridCell(pair[1][0], pair[1][1])
            obj.x = gridCell.centerX - obj.width/2
            obj.y = gridCell.centerY - obj.height/2
        })
    })
    return trialList
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
    _.extend(state, {instructions: this.instructions})
    if(player_packet.length == 2) {
        _.extend(state, {objects: this.objects})
    }

    //Send the snapshot to the players
    this.state = state;
    _.map(local_game.get_active_players(), function(p){
        p.player.instance.emit( 'onserverupdate', state)})
};

// (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

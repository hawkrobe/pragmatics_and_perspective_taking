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
      _ = require('lodash');
      utils  = require(__base + 'sharedUtils/sharedUtils.js');
    }
    else throw new ('mymodule requires underscore, see http://underscorejs.org');
}

var game_core = function(options){
  this.server = options.server ;
  this.email = 'rxdh@stanford.edu';
  this.projectName = 'ToM';
  this.experimentName = 'replication';
  this.iterationName = 'planned_sample';
  this.dataStore = ['csv', 'mongo'];
  this.anonymizeCSV = true;
  this.bonusAmt = 1; // in cents

  this.players_threshold = 2;
  this.playerRoleNames = {
    role1 : 'director',
    role2 : 'matcher'
  };

  //Dimensions of world -- Used in collision detection, etc.
  this.numHorizontalCells = 4;
  this.numVerticalCells = 4;
  this.cellDimensions = {height : 600, width : 600}; // in pixels
  this.cellPadding = 0;
  this.world = {
    width : 600 * this.numHorizontalCells,
    height : 600 * this.numVerticalCells
  };  // 160cm * 3


  this.roundNum = -1;
  this.instructionNum = -1;
  this.numRounds = 8;
  this.attemptNum = 0; // Increments whenever someone makes a mistake
  this.objects = [];
  this.instructions = [];
  this.currentDestination = [];
  
  if(this.server) {
    this.id = options.id;
    this.expName = options.expName;        
    this.player_count = options.player_count;
    this.trialList = this.makeTrialList();
    this.condition = _.sample(['scripted', 'unscripted']);
    this.streams = {};
    this.players = [{
      id: options.player_instances[0].id,
      instance: options.player_instances[0].player,
      player: new game_player(this,options.player_instances[0].player)
    }];

    this.data = {
      id : this.id,
      subject_information : {
	score: 0,
	gameID: this.id
      }
    };
    this.server_send_update();
  } else {
    this.players = [{
      id: null,
      instance: null,
      player: new game_player(this)
    }];
  }
}; 

var game_player = function( game_instance, player_instance) {
  //Store the instance, if any
  this.instance = player_instance;
  this.game = game_instance;
  this.role = '';
  //Set up initial values for our state information
  this.message = '';
  this.id = '';
}; 

// server side we set some classes to global types, so that
// it can use them in other files (specifically, game.server.js)
if('undefined' != typeof global) {
  module.exports = {game_core, game_player};
  var objectSet = require('./stimuli/objectSet');
}

// HELPER FUNCTIONS

// Method to easily look up player 
game_core.prototype.get_player = function(id) {
  var result = _.find(this.players, function(e){ return e.id == id; });
  return result.player;
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

game_core.prototype.newRound = function() {
  var players = this.get_active_players();
  if(this.instructionNum + 1 < this.instructions.length) {
    console.log('in new instruction');
    this.newInstruction();
    _.forEach(players, p => p.player.instance.emit( 'newRoundUpdate'));
  } else if(this.roundNum == this.numRounds - 1) {
    var local_game = this;
    _.forEach(players, p => p.player.instance.disconnect());
  } else {
    _.forEach(players, p => p.player.instance.emit( 'newRoundUpdate'));
    this.roundNum += 1;
    this.objects = this.trialList[this.roundNum].objects;
    this.instructions = this.trialList[this.roundNum].instructions;
    this.instructionNum = -1;
    this.newInstruction();
  }
}

game_core.prototype.setScriptAndDir = function(instruction) {
  var item = instruction.split(' ')[0];
  var dir = instruction.split(' ')[1];
  var object = _.find(this.objects, function(obj) { return obj.name == item });
  if(this.condition == 'scripted' & object.hasOwnProperty('scriptedInstruction')) {
    this.scriptedInstruction = object.scriptedInstruction;
  } else {
    this.scriptedInstruction = "none";
  }
  var dest;
  switch(dir) {
  case "down" :
    dest = [object.gridX, object.gridY + 1]; break;
  case "up" :
    dest = [object.gridX, object.gridY - 1]; break;
  case "left" :
    dest = [object.gridX - 1, object.gridY]; break;
  case "right" :
    dest = [object.gridX + 1, object.gridY]; break;
  }
  this.currentDestination = _.zipObject(['gridX', 'gridY'], dest);
};

game_core.prototype.newInstruction = function() {
  this.instructionNum += 1;
  console.log('sending new instruction ' + this.instructionNum);
  var instruction = this.instructions[this.instructionNum]
  this.currTarget = instruction.split(' ')[0]; 
  this.setScriptAndDir(instruction)
  this.server_send_update()
}

var sampleConditionOrder = function() {
  var orderList = []
  var options = ['exp', 'base'] 
  while (orderList.length < 8
         || !(_.every(orderList.concat().sort().slice(0,4), function(v) {return v === "base"})
              && _.every(orderList.concat().sort().slice(4,8), function(v) {return v === "exp"}))) {
    orderList = []
    _.map(_.range(8), function(i){
      var candidate = _.sample(options)
      // If already two in a row...
      if (_.every(orderList.slice(-2), function(v) {return v === candidate})) {
        orderList.push(_.filter(options, function(v) {return v != candidate})[0])
      } else {
        orderList.push(candidate)
      }
    })
    console.log(orderList)
  }
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
  var conditionOrder = sampleConditionOrder();

  // 2) Assign target & distractor based on condition
  var critItems = JSON.parse(JSON.stringify(objectSet.criticalItems));
  var itemList = _.shuffle(critItems); 
  var trialList = _.map(_.range(8), function(i) {
    var condition = conditionOrder[i];
    var item = itemList[i];
    var other = condition === "exp" ? item['distractor'] : item['alt'];
    var target = _.extend(item['target'], {target: true});
    var objects = item.otherObjects.concat([target, other]);
    return _.extend({}, _.omit(itemList[i], ['distractor', 'alt', 'target']), {
      condition: condition,
      instructions: item.instructions,
      objects: objects
    });
  });

  // 3. assign initial locations
  _.forEach(trialList, function(v) {
    var locs = getLocations(v.objects.length);
    _.forEach(_.zip(v.objects, locs), function(pair) {
      var obj = pair[0];
      if(obj.hasOwnProperty('initialLoc')){
	obj.gridX = obj.initialLoc[1];
        obj.gridY = obj.initialLoc[0];
      } else {
	obj.gridX = pair[1][0];
        obj.gridY = pair[1][1];
      }
      
      _.extend(obj, local_this.getPixelFromCell(obj));  
    });
  });
  return trialList
}

// maps a grid location to the exact pixel coordinates
// for x = 1,2,3,4; y = 1,2,3,4
game_core.prototype.getPixelFromCell = function (obj) {
  var x = obj.gridX;
  var y = obj.gridY;
  var width = obj.width ? 4 * obj.width : this.cellDimensions.width;
  var height = obj.height ? 4 * obj.height : this.cellDimensions.height;
  var centerX = (this.cellPadding/2 + this.cellDimensions.width * (x - 1)
		 + this.cellDimensions.width / 2);
  var centerY = (this.cellPadding/2 + this.cellDimensions.height * (y - 1)
		 + this.cellDimensions.height / 2);
  var upperLeftX = centerX - width/2;
  var upperLeftY = centerY - height/2;
  return {width, height, centerX, centerY, upperLeftX, upperLeftY};
};

// maps a raw pixel coordinate to to the exact pixel coordinates
// for x = 1,2,3,4; y = 1,2,3,4
game_core.prototype.getCellFromPixel = function (mx, my) {
  return {
    gridX : Math.floor((mx - this.cellPadding) / this.cellDimensions.width) + 1,
    gridY : Math.floor((my - this.cellPadding) / this.cellDimensions.height) + 1
  }
}

game_core.prototype.server_send_update = function(){
  //Make a snapshot of the current state, for updating the clients
  var local_game = this;
  
  // Add info about all players
  var player_packet = _.map(local_game.players, p => {
    return {'id': p.id, 'player': null};
  });

  var state = {
    gs : this.game_started,                      // true when game's started
    pt : this.players_threshold,
    pc : this.player_count,
    dataObj  : this.data,
    roundNum : this.roundNum,
    scriptedInstruction : this.scriptedInstruction,
    attemptNum : this.attemptNum,
    curr_dest : this.currentDestination,
    instructionNum : this.instructionNum
  };

  _.extend(state, {players: player_packet});
  _.extend(state, {instructions: this.instructions});
  if(player_packet.length == 2) {
    _.extend(state, {objects: this.objects});
  }

  //Send the snapshot to the players
  this.state = state;
  _.map(local_game.get_active_players(), function(p){
    p.player.instance.emit( 'onserverupdate', state);
  });
};

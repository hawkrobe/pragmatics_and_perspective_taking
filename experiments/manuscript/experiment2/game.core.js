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

var has_require = typeof require !== 'undefined';

if( typeof _ === 'undefined' ) {
  if( has_require ) {
    _ = require('lodash');
    utils  = require(__base + 'sharedUtils/sharedUtils.js');
    assert = require('assert');
  }
  else throw 'mymodule requires underscore, see http://underscorejs.org';
}

var game_core = function(options){
  // Store a flag if we are the server instance
  this.server = options.server ;

  // Some config settings
  this.email = 'rdhawkins@princeton.edu';
  this.projectName = 'ToM';
  this.experimentName = 'listenerManipulation';
  this.iterationName = 'pilot1';
  this.anonymizeCSV = true;
  this.bonusAmt = 1; // in cents
  
  // save data to the following locations (allowed: 'csv', 'mongo')
  this.dataStore = ['csv', 'mongo'];

  // How many players in the game?
  this.players_threshold = 1;
  this.playerRoleNames = {
    role2 : 'listener'
  };

  //Dimensions of world in pixels and numberof cells to be divided into;
  this.numHorizontalCells = 3;
  this.numVerticalCells = 3;
  this.cellDimensions = {height : 600, width : 600}; // in pixels
  this.cellPadding = 0;
  this.world = {
    height: 600 * this.numVerticalCells,
    width: 600 * this.numHorizontalCells
  };
  
  // Which round are we on (initialize at -1 so that first round is 0-indexed)
  this.roundNum = -1;
  this.numOcclusions = 2;
  
  // How many rounds do we want people to complete?
  this.numRounds = 28;
  this.feedbackDelay = 100;

  // This will be populated with the tangram set
  this.trialInfo = {roles: _.values(this.playerRoleNames)};

  if(this.server) {
    this.id = options.id;
    this.expName = options.expName;
    this.player_count = options.player_count;
    this.objects = require('./images/objects.json');
    this.condition = _.sample(['scripted']);
    this.trialList = this.makeTrialList();
    this.data = {
      id : this.id,
      subject_information : {
	score: 0,
        gameID: this.id
      }
    };
    this.players = [{
      id: options.player_instances[0].id,
      instance: options.player_instances[0].player,
      player: new game_player(this,options.player_instances[0].player)
    }];
    this.streams = {};
  } else {
    // If we're initializing a player's local game copy, create the player object
    this.players = [{
      id: null,
      instance: null,
      player: new game_player(this)
    }];
  }
};

var game_player = function( game_instance, player_instance) {
  this.instance = player_instance;
  this.game = game_instance;
  this.role = '';
  this.message = '';
  this.id = '';
};

// server side we set some classes to global types, so that
// we can use them in other files (specifically, game.server.js)
if('undefined' != typeof global) {
  module.exports = {game_core, game_player};
}

// HELPER FUNCTIONS

// Method to easily look up player
game_core.prototype.get_player = function(id) {
  var result = _.find(this.players, function(e){ return e.id == id; });
  return result.player;
};

// Method to get list of players that aren't the given id
game_core.prototype.get_others = function(id) {
  var otherPlayersList = _.filter(this.players, function(e){ return e.id != id; });
  var noEmptiesList = _.map(otherPlayersList, function(p){return p.player ? p : null;});
  return _.without(noEmptiesList, null);
};

// Returns all players
game_core.prototype.get_active_players = function() {
  var noEmptiesList = _.map(this.players, function(p){return p.player ? p : null;});
  return _.without(noEmptiesList, null);
};

game_core.prototype.getUtterance = function(trialInfo) {
  var stim = trialInfo.currStim.objects;
  var contextType = trialInfo.currContextType;
  var target = _.find(stim, v => v.targetStatus == 'target');
  var relevantDistractors = _.filter(stim, v => v.targetStatus != 'target' && v.shape == target.shape);
  var textureClash = _.filter(relevantDistractors, {'texture' : target.texture});
  var colorClash = _.filter(relevantDistractors, {'color' : target.color});
  var textureAndColorClash = textureClash.length > 0 && colorClash.length > 0;
  var prefix = _.sample(['', 'the ']);
  var longModifier = (
    textureAndColorClash ? target.texture + ' ' + target.color :
      textureClash ? target.color :
      colorClash ? target.texture :
      (_.sample([true, false]) ? target.color : target.texture)
  ) + ' ';

  if(contextType.occlusions == 'critical') {
    return prefix + target.shape;
  } else if(contextType.context == 'close') {
    return prefix + longModifier + target.shape;
  } else {
    return prefix + (_.sample([true, false, false]) ? longModifier + target.shape : target.shape);
  }
};

game_core.prototype.newRound = function(delay) {
  var players = this.get_active_players();
  var localThis = this;
  setTimeout(function() {
    // If you've reached the planned number of rounds, end the game
    if(localThis.roundNum == localThis.numRounds - 1) {
      _.forEach(players, p => p.player.instance.disconnect());
    } else {
      // Tell players
      // Otherwise, get the preset list of tangrams for the new round
      localThis.roundNum += 1;

      localThis.trialInfo = {
	currStim: localThis.trialList[localThis.roundNum],
	currContextType: localThis.contextTypeList[localThis.roundNum],
	roles: _.zipObject(_.map(localThis.players, p =>p.id),
			   _.values(localThis.trialInfo.roles))
      };
      localThis.trialInfo['currUtterance'] = localThis.getUtterance(localThis.trialInfo);
      var state = localThis.server_send_update();
      _.forEach(players, p => p.player.instance.emit( 'newRoundUpdate', state));
    }
  }, delay);
};

game_core.prototype.coordExtension = function(obj, gridCell) {
  return {
    trueX : gridCell.centerX - obj.width/2,
    trueY : gridCell.centerY - obj.height/2,
    gridPixelX: gridCell.centerX - 100,
    gridPixelY: gridCell.centerY - 100
  };
};

// Take condition as argument
// construct context list w/ statistics of condition
game_core.prototype.makeTrialList = function () {
  var that = this;
  var trialList = [];
  this.contextTypeList = [];
  var sequence = this.sampleSequence();
  for (var i = 0; i < this.numRounds; i++) {
    var trialInfo = sequence[i];
    this.contextTypeList.push(trialInfo['trialType']);
    var world = this.sampleTrial(trialInfo['target'], trialInfo['trialType']);
    world.objects = _.map(world.objects, function(obj) {
      var newObj = _.extend(_.clone(obj), {
	width: that.cellDimensions.width * 3/4,
	height: that.cellDimensions.height * 3/4
      });
      return _.extend(newObj, that.coordExtension(newObj, that.getPixelFromCell(obj)));
    });
    trialList.push(world);
  };
  return(trialList);
};

game_core.prototype.genTrialBlock = function() {
  return [].concat(Array(2).fill(    
    {context : 'close', occlusions: 'irrelevant'}
  ).concat(Array(2).fill(
    {context : 'far', occlusions: 'irrelevant'}
  )).concat(Array(2).fill(
    {context : 'close', occlusions: 'critical'}
  )).concat(Array(2).fill(
    {context : 'far', occlusions: 'irrelevant'}
  )));
};

game_core.prototype.practiceBlock = function() {
  return [].concat(Array(1).fill(    
    {context : 'close', occlusions: 'irrelevant'}
  ).concat(Array(3).fill(
    {context : 'far', occlusions: 'irrelevant'}
  )));
};

// Ensure each object appears even number of times, evenly spaced across trial types...?
game_core.prototype.sampleSequence = function() {
  var trials = _.shuffle(this.practiceBlock())
  	.concat(_.shuffle(this.genTrialBlock()))
	.concat(_.shuffle(this.genTrialBlock()))
	.concat(_.shuffle(this.genTrialBlock()));  
  var targetReps = this.numRounds / this.objects.length;
  var trialTypeSequenceLength = trials.length;
  var that = this;
  var proposal = _.map(trials, v => {
    var numDistractors = _.sample([2,3,4]);
    var numObjsOccluded = (v.occlusions == 'none' ? 0 :
			   _.sample(_.range(1, _.min([3, numDistractors]))));
    return {
      target: _.sample(that.objects),
      trialType: _.extend({}, v, {numObjsOccluded, numDistractors})
    };
  });
  return proposal;
};

// Want to make sure there are no adjacent targets (e.g. gap is at least 1 apart?)
function mapPairwise(arr, func){
  var l = [];
  for(var i=0;i<arr.length-1;i++){
    l.push(func(arr[i], arr[i+1]));
  }
  return l;
}

var checkSequence = function(proposalList) {
  return _.every(mapPairwise(proposalList, function(curr, next) {
    return curr.target.subID !== next.target.subID;
  }));
};

// For basic/sub conditions, want to make sure there's at least one distractor at the
// same super/basic level, respectively (otherwise it's a different condition...)
var checkDistractors = function(distractors, target, contextType) {
  if(contextType === 'close') {
    return (_.filter(distractors, ['shape', target.shape]).length == 1
	    && (!_.isEmpty(_.filter(distractors, ['color', target.color]))
		|| !_.isEmpty(_.filter(distractors, ['texture', target.texture]))));
  } else if(contextType === 'far') {
    return (!_.isEmpty(_.filter(distractors, ['texture', target.texture]))
	    || !_.isEmpty(_.filter(distractors, ['color', target.color])));
  } else {
    return true;
  }
};
function containsCell(cellList, cell) {
  return _.some(cellList, function(compCell) {
    return _.isEqual(cell, [compCell.gridX, compCell.gridY]);
  });
};

game_core.prototype.sampleOcclusions = function(objects, contextType) {
  var numObjsOccluded = contextType.numObjsOccluded;
  var totalOcclusions = contextType.occlusions == 'none' ? 0 : this.numOcclusions;
  var numEmptyOccluded = totalOcclusions - contextType.numObjsOccluded;
  var target = _.filter(objects, v => v.targetStatus == 'target')[0];
  var distractors = _.filter(objects, v => v.targetStatus == 'distractor');
  var irrelevantObjs = _.map(_.filter(distractors, v => v.shape != target.shape),'name');
  var occs = [];

  // Ensure critical object is covered in critical condition
  if(contextType.occlusions == 'critical') {
    var criticalObj = _.find(distractors, v => v.critical)['name'];
    var rest = _.sampleSize(irrelevantObjs, numObjsOccluded - 1);
    occs = occs.concat(criticalObj, rest);
  } else if (contextType.occlusions == 'irrelevant') {
    occs = occs.concat(_.sampleSize(irrelevantObjs, numObjsOccluded));
  }
  // Pick empty squares for the rest of the occlusions
  var targetLoc = {'gridX' : target.gridX, 'gridY' : target.gridY};
  var distractorLocs = _.map(distractors, v => {
    return {'gridX' : v.gridX, 'gridY' : v.gridY};
  });
  var occLocs = _.map(_.filter(distractors, v => _.includes(occs, v.name)), v => {
    return {'gridX' : v.gridX, 'gridY' : v.gridY};
  });
  var otherLocs = _.map(_.filter(getAllLocs(), v => {
    var s = distractorLocs.concat(targetLoc);
    return !containsCell(s, v);
  }), v => {
    return {'gridX' : v[0], 'gridY' : v[1]};
  });
  return occLocs.concat(_.sampleSize(otherLocs, numEmptyOccluded));
};

// Randomize number of distractors
game_core.prototype.sampleDistractors = function(target, type) {
  var fCond = (type.context === 'close' ? (v) => {return v.id != target.id;} :
	       type.context === 'far' ?   (v) => {return v.shape != target.shape;} :
	       console.log('ERROR: contextType ' + type.context + ' not recognized'));
  var distractors = _.sampleSize(_.filter(this.objects, fCond), type.numDistractors);
  if(checkDistractors(distractors, target, type.context)) {
    var critical = _.find(distractors, {'shape' : target.shape});
    return _.map(distractors, v => {
      var id = type.context == 'close' ? critical.id : 0;
      return _.extend({}, v, {critical: v.id == id });
    });
  } else {
    return this.sampleDistractors(target, type);
  }
};

// take context type as argument
game_core.prototype.sampleTrial = function(target, contextType) {
  var distractors = this.sampleDistractors(target, contextType);
  var locs = this.sampleStimulusLocs(distractors.concat(target).length);
  var objects = _.map(distractors.concat(target), function(obj, i) {
    return _.extend(_.clone(obj), {
      targetStatus: i == distractors.concat(target).length - 1 ? 'target' : 'distractor',
      gridX: locs[i][0],
      gridY: locs[i][1]
    });
  });
  var occlusions = this.sampleOcclusions(objects, contextType);  
  return {objects, occlusions};
};

// maps a grid location to the exact pixel coordinates
// for x = 1,2,3,4; y = 1,2,3,4
game_core.prototype.getPixelFromCell = function (obj) {
  var x = obj.gridX;
  var y = obj.gridY;
  return {
    centerX: (this.cellPadding/2 + this.cellDimensions.width * (x - 1)
        + this.cellDimensions.width / 2),
    centerY: (this.cellPadding/2 + this.cellDimensions.height * (y - 1)
        + this.cellDimensions.height / 2),
    upperLeftX : (this.cellDimensions.width * (x - 1) + this.cellPadding/2),
    upperLeftY : (this.cellDimensions.height * (y - 1) + this.cellPadding/2),
    width: this.cellDimensions.width,
    height: this.cellDimensions.height
  };
};

function getAllLocs() {
  return [[1,1], [2,1], [3,1],
	  [1,2],        [3,2],
	  [1,3], [2,3], [3,3]];
};

game_core.prototype.sampleStimulusLocs = function(numObjects) {
  return _.sampleSize(getAllLocs(), numObjects);
};

game_core.prototype.server_send_update = function(){
  //Make a snapshot of the current state, for updating the clients
  var local_game = this;

  // Add info about all players
  var player_packet = _.map(local_game.players, function(p){
    return {id: p.id,
            player: null};
  });

  var state = {
    gs : this.game_started,   // true when game's started
    pt : this.players_threshold,
    pc : this.player_count,
    dataObj  : this.data,
    roundNum : this.roundNum,
    trialInfo: this.trialInfo,
    language: this.language,
    allObjects: this.objects
  };
  _.extend(state, {players: player_packet});

  //Send the snapshot to the players
  this.state = state;
  return state;
};

/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström, 2013 Robert XD Hawkins

    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/

    modified for collective behavior experiments on Amazon Mechanical Turk

    MIT Licensed.
*/
    var
        fs    = require('fs'),
        utils = require(__base + '/sharedUtils/sharedUtils.js');

// This is the function where the server parses and acts on messages
// sent from 'clients' aka the browsers of people playing the
// game. For example, if someone clicks on the map, they send a packet
// to the server (check the client_on_click function in game.client.js)
// with the coordinates of the click, which this function reads and
// applies.
var onMessage = function(client,message) {
  //Cut the message up into sub components
  var message_parts = message.split('.');

  //The first is always the type of message
  var message_type = message_parts[0];

  //Extract important variables
  var gc = client.game;
  var id = gc.id;
  var all = gc.get_active_players();
  var target = gc.get_player(client.userid);
  var others = gc.get_others(client.userid);
  switch(message_type) {

  case 'chatMessage' :
    var msg = message_parts[1].replace(/~~~/g,'.');
    _.map(all, function(p){
      p.player.instance.emit( 'chatMessage', {user: client.userid, msg: msg});});
    break;

  case 'updateMouse' :
    break;
    
  case 'clickedObj' :
    // Write event to file
    target.instance.send('s.feedback.' + message_parts[1]);

    // Continue
    gc.newRound(1500);
    break;

  case 'playerTyping' :
    _.map(others, function(p) {
      p.player.instance.emit( 'playerTyping', {typing: message_parts[1]});
    });
    break;

  case 'exitSurvey' :
    break;
    
  case 'h' : // Receive message when browser focus shifts
    target.visible = message_parts[1];
    break;
  }
};

/*
  Associates events in onMessage with callback returning json to be saved
  {
    <eventName>: (client, message_parts) => {<datajson>}
  }
  Note: If no function provided for an event, no data will be written
*/
var dataOutput = function() {
  function getIntendedTargetName(objects) {
    return _.filter(objects, o => o.targetStatus === 'target')[0]['name'];
  }

  function getObjectProperties(objects) {
    return _.map(_.unzip(_.map(objects, o => {
      return [o.name, o.gridX, o.gridY];
    })), l => '[' + l + ']');
  }

  function getObjectLocHeaderArray() {
    return ['names', 'gridXs', 'gridYs'];
  };
  
  function commonOutput (client, message_data) {
    return {
      iterationName: client.game.iterationName,
      gameid: client.game.id,
      trialNum : client.game.state.roundNum + 1,      
      serverTime: Date.now(),
      workerId: client.workerid,
      assignmentId: client.assignmentid
    };
  };

  var mouseOutput = function(client, messageData) {
    var common = commonOutput(client, messageData);
    var object = _.find(client.game.trialInfo.currStim.objects,
			obj => obj.targetStatus == 'target');
    var critical = _.find(client.game.trialInfo.currStim.objects,
			  obj => obj.critical);
    var mouse = {x: messageData[2], y : messageData[3]};
    var target = {x: object.trueX + object.width/2, y: object.trueY + object.height/2};
    var distractor = !critical ? 'none' : {
      x: critical.trueX + critical.width/2, y: critical.trueY + critical.height/2
    };

    var targetDistance = Math.floor(Math.sqrt(
      Math.pow(mouse.x - target.x, 2) + Math.pow(mouse.y - target.y, 2)
    ));

    var distractorDistance = !critical ? 'none' : Math.floor(Math.sqrt(
      Math.pow(mouse.x - distractor.x, 2) + Math.pow(mouse.y - distractor.y, 2)
    ));

    return _.extend({}, common, {
      targetDistance, distractorDistance,
      localTime : messageData[1],
      rawMouseX : mouse.x,
      rawMouseY : mouse.y
    });
  };

  var clickedObjOutput = function(client, message_data) {
    var objects = client.game.trialInfo.currStim.objects;
    var occlusions = client.game.trialInfo.currStim.occlusions;
    var clickedObj = _.find(objects, {'name' : message_data[1]});
    var clickedHiddenObj = _.findIndex(occlusions, o => {
      return _.isMatch(o, { 'gridX' : clickedObj.gridX, 'gridY' : clickedObj.gridY});
    }) > -1;
    var intendedName = getIntendedTargetName(objects);
    var objLocations = _.zipObject(getObjectLocHeaderArray(), getObjectProperties(objects));
    return _.extend(
      {},
      commonOutput(client, message_data),
      client.game.trialInfo.currContextType,
      objLocations, {
	occlusion1: '[' + [occlusions[0]['gridX'], occlusions[0]['gridY']]+ ']',
	occlusion2: '[' + [occlusions[1]['gridX'], occlusions[1]['gridY']] + ']',
	clickedHiddenObj,
	intendedName,
	clickedName: message_data[1],
	correct: intendedName === message_data[1],
	condition: client.game.condition,
	responseRT: message_data[2]
      }
    );
  };

  var exitSurveyOutput = function(client, message_data) {
    var subjInfo = JSON.parse(message_data.slice(1));
    return _.extend({}, _.omit(commonOutput(client, message_data),
			       ['targetImg', 'repNum', 'trialNum', 'context_id']),
		    subjInfo);
  };
  
  var messageOutput = function(client, message_data) {
    var intendedName = getIntendedTargetName(client.game.trialInfo.currStim.objects);
    var output = _.extend({},
      client.game.trialInfo.currContextType,
      commonOutput(client, message_data), {
	intendedName,
	text: message_data[1].replace(/~~~/g, '.'),
	role: client.role,
	typingRT: message_data[2]
      }
    );
    return output;
  };

  return {
    'updateMouse' : mouseOutput,
    'chatMessage' : messageOutput,
    'clickedObj' : clickedObjOutput,
    'exitSurvey' : exitSurveyOutput
  };
}();

module.exports = {dataOutput, onMessage};

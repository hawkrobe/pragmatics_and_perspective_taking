/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström, 2013 Robert XD Hawkins
    
    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    modified for collective behavior experiments on Amazon Mechanical Turk

    MIT Licensed.
*/

//require('look').start()

    var
        use_db      = false,
        game_server = module.exports = { games : {}, game_count:0, assignment:0},
        fs          = require('fs');
	    
    if (use_db) {
	    database    = require(__dirname + "/database"),
	    connection  = database.getConnection();
    }

global.window = global.document = global;
require('./game.core.js');
utils = require('./utils.js');

counter = 0

// This is the function where the server parses and acts on messages
// sent from 'clients' aka the browsers of people playing the
// game. For example, if someone clicks on the map, they send a packet
// to the server (check the client_on_click function in game.client.js)
// with the coordinates of the click, which this function reads and
// applies.
game_server.server_onMessage = function(client,message) {
    console.log("received message: " + message)
    //Cut the message up into sub components
    var message_parts = message.split('.');
    //The first is always the type of message
    var message_type = message_parts[0];
    //console.log("received message: " + message)
    //Extract important variables
    var all = client.game.gamecore.get_active_players();
    var target = client.game.gamecore.get_player(client.userid);
    var others = client.game.gamecore.get_others(client.userid);
    if(message_type == 'objMove') {    // Client is changing angle
        console.log(message_parts)
        var obj = client.game.gamecore.objects[message_parts[1]]
        obj.x = parseInt(message_parts[2])
        obj.y = parseInt(message_parts[3])
        _.map(all, function(p) {
            p.player.instance.emit('objMove', {i: message_parts[1], x: message_parts[2], y: message_parts[3]})
        })
    } else if (message_type == 'chatMessage') {
        var date = message_parts[1]
        var msg = message_parts[2].replace(/-/g,'.')
        console.log(client.role)
        if(client.game.player_count == 2)
            client.game.gamecore.messageStream.write(date + ',' + client.role + ',"' + msg + '"\n')
        _.map(all, function(p){
            p.player.instance.emit( 'chatMessage', {user: client.userid, msg: msg})})
    } else if (message_type == 'update_mouse') {
        var date = message_parts[1]
        var x = message_parts[2]
        var y = message_parts[3]
        client.game.gamecore.mouseDataStream.write(String(date + ',' + x + ',' + y ) + "\n",
            function (err) {if(err) throw err;});    
    } else if (message_type == "h") { // Receive message when browser focus shifts
        target.visible = message_parts[1];
    } 
};

/* 
   The following functions should not need to be modified for most purposes
*/

// This is the important function that pairs people up into 'rooms'
// all independent of one another.
game_server.findGame = function(player) {
    this.log('looking for a game. We have : ' + this.game_count);
    //if there are any games created, add this player to it!
    if(this.game_count) {
       var joined_a_game = false;
        for (var gameid in this.games) {
            if(!this.games.hasOwnProperty(gameid)) continue;
            var game = this.games[gameid];
            var gamecore = game.gamecore;
            if(game.player_count < gamecore.players_threshold) { 
                joined_a_game = true;
                
                // player instances are array of actual client handles
                game.player_instances.push({
                    id: player.userid, 
                    player: player
                });
                game.player_count++;
                
                // players are array of player objects
                game.gamecore.players.push({
                    id: player.userid, 
                    player: new game_player(gamecore,player)
                });

                // Establish write streams
                var d = new Date();
                var start_time = d.getFullYear() + '-' + d.getMonth() + 1 + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds() + '-' + d.getMilliseconds()
                var name = start_time + '_' + game.id;
                var mouse_f = "data/mouse/" + name + ".csv"
                var message_f = "data/message/" + name + ".csv"
                fs.writeFile(mouse_f, "time, mouseX, mouseY\n", function (err) {if(err) throw err;})
                game.gamecore.mouseDataStream = fs.createWriteStream(mouse_f, {'flags' : 'a'});
                fs.writeFile(message_f, "time, sender, contents\n", function (err) {if(err) throw err;})
                game.gamecore.messageStream = fs.createWriteStream(message_f, {'flags' : 'a'});
                console.log('game ' + game.id + ' starting with ' + game.player_count + ' players...')
    
                // Attach game to player so server can look at it later
                player.game = game;
                player.role = 'agent';

                // notify new player that they're joining game
                player.send('s.join.' + gamecore.players.length + '.' + player.role)

                // notify existing players that someone new is joining
                _.map(gamecore.get_others(player.userid), 
                    function(p){p.player.instance.send( 's.add_player.' + player.userid)})
                gamecore.server_send_update()
                gamecore.player_count = game.player_count;
            }
        }
        if(!joined_a_game) { // if we didn't join a game, we must create one
            this.createGame(player);
        }
    }
    else { 
        //no games? create one!
        this.createGame(player);
    }
}; 

// Will run when first player connects
game_server.createGame = function(player) {
    var players_threshold = 2

    var d = new Date();
    var start_time = d.getFullYear() + '-' + d.getMonth() + 1 + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds() + '-' + d.getMilliseconds()
    var gameID = utils.UUID();

    var name = start_time + '_' + gameID;
    
    //Create a new game instance
    var game = {
	//generate a new id for the game
        id : gameID,           
	//store list of players in the game
        player_instances: [{id: player.userid, player: player}],
	//for simple checking of state
        player_count: 1             
    };
    
    //Create a new game core instance (defined in game.core.js)
    game.gamecore = new game_core(game);

    // Tell the game about its own id
    game.gamecore.game_id = gameID;
    game.gamecore.players_threshold = players_threshold
    game.gamecore.player_count = 1
    
    // assign role
    player.game = game;
    player.role = 'director';
    player.send('s.join.' + game.gamecore.players.length + '.' + player.role)
    this.log('player ' + player.userid + ' created a game with id ' + player.game.id);

    // add to game collection
    this.games[ game.id ] = game;
    this.game_count++;
    
    game.gamecore.server_send_update()
    return game;
}; 

// we are requesting to kill a game in progress.
// This gets called if someone disconnects
game_server.endGame = function(gameid, userid) {
    var thegame = this.games [ gameid ];
    if(thegame) {
        //if the game has more than one player, it's fine -- let the others keep playing, but let them know
        var player_metric = (thegame.active 
			     ? thegame.gamecore.get_active_players().length 
			     : thegame.player_count)
        console.log("removing... game has " + player_metric + " players")
        if(player_metric > 1) {
            var i = _.indexOf(thegame.gamecore.players, _.findWhere(thegame.gamecore.players, {id: userid}))
            thegame.gamecore.players[i].player = null;

            // If the game hasn't started yet, allow more players to fill their place. after it starts, don't.
            if (!thegame.active) {
                thegame.player_count--;
		thegame.gamecore.player_count = thegame.player_count;
	    }
        } else {
            delete this.games[gameid];
            this.game_count--;
            this.log('game removed. there are now ' + this.game_count + ' games' );
        }
    } else {
        this.log('that game was not found!');
    }   
}; 

//A simple wrapper for logging so we can toggle it,
//and augment it for clarity.
game_server.log = function() {
    console.log.apply(this,arguments);
};
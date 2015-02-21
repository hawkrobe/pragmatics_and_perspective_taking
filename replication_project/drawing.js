
drawGrid = function(game, occludedList){
    //size of canvas
    var cw = game.viewport.width;
    var ch = game.viewport.height;

    //padding around grid
    var p = 25;

    //grid width and height
    var bw = cw - (p*2) ;
    var bh = ch - (p*2) ;

    for (var x = 0; x <= bw; x += Math.floor((cw - 2*p) / 4)) {
        game.ctx.moveTo(0.5 + x + p, p);
        game.ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += Math.floor((ch - 2*p) / 4)) {
        game.ctx.moveTo(p, 0.5 + x + p);
        game.ctx.lineTo(bw + p, 0.5 + x + p);
    }

    game.ctx.strokeStyle = "white";
    game.ctx.stroke();
}

drawObjects = function(game) {
    var i;
    _.map(game.objects, function(obj) { 
        game.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
    })
}
  
drawScreen = function(game, player) {
    //bg
    game.ctx.fillStyle = "#000000";
    game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);
    if (game.players.length == 2) {
        drawGrid(game);
        drawObjects(game);       
    } else {
        console.log("drawing message?")
        // Draw message in center (for countdown, e.g.)
        game.ctx.font = "bold 23pt Helvetica";
        game.ctx.fillStyle = 'red';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(player.message, game.world.width/2, game.world.height/2);
    }
}
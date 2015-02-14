
drawGrid = function(game){
    //size of canvas
    var cw = game.viewport.width;
    var ch = game.viewport.height;

    //padding around grid
    var p = 25;

    //grid width and height
    var bw = cw - (p*2) ;
    var bh = ch - (p*2) ;

    for (var x = 0; x <= bw; x += 100) {
        game.ctx.moveTo(0.5 + x + p, p);
        game.ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 100) {
        game.ctx.moveTo(p, 0.5 + x + p);
        game.ctx.lineTo(bw + p, 0.5 + x + p);
    }

    game.ctx.strokeStyle = "white";
    game.ctx.stroke();
}

drawShapes = function(game) {
        var i;
        for (i=0; i < game.numObjects; i++) {
            game.ctx.fillStyle = game.objects[i].color;
            game.ctx.beginPath();
            game.ctx.arc(game.objects[i].x, game.objects[i].y, game.objects[i].rad, 0, 2*Math.PI, false);
            game.ctx.closePath();
            game.ctx.fill();
        }
    }
    
drawScreen = function(game) {
        //bg
        game.ctx.fillStyle = "#000000";
        game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);
        drawGrid(game);
        drawShapes(game);       
    }
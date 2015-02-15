
drawGrid = function(game, occludedList){
    //size of canvas
    var cw = game.viewport.width;
    var ch = game.viewport.height;

    //padding around grid
    var p = 25;

    console.log(cw, ch)
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
            var imgObj = new Image()
            imgObj.src = obj.url
            imgObj.onload = function() {
                game.ctx.drawImage(imgObj, obj.x, obj.y, obj.width, obj.height)
            }
        })
}
    
drawScreen = function(game) {
        //bg
        game.ctx.fillStyle = "#000000";
        game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);
        drawGrid(game);
        drawObjects(game);       
    }
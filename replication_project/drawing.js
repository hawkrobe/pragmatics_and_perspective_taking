
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
        
        drawShapes(game);       
    }
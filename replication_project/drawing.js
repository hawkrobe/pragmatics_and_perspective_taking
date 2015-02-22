var drawGrid = function(game, occludedList){
    //size of canvas
    var cw = game.viewport.width;
    var ch = game.viewport.height;

    //padding around grid
    var p = 25;

    //grid width and height
    var bw = cw - (p*2) ;
    var bh = ch - (p*2) ;

    // vertical lines
    for (var x = 0; x <= bw; x += Math.floor((cw - 2*p) / 4)) {
        game.ctx.moveTo(0.5 + x + p, p);
        game.ctx.lineTo(0.5 + x + p, bh + p);}

    // horizontal lines
    for (var x = 0; x <= bh; x += Math.floor((ch - 2*p) / 4)) {
        game.ctx.moveTo(p, 0.5 + x + p);
        game.ctx.lineTo(bw + p, 0.5 + x + p);}

    game.ctx.lineWidth = 1;
    game.ctx.strokeStyle = "white";
    game.ctx.stroke();
}

var drawObjects = function(game) {
    _.map(game.objects, function(obj) { 
        game.ctx.drawImage(obj.img, obj.trueX, obj.trueY, obj.width, obj.height)
    })
}

var drawInstructions = function(game) {
    console.log(game.instructionNum)
    var instruction = game.instructions[game.instructionNum]
    var item = instruction.split(' ')[0]
    var dir = instruction.split(' ')[1]
    var object = _.find(game.objects, function(obj) { return obj.name == item })
    var origin = game.getPixelFromCell(object.gridX,object.gridY)
    var dest = game.getPixelFromCell(game.currentDestination[0], game.currentDestination[1])
    drawArrow(game, origin.centerX, origin.centerY, 
              dest.centerX, dest.centerY, 50)
    console.log("calling instructions")
    console.log(game.instructions)
}

var drawScreen = function(game, player) {
    //bg
    game.ctx.fillStyle = "#000000";
    game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);
    if (game.players.length == 2) {
        drawGrid(game);
        drawObjects(game);   
        if(player.role == "director")
            drawInstructions(game)
    } else {
        // Draw message in center (for countdown, e.g.)
        game.ctx.font = "bold 23pt Helvetica";
        game.ctx.fillStyle = 'red';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(player.message, game.world.width/2, game.world.height/2);
    }
}

var drawArrow=function(game,x1,y1,x2,y2,d) {
  // Ceason pointed to a problem when x1 or y1 were a string, and concatenation
  // would happen instead of addition
  if(typeof(x1)=='string') x1=parseInt(x1);
  if(typeof(y1)=='string') y1=parseInt(y1);
  if(typeof(x2)=='string') x2=parseInt(x2);
  if(typeof(y2)=='string') y2=parseInt(y2);

  // For ends with arrow we actually want to stop before we get to the arrow
  // so that wide lines won't put a flat end on the arrow.
  var dist=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var ratio=(dist-d/3)/dist;
  var tox=Math.round(x1+(x2-x1)*ratio);
  var toy=Math.round(y1+(y2-y1)*ratio);
  var fromx=x1;
  var fromy=y1;

  // Draw the shaft of the arrow
  game.ctx.beginPath();
  game.ctx.strokeStyle = '#ff0000';
  game.ctx.lineWidth = 10;
  game.ctx.moveTo(fromx,fromy);
  game.ctx.lineTo(tox,toy);
  game.ctx.stroke();

  // calculate the angle of the line
  var lineangle=Math.atan2(y2-y1,x2-x1);
  // h is the line length of a side of the arrow head
  var angle = Math.PI/8 
  var h=Math.abs(d/Math.cos(angle));

  var angle1=lineangle+Math.PI+angle;
  var topx=x2+Math.cos(angle1)*h;
  var topy=y2+Math.sin(angle1)*h;
  var angle2=lineangle+Math.PI-angle;
  var botx=x2+Math.cos(angle2)*h;
  var boty=y2+Math.sin(angle2)*h;
  drawHead(game,topx,topy,x2,y2,botx,boty);
}

var drawHead = function(game,x0,y0,x1,y1,x2,y2){
  if(typeof(x0)=='string') x0=parseInt(x0);
  if(typeof(y0)=='string') y0=parseInt(y0);
  if(typeof(x1)=='string') x1=parseInt(x1);
  if(typeof(y1)=='string') y1=parseInt(y1);
  if(typeof(x2)=='string') x2=parseInt(x2);
  if(typeof(y2)=='string') y2=parseInt(y2);
  var radius=3;
  var twoPI=2*Math.PI;

  // all cases do this.
  game.ctx.save();
  game.ctx.beginPath();
  game.ctx.moveTo(x0,y0);
  game.ctx.lineTo(x1,y1);
  game.ctx.lineTo(x2,y2);

  //filled head, add the bottom as a quadraticCurveTo curve and fill
  var cpx=(x0+x1+x2)/3;
  var cpy=(y0+y1+y2)/3;
  game.ctx.quadraticCurveTo(cpx,cpy,x0,y0);
  game.ctx.fillStyle = '#FF0000';
  game.ctx.fill();
  game.ctx.restore();
};
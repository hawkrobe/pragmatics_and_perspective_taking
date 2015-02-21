var drawGrid = function(game, occludedList){
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
    game.ctx.lineWidth = 1;
    game.ctx.strokeStyle = "white";
    game.ctx.stroke();
}

var drawObjects = function(game) {
    var i;
    _.map(game.objects, function(obj) { 
        game.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
    })
}

var drawScreen = function(game, player) {
    //bg
    game.ctx.fillStyle = "#000000";
    game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);
    if (game.players.length == 2) {
        drawGrid(game);
        drawObjects(game);   
        console.log(player.role)
        if(player.role == "director")
            drawInstructions(game)
    } else {
        console.log("drawing message?")
        // Draw message in center (for countdown, e.g.)
        game.ctx.font = "bold 23pt Helvetica";
        game.ctx.fillStyle = 'red';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(player.message, game.world.width/2, game.world.height/2);
    }
}

var drawInstructions = function(game) {
    var origin = game.getGridCell(1,1)
    var dest = game.getGridCell(1,2)
    drawArrow(game, origin.centerX, origin.centerY, dest.centerX, dest.centerY, 3, 1, undefined, 50)
    console.log("calling instructions")
    console.log(game.instructions)
}

var drawArrow=function(game,x1,y1,x2,y2,style,which,angle,d) {
  // Ceason pointed to a problem when x1 or y1 were a string, and concatenation
  // would happen instead of addition
  if(typeof(x1)=='string') x1=parseInt(x1);
  if(typeof(y1)=='string') y1=parseInt(y1);
  if(typeof(x2)=='string') x2=parseInt(x2);
  if(typeof(y2)=='string') y2=parseInt(y2);
  style=typeof(style)!='undefined'? style:3;
  which=typeof(which)!='undefined'? which:1; // end point gets arrow
  angle=typeof(angle)!='undefined'? angle:Math.PI/8;
  d    =typeof(d)    !='undefined'? d    :10;
  // default to using drawHead to draw the head, but if the style
  // argument is a function, use it instead
  var toDrawHead=typeof(style) != 'function' ? drawHead : style;

  // For ends with arrow we actually want to stop before we get to the arrow
  // so that wide lines won't put a flat end on the arrow.
  //
  var dist=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var ratio=(dist-d/3)/dist;
  var tox, toy,fromx,fromy;
  if(which&1){
    tox=Math.round(x1+(x2-x1)*ratio);
    toy=Math.round(y1+(y2-y1)*ratio);
  }else{
    tox=x2;
    toy=y2;
  }
  if(which&2){
    fromx=x1+(x2-x1)*(1-ratio);
    fromy=y1+(y2-y1)*(1-ratio);
  }else{
    fromx=x1;
    fromy=y1;
  }

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
  var h=Math.abs(d/Math.cos(angle));

  if(which&1){  // handle far end arrow head
    var angle1=lineangle+Math.PI+angle;
    var topx=x2+Math.cos(angle1)*h;
    var topy=y2+Math.sin(angle1)*h;
    var angle2=lineangle+Math.PI-angle;
    var botx=x2+Math.cos(angle2)*h;
    var boty=y2+Math.sin(angle2)*h;
    toDrawHead(game,topx,topy,x2,y2,botx,boty,style);
  }
  if(which&2){ // handle near end arrow head
    var angle1=lineangle+angle;
    var topx=x1+Math.cos(angle1)*h;
    var topy=y1+Math.sin(angle1)*h;
    var angle2=lineangle-angle;
    var botx=x1+Math.cos(angle2)*h;
    var boty=y1+Math.sin(angle2)*h;
    toDrawHead(game,topx,topy,x1,y1,botx,boty,style);
  }
}

var drawHead = function(game,x0,y0,x1,y1,x2,y2,style){
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
  switch(style){
    case 0:
      // curved filled, add the bottom as an arcTo curve and fill
      var backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
      game.ctx.arcTo(x1,y1,x0,y0,.55*backdist);
      game.ctx.fill();
      break;
    case 1:
      // straight filled, add the bottom as a line and fill.
      game.ctx.beginPath();
      game.ctx.moveTo(x0,y0);
      game.ctx.lineTo(x1,y1);
      game.ctx.lineTo(x2,y2);
      game.ctx.lineTo(x0,y0);
      game.ctx.fill();
      break;
    case 2:
      // unfilled head, just stroke.
      game.ctx.stroke();
      break;
    case 3:
      //filled head, add the bottom as a quadraticCurveTo curve and fill
      var cpx=(x0+x1+x2)/3;
      var cpy=(y0+y1+y2)/3;
      game.ctx.quadraticCurveTo(cpx,cpy,x0,y0);
      game.ctx.fillStyle = '#FF0000';
      game.ctx.fill();
      break;
    case 4:
      //filled head, add the bottom as a bezierCurveTo curve and fill
      var cp1x, cp1y, cp2x, cp2y,backdist;
      var shiftamt=5;
      if(x2==x0){
    // Avoid a divide by zero if x2==x0
    backdist=y2-y0;
    cp1x=(x1+x0)/2;
    cp2x=(x1+x0)/2;
    cp1y=y1+backdist/shiftamt;
    cp2y=y1-backdist/shiftamt;
      }else{
    backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
    var xback=(x0+x2)/2;
    var yback=(y0+y2)/2;
    var xmid=(xback+x1)/2;
    var ymid=(yback+y1)/2;

    var m=(y2-y0)/(x2-x0);
    var dx=(backdist/(2*Math.sqrt(m*m+1)))/shiftamt;
    var dy=m*dx;
    cp1x=xmid-dx;
    cp1y=ymid-dy;
    cp2x=xmid+dx;
    cp2y=ymid+dy;
      }

      game.ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x0,y0);
      game.ctx.fill();
      break;
  }
  game.ctx.restore();
};
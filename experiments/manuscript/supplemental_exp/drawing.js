// drawing.js
// This file contains functions to draw on the HTML5 canvas

function containsCell(cellList, cell) {
  return _.some(cellList, function(compCell) {
    return _.isEqual(cell, [compCell.gridX, compCell.gridY]);
  });
};

// called when all images are loaded
function drawOcclusionImages() {
  for(var i = 0; i < globalGame.occlusionImages.length; i++) {
    var obj = globalGame.occlusionImages[i];
    globalGame.ctx.drawImage(obj.img, obj.upperLeftX, obj.upperLeftY,
			     obj.width, obj.height);
  }
  drawObjects(globalGame);
}

// common loader keeping track if loads
function occlusionCounter() {
  globalGame.occlusionCount--;
  if (globalGame.occlusionCount === 0)
    drawOcclusionImages();
}

// Draws a grid of cells on the canvas (evenly divided
var drawGrid = function(game){
    //size of canvas
    var cw = game.viewport.width;
    var ch = game.viewport.height;

    //padding around grid
    var p = game.cellPadding / 2;

    //grid width and height
    var bw = cw - (p*2) ;
    var bh = ch - (p*2) ;

    game.ctx.beginPath();

    // vertical lines
  for (var x = 0; x <= bw; x += Math.floor((cw - 2*p) / game.numHorizontalCells)) {
        game.ctx.moveTo(0.5 + x + p, p);
        game.ctx.lineTo(0.5 + x + p, bh + p);}

    // horizontal lines
    for (var x = 0; x <= bh; x += Math.floor((ch - 2*p) / game.numVerticalCells)) {
        game.ctx.moveTo(p, 0.5 + x + p);
        game.ctx.lineTo(bw + p, 0.5 + x + p);}

  game.ctx.lineWidth = '5';
  game.ctx.strokeStyle = "#000000";
  game.ctx.stroke();
};

// Preload so that all images render at same time
var loadImages = function(sources, callback) {
  var numLoaded = 0;
  var images = {};
  _.forEach(sources, function(source) {
    images[source.name] = new Image();
    images[source.name].onload = function() {
      if(++numLoaded >= sources.length) {
	callback(images);
      }
    };
    images[source.name].src = source.url;
  });
};

// Loop through the object list and draw each one in its specified location
var drawObjects = function(game) {
  var numloaded = 0;
  loadImages(game.objects, function(images) {
    _.forEach(game.objects, function(obj) {
      game.ctx.drawImage(images[obj.name], obj.trueX, obj.trueY, obj.width, obj.height);
    });
  });
};

var drawScreen = function(game, player) {
  // draw background
  game.ctx.fillStyle = "#FFFFFF";
  game.ctx.fillRect(0,0,game.viewport.width,game.viewport.height);

  // Draw message in center (for countdown, e.g.)
  if (player.message) {
    wrapText(game, player.message,
             game.world.width/2, game.world.height/4,
             game.world.width*4/5,
             170);
  } else {
    drawGrid(game);
    // Preload occlusion images then draw objects afterward
    drawOcclusions(game);
    if (game.my_role === game.playerRoleNames.role1) {
      highlightCell(game, '#FF8300', x => x.targetStatus == 'target');
    }
  }
};

var drawClickPoint = function(game) {
  var centerX = game.viewport.width / 2;
  var centerY = game.viewport.height / 2;
  var radius = 30;

  game.ctx.beginPath();
  game.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  game.ctx.fillStyle = 'green';
  game.ctx.fill();
  game.ctx.lineWidth = 3;
  game.ctx.strokeStyle = '#003300';
  game.ctx.stroke();
}

var drawOcclusions = function(game) {
  if(_.isEmpty(game.occlusions)) {
    drawObjects(game);
  } else {
    game.occlusionImages = [];
    game.occlusionCount = game.occlusions.length;
    _.map(game.occlusions, function(loc) {
      var cell = game.getPixelFromCell(loc);
      var imgObj = new Image();
      imgObj.onload = occlusionCounter;
      imgObj.src = (game.my_role == game.playerRoleNames.role1 ?
		    './images/mystery.jpg' :
		    './images/mystery_noQ.jpg');
      game.occlusionImages.push(_.extend(cell, {img: imgObj}));
    });
  }
};

function drawFeedbackIcon(game, outcome, obj) {
  var imgObj = new Image();
  imgObj.src = outcome == 'correct' ? './images/checkmark.png' : './images/xxx.png';
  imgObj.onload = () => {
    game.ctx.drawImage(imgObj, obj.trueX + obj.width/4, obj.trueY + obj.height/4,
		       obj.width/2, obj.height/2);
  };
}

function drawViewerFeedback(game, scoreDiff, clickedObjName) {
  var clickedObj = _.filter(game.objects, x => x.name == clickedObjName)[0];
  if (scoreDiff > 0) {
    highlightCell(game, '#19A319', x => x.targetStatus == 'target');
    drawFeedbackIcon(game, 'correct', clickedObj);     
    setTimeout(() => {
      $('#feedback').html('Great job! You correctly identified the target!');
    }, game.feedbackDelay);
  } else {
    highlightCell(game, '#C83232', x => x.name == clickedObjName);
    highlightCell(game, '#19A319', x => x.targetStatus == 'target');
    drawFeedbackIcon(game, 'incorrect', clickedObj); 
    setTimeout(() => {
      $('#feedback').html('Sorry... The real target was the object outlined in '
			  + 'green'.fontcolor("#19A319").bold() + '.');
    }, game.feedbackDelay);
  }
};

var highlightCell = function(game, color, condition) {
  var targetObjects = _.filter(game.objects, condition);
  for (var i = 0; i < targetObjects.length; i++){
    var obj = targetObjects[i];
    var upperLeftX = game.getPixelFromCell(obj).upperLeftX;
    var upperLeftY = game.getPixelFromCell(obj).upperLeftY;
    game.ctx.globalCompositeOperation='source-over';
    if (upperLeftX != null && upperLeftY != null) {
      game.ctx.beginPath();
      game.ctx.lineWidth="20";
      game.ctx.strokeStyle=color;
      game.ctx.rect(upperLeftX +10 , upperLeftY +10 ,game.cellDimensions.width-20,game.cellDimensions.height-20);
      game.ctx.stroke();
    }
  }
};

// This is a helper function to write a text string onto the HTML5 canvas.
// It automatically figures out how to break the text into lines that will fit
// Input:
//    * game: the game object (containing the ctx canvas object)
//    * text: the string of text you want to writ
//    * x: the x coordinate of the point you want to start writing at (in pixels)
//    * y: the y coordinate of the point you want to start writing at (in pixels)
//    * maxWidth: the maximum width you want to allow the text to span (in pixels)
//    * lineHeight: the vertical space you want between lines (in pixels)
function wrapText(game, text, x, y, maxWidth, lineHeight) {
  var cars = text.split("\n");
  game.ctx.font = "bold 80pt Helvetica";
  game.ctx.textAlign = 'center';
  game.ctx.fillStyle = 'black';

  for (var ii = 0; ii < cars.length; ii++) {

    var line = "";
    var words = cars[ii].split(" ");

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = game.ctx.measureText(testLine);
      var testWidth = metrics.width;

      if (testWidth > maxWidth) {
        game.ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    game.ctx.fillText(line, x, y);
    y += lineHeight;
  }
}

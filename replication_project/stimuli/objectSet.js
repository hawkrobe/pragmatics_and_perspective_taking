// Indexed by object set ID

var sunGlasses = {url: 'stimuli/sunglasses.jpg', width: 130, height: 65}
var glassesCase = {url: 'stimuli/glassesCase.jpg', width : 100, height: 107}
var soccerBall = {url: 'stimuli/soccerBall.jpg', width: 100, height: 100}

var topBlock = {url: 'stimuli/topBlock.jpg', width: 80, height: 50}
var bottomBlock = {url: 'stimuli/bottomBlock.jpg', width: 80, height: 80}
var stapler = {url: 'stimuli/stapler.jpg'}

var cassetteTape = {url: 'stimuli/cassetteTape.jpg', width: 87.5, height: 55,}
var rollOfTape = {url: 'stimuli/rollOfTape.jpg', width: 83, height: 83}
var battery = {url: 'stimuli/battery.jpg', width: 50, height: 80}

var largeMeasuringCup = {url: 'stimuli/largeMeasuringCup.jpg', width : 150, height: 150}
var mediumMeasuringCup = {url: 'stimuli/mediumMeasuringCup.jpg', width : 100, height: 100}
var smallMeasuringCup = {url: 'stimuli/smallMeasuringCup.jpg', width : 60, height: 60}
var umbrella = {url: 'stimuli/umbrella.jpg', width: 80, height: 80}

var roundBrush = {url: 'stimuli/roundBrush.jpg', width: 80, height: 80}
var hairBrush = {url: 'stimuli/hairBrush.jpg', width :80, height:80}
var skate = {url: 'stimuli/skate.jpg', width: 80, height: 80}

var boardEraser = {url: 'stimuli/boardEraser.jpg', width:80, height: 80}
var pencilEraser = {url: 'stimuli/pencilEraser.jpg', width:80, height: 80}
var brain = {url: 'stimuli/brain.jpg', width: 80, height:80}

var smallCandle = {url: 'stimuli/smallCandle.jpg', width:80, height: 80}
var mediumCandle = {url: 'stimuli/mediumCandle.jpg', width:80, height: 80}
var largeCandle = {url: 'stimuli/largeCandle.jpg', width:100, height: 100}
var flower = {url: 'stimuli/flower.jpg', width: 80, height: 80}

var computerMouse = {url: 'stimuli/computerMouse.jpg', width:80, height: 80}
var toyMouse = {url: 'stimuli/toyMouse.jpg', width:80, height: 80}
var camera = {url: 'stimuli/camera.jpg', width:80, height: 80}



var criticalItems = [
	{
		instruction: "the glasses", 
		target: sunGlasses,
		distractor: glassesCase,
		alt: soccerBall
	},{
		instruction: "the bottom block",
		target: topBlock,
		distractor: bottomBlock,
		alt: stapler
	},{
		instruction: "the tape",
		target: cassetteTape,
		distractor: rollOfTape,
		alt: battery
	},{
		instruction: "the large measuring cup",
		target: mediumMeasuringCup,
		distractor: largeMeasuringCup,
		additional: smallMeasuringCup,
		alt: umbrella
	},{
		instruction: "the brush",
		target: roundBrush,
		distractor: hairBrush,
		alt: skate
	},{
		instruction: "the eraser",
		target: boardEraser,
		distractor: pencilEraser,
		alt: brain
	},{
		instruction: "the small candle",
		target: mediumCandle,
		distractor: smallCandle,
		additional: largeCandle,
		alt: flower
	},{
		instruction: "the mouse",
		target: computerMouse,
		distractor: toyMouse,
		alt: camera
}]

module.exports = {criticalItems: criticalItems}

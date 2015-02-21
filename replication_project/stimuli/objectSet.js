// Indexed by object set ID

var sunGlasses = {url: 'stimuli/sunglasses.jpg', name: "sunglasses", 
	scriptedInstruction: "the glasses", width: 130, height: 65}
var glassesCase = {url: 'stimuli/glassesCase.png', name: "glassesCase", width : 100, height: 107}
var soccerBall = {url: 'stimuli/soccerBall.jpg', name: "soccerBall", width: 100, height: 100}

var topBlock = {url: 'stimuli/topBlock.jpg', name: "topBlock", 
	scriptedInstruction: "the bottom block", width: 80, height: 80}
var bottomBlock = {url: 'stimuli/bottomBlock.jpg', name: "bottomBlock", width: 80, height: 80}
var stapler = {url: 'stimuli/stapler.jpg', name: "stapler", width: 80, height: 80}

var cassetteTape = {url: 'stimuli/cassetteTape.jpg', name: "cassetteTape", 
	scriptedInstruction: "the tape", width: 87.5, height: 55,}
var rollOfTape = {url: 'stimuli/rollOfTape.jpg', name: "rollOfTape", width: 83, height: 83}
var battery = {url: 'stimuli/battery.jpg', name: "battery", width: 50, height: 80}

var largeMeasuringCup = {url: 'stimuli/largeMeasuringCup.jpg', name: "largeMeasuringCup", 
	scriptedInstruction: "the large measuring cup", width : 150, height: 150}
var mediumMeasuringCup = {url: 'stimuli/mediumMeasuringCup.jpg', name: "mediumMeasuringCup", width : 100, height: 100}
var smallMeasuringCup = {url: 'stimuli/smallMeasuringCup.jpg', name: "smallMeasuringCup", width : 60, height: 60}
var umbrella = {url: 'stimuli/umbrella.jpg', name: "umbrella", width: 80, height: 80}

var roundBrush = {url: 'stimuli/roundBrush.jpg', name: "roundBrush", 
	scriptedInstruction: "the brush", width: 80, height: 80}
var hairBrush = {url: 'stimuli/hairBrush.jpg', name: "hairBrush", width :80, height:80}
var skate = {url: 'stimuli/skate.jpg', name: "skate", width: 80, height: 80}

var boardEraser = {url: 'stimuli/boardEraser.jpg', name: "boardEraser", 
    scriptedInstruction: "the eraser", width:80, height: 80}
var pencilEraser = {url: 'stimuli/pencilEraser.jpg', name: "pencilEraser", width:80, height: 80}
var brain = {url: 'stimuli/brain.jpg', name: "brain", width: 80, height:80}

var smallCandle = {url: 'stimuli/smallCandle.jpg', name: "smallCandle", 
	scriptedInstruction: "the small candle", width:80, height: 80}
var mediumCandle = {url: 'stimuli/mediumCandle.jpg', name: "mediumCandle", width:80, height: 80}
var largeCandle = {url: 'stimuli/largeCandle.jpg', name: "largeCandle", width:100, height: 100}
var flower = {url: 'stimuli/flower.jpg', name: "flower", width: 80, height: 80}

var computerMouse = {url: 'stimuli/computerMouse.jpg', name: "computerMouse", 
	scriptedInstruction: "the mouse", width:80, height: 80}
var toyMouse = {url: 'stimuli/toyMouse.jpg', name: "toyMouse", width:80, height: 80}
var camera = {url: 'stimuli/camera.jpg', name: "camera", width:80, height: 80}



var criticalItems = [
	{
		instructions: ["sunGlasses right"], 
		criticalInstruction: "sunGlasses",
		target: sunGlasses,
		distractor: glassesCase,
		alt: soccerBall
	},{
		instructions: ["topBlock up"],
		criticalInstruction: "topBlock",
		target: topBlock,
		distractor: bottomBlock,
		alt: stapler
	},{
		instructions: ["cassetteTape down"],
		criticalInstruction: "cassetteTape",
		target: cassetteTape,
		distractor: rollOfTape,
		alt: battery
	},{
		instructions: ["mediumMeasuringCup right"], 
		criticalInstruction: "mediumMeasuringCup",
		target: mediumMeasuringCup,
		distractor: largeMeasuringCup,
		additional: smallMeasuringCup,
		alt: umbrella
	},{
		instructions: ["roundBrush down"], 
		criticalInstruction: "roundBrush",
		target: roundBrush,
		distractor: hairBrush,
		alt: skate
	},{
		instructions: ["boardEraser up"], 		
		criticalInstruction: "boardEraser",
		target: boardEraser,
		distractor: pencilEraser,
		alt: brain
	},{
		instructions: ["mediumCandle right"], 
		criticalInstruction: "mediumCandle",
		target: mediumCandle,
		distractor: smallCandle,
		additional: largeCandle,
		alt: flower
	},{
		instructions: ["computerMouse left"], 
		criticalInstruction: "computerMouse",
		target: computerMouse,
		distractor: toyMouse,
		alt: camera
}]

module.exports = {criticalItems: criticalItems}

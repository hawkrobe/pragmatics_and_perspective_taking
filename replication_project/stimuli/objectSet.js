// Indexed by object set ID

// BLOCK 1
var sunGlasses = {
	url: 'stimuli/sunglasses.jpg', name: "sunGlasses", width: 130, height: 65,
	instruction: "sunGlasses right", initialLoc : [3,2],
	scriptedInstruction: "the glasses"}
var glassesCase = {
	url: 'stimuli/glassesCase.png', name: "glassesCase", width : 100, height: 107,
	instruction: "", initialLoc: [4,4]}
var soccerBall = {
	url: 'stimuli/soccerBall.jpg', name: "soccerBall", width: 100, height: 100,
	instruction: "", initialLoc: glassesCase.initialLoc}
var saxophone = {
	url: 'stimuli/saxophone.png', name: "saxophone", width: 97, height: 130,
	instruction: "saxophone left", initialLoc: [4,2]}
var airplane = {
	url: 'stimuli/airplane.jpg', name: 'airplane', width: 130, height: 60,
	instruction: "airplane down", initialLoc : [1,2]}
var barrel = {
	url: 'stimuli/barrel.jpg', name: 'barrel', width: 100, height: 100,
	instruction: "barrel down", initialLoc : [2,4]}
var watch = {
	url: 'stimuli/watch.jpg', name: 'watch', width: 130, height: 84,
	instruction: "none", initialLoc: [1,1]}

// BLOCK 2
var topBlock = {
	url: 'stimuli/topBlock.jpg', name: "topBlock", 
	scriptedInstruction: "the bottom block", width: 80, height: 80}
var bottomBlock = {url: 'stimuli/bottomBlock.jpg', name: "bottomBlock", width: 80, height: 80}
var stapler = {url: 'stimuli/stapler.jpg', name: "stapler", width: 80, height: 80}
var binoculars = {url: 'stimuli/binoculars.jpg', name: 'binoculars', width: 100, height: 100}

var cassetteTape = {url: 'stimuli/cassetteTape.jpg', name: "cassetteTape", 
	scriptedInstruction: "the tape", width: 87.5, height: 55,}
var rollOfTape = {url: 'stimuli/rollOfTape.jpg', name: "rollOfTape", width: 83, height: 83}
var battery = {url: 'stimuli/battery.jpg', name: "battery", width: 50, height: 80}
var scissors = {url: 'stimuli/scissors.jpg', name: "scissors", width: 66, height: 130}
var butterfly = {url: 'stimuli/butterfly.jpg', name: 'butterfly', width: 130, height: 112}

var largeMeasuringCup = {url: 'stimuli/largeMeasuringCup.jpg', name: "largeMeasuringCup", 
	scriptedInstruction: "the large measuring cup", width : 150, height: 150}
var mediumMeasuringCup = {url: 'stimuli/mediumMeasuringCup.jpg', name: "mediumMeasuringCup", width : 100, height: 100}
var smallMeasuringCup = {url: 'stimuli/smallMeasuringCup.jpg', name: "smallMeasuringCup", width : 60, height: 60}
var umbrella = {url: 'stimuli/umbrella.jpg', name: "umbrella", width: 80, height: 80}
var chair = {url: 'stimuli/chair.jpg', name: 'chair', width: 87, height: 130}

var roundBrush = {url: 'stimuli/roundBrush.jpg', name: "roundBrush", 
	scriptedInstruction: "the brush", width: 80, height: 80}
var hairBrush = {url: 'stimuli/hairBrush.jpg', name: "hairBrush", width :80, height:80}
var skate = {url: 'stimuli/skate.jpg', name: "skate", width: 80, height: 80}
var dalmatian = {url: 'stimuli/dalmatian.jpg', name: "dalmatian", width: 130, height: 120}

var boardEraser = {url: 'stimuli/boardEraser.jpg', name: "boardEraser", 
    scriptedInstruction: "the eraser", width:80, height: 80}
var pencilEraser = {url: 'stimuli/pencilEraser.jpg', name: "pencilEraser", width:80, height: 80}
var brain = {url: 'stimuli/brain.jpg', name: "brain", width: 80, height:80}
var dollar = {url: 'stimuli/dollar.jpg', name: 'dollar', width: 130, height: 54}

var smallCandle = {url: 'stimuli/smallCandle.jpg', name: "smallCandle", 
	scriptedInstruction: "the small candle", width:80, height: 80}
var mediumCandle = {url: 'stimuli/mediumCandle.jpg', name: "mediumCandle", width:80, height: 80}
var largeCandle = {url: 'stimuli/largeCandle.jpg', name: "largeCandle", width:100, height: 100}
var flower = {url: 'stimuli/flower.jpg', name: "flower", width: 80, height: 80}
var panda = {url: 'stimuli/panda.jpg', name: "panda", width: 104, height:130}

var computerMouse = {url: 'stimuli/computerMouse.jpg', name: "computerMouse", 
	scriptedInstruction: "the mouse", width:80, height: 80}
var toyMouse = {url: 'stimuli/toyMouse.jpg', name: "toyMouse", width:80, height: 80}
var camera = {url: 'stimuli/camera.jpg', name: "camera", width:80, height: 80}
var piano = {url: 'stimuli/piano.jpg', name: 'piano', width: 101, height: 130}


var criticalItems = [
	{
		instructions: [airplane.instruction, sunGlasses.instruction, 
		               barrel.instruction, saxophone.instruction],
		criticalInstruction: "sunGlasses",
		target: sunGlasses,
		distractor: glassesCase,
		alt: soccerBall,
		otherObjects: [saxophone, airplane, barrel, watch]
	},{
		instructions: ["topBlock up"],
		criticalInstruction: "topBlock",
		target: topBlock,
		distractor: bottomBlock,
		alt: stapler,
		otherObjects: [binoculars]
	},{
		instructions: ["cassetteTape down"],
		criticalInstruction: "cassetteTape",
		target: cassetteTape,
		distractor: rollOfTape,
		alt: battery,
		otherObjects: [scissors, butterfly]
	},{
		instructions: ["mediumMeasuringCup right"], 
		criticalInstruction: "mediumMeasuringCup",
		target: mediumMeasuringCup,
		distractor: largeMeasuringCup,
		alt: umbrella,
		otherObjects: [chair, smallMeasuringCup]
	},{
		instructions: ["roundBrush down"], 
		criticalInstruction: "roundBrush",
		target: roundBrush,
		distractor: hairBrush,
		alt: skate,
		otherObjects: [dalmatian]
	},{
		instructions: ["boardEraser up"], 		
		criticalInstruction: "boardEraser",
		target: boardEraser,
		distractor: pencilEraser,
		alt: brain,
		otherObjects: [dollar]
	},{
		instructions: ["mediumCandle right"], 
		criticalInstruction: "mediumCandle",
		target: mediumCandle,
		distractor: smallCandle,
		alt: flower,
		otherObjects: [panda, largeCandle]
	},{
		instructions: ["computerMouse left"], 
		criticalInstruction: "computerMouse",
		target: computerMouse,
		distractor: toyMouse,
		alt: camera,
		otherObjects: [piano]
}]

module.exports = {criticalItems: criticalItems}

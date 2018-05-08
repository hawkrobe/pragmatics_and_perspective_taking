// Indexed by object set ID



// BLOCK 1
var sunGlasses = {
	url: 'stimuli/sunGlasses.png', name: "sunGlasses", width: 130, height: 65,
	instruction: "sunGlasses right", initialLoc : [4,3], critical : "target",
	scriptedInstruction: "move the glasses one space to the right"}
var glassesCase = {
	url: 'stimuli/glassesCase.png', name: "glassesCase", width : 100, height: 107,
	instruction: "", initialLoc: [3,1], critical : "distractor",}
var soccerBall = {
	url: 'stimuli/soccerBall.png', name: "soccerBall", width: 100, height: 100,
	instruction: "", initialLoc: glassesCase.initialLoc, critical : "distractor",}
var saxophone = {
	url: 'stimuli/saxophone.png', name: "saxophone", width: 97, height: 130,
	instruction: "saxophone up", initialLoc: [4,2], critical : "filler",}
var airplane = {
	url: 'stimuli/airplane.png', name: 'airplane', width: 130, height: 60,
	instruction: "airplane right", initialLoc : [1,2],critical : "filler",}
var barrel = {
	url: 'stimuli/barrel.png', name: 'barrel', width: 87, height: 130,
	instruction: "barrel down", initialLoc : [2,4], critical : "filler",
	scriptedInstruction: "move the barrel down by one space"}
var watch = {
	url: 'stimuli/watch.png', name: 'watch', width: 130, height: 84,
	instruction: "", initialLoc: [2,2], critical : "filler",}

// BLOCK 2
var middleBlock = {
	url: 'stimuli/middleBlock.png', name: "middleBlock", width: 80, height: 80,
	instruction: "middleBlock left", initialLoc: [3,4],
	scriptedInstruction: "move the bottom block one space to the left", critical : "target"}
var bottomBlock = {
	url: 'stimuli/bottomBlock.png', name: "bottomBlock", width: 80, height: 80,
	instruction: "", initialLoc: [4,4], critical : "distractor"}
var stapler = {
	url: 'stimuli/stapler.png', name: "stapler", width: 80, height: 80,
	instruction: "", initialLoc: [4,4], critical : "distractor",}
var topBlock = {
	url: 'stimuli/topBlock.png', name: "topBlock", width: 80, height: 80,
	instruction: "", initialLoc: [1,1], critical : "filler",}
var binoculars = {
	url: 'stimuli/binoculars.png', name: 'binoculars', width: 100, height: 100,
	instruction: "binoculars right", initialLoc: [4,1], critical : "filler",
	scriptedInstruction: "move the binoculars one space to the right"}
var wrench = {
	url: 'stimuli/wrench.png', name: 'wrench', width: 130, height: 33,
	instruction: "wrench left", initialLoc: [1,3], critical : "filler",}
var coffeeMug = {
	url: 'stimuli/coffeeMug.png', name: 'coffeeMug', width: 130, height: 122,
	instruction: "coffeeMug right", initialLoc: [2,1], critical : "filler",}

// BLOCK 3
var cassetteTape = {
	url: 'stimuli/cassetteTape.png', name: "cassetteTape",  width: 87.5, height: 55,
	instruction: "cassetteTape down", initialLoc: [1,3], critical : "target",
	scriptedInstruction: "move the tape down by one space",}
var rollOfTape = {
	url: 'stimuli/rollOfTape.png', name: "rollOfTape", width: 83, height: 83,
	instruction: "", initialLoc: [1,4], critical : "distractor"}
var battery = {
	url: 'stimuli/battery.png', name: "battery", width: 50, height: 80,
	instruction: "", initialLoc: [1,4], critical : "distractor"}
var scissors = {
	url: 'stimuli/scissors.png', name: "scissors", width: 66, height: 130,
	instruction: "scissors right", initialLoc: [2,1], critical : "filler"}
var butterfly = {
	url: 'stimuli/butterfly.png', name: 'butterfly', width: 130, height: 112,
	instruction: "", initialLoc: [4,4],critical : "filler"}
var barOfSoap = {
	url: 'stimuli/barOfSoap.png', name: 'barOfSoap', width: 130, height: 88.4,
	instruction: "barOfSoap left", initialLoc: [3,4], critical : "filler",}
var knife = {url: 'stimuli/knife.png', name: 'knife', width: 130, height: 130,
	instruction: "knife down", initialLoc: [3,3],critical : "filler",
	scriptedInstruction: "move the knife down one space"}

// BLOCK 4

var mediumMeasuringCup = {
	url: 'stimuli/mediumMeasuringCup.png', name: "mediumMeasuringCup", width : 110, height: 87,
	instruction: "mediumMeasuringCup down", initialLoc : [3,4], critical : "target",
	scriptedInstruction: "move the large measuring cup down one space"}
var largeMeasuringCup = {
	url: 'stimuli/largeMeasuringCup.png', name: "largeMeasuringCup", width : 130, height: 85,
	instruction: "", initialLoc : [3,1], critical : "distractor",}
var umbrella = {
	url: 'stimuli/umbrella.png', name: "umbrella", width: 130, height: 112,
	instruction: "", initialLoc : [3,1],critical : "distractor",}
var smallMeasuringCup = {
	url: 'stimuli/smallMeasuringCup.png', name: "smallMeasuringCup", width : 55, height: 70,
	instruction: "", initialLoc : [1,3], critical : "filler",}
var chair = {
	url: 'stimuli/chair.png', name: 'chair', width: 79, height: 130,
	instruction: "chair left", initialLoc: [2,4], critical : "filler",}
var waterBottle = {
	url: 'stimuli/waterBottle.png', name: 'waterBottle', width: 43, height: 130,
	instruction: "waterBottle right", initialLoc: [2,1], critical : "filler",}
var carrot = {
	url: 'stimuli/carrot.png', name: 'carrot', width: 130, height: 77,
	instruction: "carrot up", initialLoc: [4,2],critical : "filler",
	scriptedInstruction: "move the carrot up one space"} 

// BLOCK 5

var roundBrush = {
	url: 'stimuli/roundBrush.png', name: "roundBrush", width: 104, height: 130,
	instruction: "roundBrush left", initialLoc: [4,3], critical : "target",
	scriptedInstruction: "move the brush one space to the left", }
var hairBrush = {
	url: 'stimuli/hairBrush.png', name: "hairBrush", width :130, height:109,
	instruction: "", initialLoc: [1,4],critical : "distractor",}
var skate = {
	url: 'stimuli/skate.png', name: "skate", width: 130, height: 130,
	instruction: "", initialLoc: [1,4],critical : "distractor",}
var dalmatian = {
	url: 'stimuli/dalmatian.png', name: "dalmatian", width: 130, height: 120,
	instruction: "", initialLoc: [1,1],critical : "filler",}
var headphones = {
	url: 'stimuli/headphones.png', name: "headphones", width: 100, height: 100,
	instruction: "headphones left", initialLoc: [3,4],critical : "filler",}
var book = {
	url: 'stimuli/book.png', name: 'book', width: 130, height: 101,
	instruction: "book right", initialLoc: [1,2], critical : "filler",
	scriptedInstruction: "move the book one space to the right"}
var ring = {
	url: 'stimuli/ring.png', name: 'ring', width: 104, height: 110,
	instruction: "", initialLoc: [4,1],critical : "filler",}
var basketball = {
	url: 'stimuli/basketball.png', name: 'basketball', width: 130, height: 130,
	instruction: "basketball down", initialLoc: [1,3],critical : "filler",}

// BLOCK 6

var boardEraser = {
	url: 'stimuli/boardEraser.png', name: "boardEraser", width:130, height: 71,
	instruction: "boardEraser up", initialLoc: [4,2],critical : "target",
    scriptedInstruction: "move the eraser up by one space", }
var pencilEraser = {
	url: 'stimuli/pencilEraser.png', name: "pencilEraser", width:130, height: 58,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var brain = {
	url: 'stimuli/brain.png', name: "brain", width: 130, height:104,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var dollar = {
	url: 'stimuli/dollar.png', name: 'dollar', width: 130, height: 54,
	instruction: "dollar right", initialLoc: [3,3],critical : "filler",}
var feather = {
	url: 'stimuli/feather.png', name: 'feather', width: 130, height: 98,
	instruction: "feather left", initialLoc: [4,3],critical : "filler",}
var tennisBall = {
	url: 'stimuli/tennisBall.png', name: 'tennisBall', width: 100, height: 100,
	instruction: "", initialLoc: [2,3],critical : "filler",}
var banana = {
	url: 'stimuli/banana.png', name: 'banana', width: 130, height: 61,
	instruction: "banana up", initialLoc: [3,4],critical : "filler",
	scriptedInstruction: "move the banana up by one space"}

// BLOCK 7

var mediumCandle = {
	url: 'stimuli/mediumCandle.png', name: "mediumCandle", width: 107, height: 130,
	instruction: "mediumCandle down", initialLoc: [1,1],critical : "target",
	scriptedInstruction: "move the small candle down by one space"}
var smallCandle = {
	url: 'stimuli/smallCandle.png', name: "smallCandle", width:100, height: 83,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var flower = {
	url: 'stimuli/flower.png', name: "flower", width: 130, height: 97.5,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var largeCandle = {
	url: 'stimuli/largeCandle.png', name: "largeCandle", width:114, height: 130,
	instruction: "", initialLoc: [4,3],critical : "filler",}
var pandaToy = {
	url: 'stimuli/pandaToy.png', name: "pandaToy", width: 104, height:130,
	instruction: "pandaToy down", initialLoc: [1,3],critical : "filler",}
var handcuffs = {
	url: 'stimuli/handcuffs.png', name:'handcuffs', width: 130, height: 73,
	instruction: "handcuffs down", initialLoc: [2,4],critical : "filler",}
var magnet = {
	url: 'stimuli/magnet.png', name: 'magnet', width: 130, height: 108,
	instruction: "magnet down", initialLoc: [3,2],critical : "filler",
	scriptedInstruction: "move the magnet down by one space"}



// BLOCK 8

var computerMouse = {
	url: 'stimuli/computerMouse.png', name: "computerMouse", width:130, height: 112,
	instruction: "computerMouse up", initialLoc: [3,4],critical : "target",
	scriptedInstruction: "move the mouse up by one space", }
var toyMouse = {
	url: 'stimuli/toyMouse.png', name: "toyMouse", width:130, height: 109,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var camera = {
	url: 'stimuli/camera.png', name: "camera", width:130, height: 100,
	instruction: "", initialLoc: [3,1],critical : "distractor",}
var piano = {
	url: 'stimuli/piano.png', name: 'piano', width: 102, height: 130,
	instruction: "piano left", initialLoc: [4,2],critical : "filler",}
var comb = {
	url: 'stimuli/comb.png', name: 'comb', width: 130, height: 80,
	instruction: "comb up", initialLoc: [2,1],critical : "filler",}
var key = {
	url: 'stimuli/key.png', name: 'key', width: 88, height: 130,
	instruction: "", initialLoc: [2,2],critical : "filler",}
var castIronPan = {
	url: 'stimuli/castIronPan.png', name: 'castIronPan', width: 130, height: 62,
	instruction: "castIronPan up", initialLoc: [4,3],critical : "filler"}

var criticalItems = [
	{
		instructions: [airplane.instruction, sunGlasses.instruction, 
		               barrel.instruction, saxophone.instruction],
		criticalInstruction: "sunGlasses",
		objectSet: 1,
		target: sunGlasses,
		distractor: glassesCase,
		alt: soccerBall,
		otherObjects: [saxophone, airplane, barrel, watch]
	},{
		instructions: [binoculars.instruction, wrench.instruction, 
		               middleBlock.instruction, coffeeMug.instruction],
		criticalInstruction: "middleBlock",
		objectSet: 2,
		target: middleBlock,
		distractor: bottomBlock,
		alt: stapler,
		otherObjects: [binoculars, wrench, topBlock, coffeeMug]
	},{
		instructions: [scissors.instruction, knife.instruction,
		                barOfSoap.instruction, cassetteTape.instruction],
		criticalInstruction: "cassetteTape",
		objectSet: 3,
		target: cassetteTape,
		distractor: rollOfTape,
		alt: battery,
		otherObjects: [scissors, butterfly, barOfSoap, knife]
	},{
		instructions: [carrot.instruction, mediumMeasuringCup.instruction,
		               waterBottle.instruction, chair.instruction],
		criticalInstruction: "mediumMeasuringCup",
		objectSet: 4,
		target: mediumMeasuringCup,
		distractor: largeMeasuringCup,
		alt: umbrella,
		otherObjects: [chair, smallMeasuringCup, carrot, waterBottle]
	},{
		instructions: [basketball.instruction, roundBrush.instruction, headphones.instruction, 
		                book.instruction], 
		criticalInstruction: "roundBrush",
		target: roundBrush,
		objectSet: 5,
		distractor: hairBrush,
		alt: skate,
		otherObjects: [basketball, dalmatian, headphones, book, ring]
	},{
		instructions: [banana.instruction, dollar.instruction, 
		               boardEraser.instruction, feather.instruction], 		
		criticalInstruction: "boardEraser",
		objectSet: 6,
		target: boardEraser,
		distractor: pencilEraser,
		alt: brain,
		otherObjects: [dollar, feather, tennisBall, banana]
	},{
		instructions: [magnet.instruction, handcuffs.instruction, 
		               pandaToy.instruction, mediumCandle.instruction], 
		criticalInstruction: "mediumCandle",
		objectSet: 7,
		target: mediumCandle,
		distractor: smallCandle,
		alt: flower,
		otherObjects: [pandaToy, largeCandle, handcuffs, magnet]
	},{
		instructions: [comb.instruction, computerMouse.instruction, 
		               castIronPan.instruction, piano.instruction], 
		criticalInstruction: "computerMouse",
		objectSet: 8,
		target: computerMouse,
		distractor: toyMouse,
		alt: camera,
		otherObjects: [piano , comb, key, castIronPan]
}]


module.exports = {criticalItems: criticalItems}

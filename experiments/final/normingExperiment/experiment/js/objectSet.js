// Requires importing uniqueLabels.js before this in html

var stimList = function() {
  // BLOCK 1
  var sunGlasses = {
    url: 'js/stimuli/sunGlasses.png', name: "sunGlasses", width: 130, height: 65,
    instruction: "sunGlasses right", initialLoc : [4,3], critical : "target",
    scriptedInstruction: "move the glasses one space to the right",
    contextURL: 'js/stimuli/sunglassesContext.png'};
  var glassesCase = {
    url: 'js/stimuli/glassesCase.png', name: "glassesCase", width : 100, height: 107,
    instruction: "", initialLoc: [3,1], critical : "distractor",
    contextURL: 'js/stimuli/glassesCaseContext.png'};

  // BLOCK 2
  var middleBlock = {
    url: 'js/stimuli/middleBlock.png', name: "middleBlock", width: 80, height: 80,
    instruction: "middleBlock left", initialLoc: [3,4],
    contextURL: 'js/stimuli/middleBlockContext.png',
    scriptedInstruction: "move the bottom block one space to the left", critical : "target"}
  var bottomBlock = {
    url: 'js/stimuli/bottomBlock.png', name: "bottomBlock", width: 80, height: 80,
    contextURL: 'js/stimuli/bottomBlockContext.png',
    instruction: "", initialLoc: [4,4], critical : "distractor"}

  // BLOCK 3
  var cassetteTape = {
    url: 'js/stimuli/cassetteTape.png', name: "cassetteTape",  width: 87.5, height: 55,
    instruction: "cassetteTape down", initialLoc: [1,3], critical : "target",
    contextURL: 'js/stimuli/cassetteTapeContext.png',
    scriptedInstruction: "move the tape down by one space",}
  var rollOfTape = {
    url: 'js/stimuli/rollOfTape.jpg', name: "rollOfTape", width: 83, height: 83,
    contextURL: 'js/stimuli/rollOfTapeContext.png',
    instruction: "", initialLoc: [1,4], critical : "distractor"}

  // BLOCK 4

  var mediumMeasuringCup = {
    url: 'js/stimuli/mediumMeasuringCup.png', name: "mediumMeasuringCup", width : 110,
    height: 87, contextURL: 'js/stimuli/mediumCupContext.png',
    instruction: "mediumMeasuringCup down", initialLoc : [3,4], critical : "target",
    scriptedInstruction: "move the large measuring cup down one space"}
  var largeMeasuringCup = {
    url: 'js/stimuli/largeMeasuringCup.png', name: "largeMeasuringCup", width : 130,
    height: 85, contextURL: 'js/stimuli/largeCupContext.png',
    instruction: "", initialLoc : [3,1], critical : "distractor",}

  // BLOCK 5

  var roundBrush = {
    url: 'js/stimuli/roundBrush.png', name: "roundBrush", width: 104, height: 130,
    instruction: "roundBrush left", initialLoc: [4,3], critical : "target",
    contextURL: 'js/stimuli/roundBrushContext.png',
    scriptedInstruction: "move the brush one space to the left", };
  var hairBrush = {
    url: 'js/stimuli/hairBrush.png', name: "hairBrush", width :130, height:109,
    contextURL: 'js/stimuli/hairbrushContext.png',
    instruction: "", initialLoc: [1,4],critical : "distractor",};

  // BLOCK 6

  var boardEraser = {
    url: 'js/stimuli/boardEraser.png', name: "boardEraser", width:130, height: 71,
    instruction: "boardEraser up", initialLoc: [4,2],critical : "target",
    contextURL: 'js/stimuli/boardEraserContext.png',    
    scriptedInstruction: "move the eraser up by one space" };
  var pencilEraser = {
    url: 'js/stimuli/pencilEraser.png', name: "pencilEraser", width:130, height: 58, 
    contextURL: 'js/stimuli/pencilEraserContext.png',       
    instruction: "", initialLoc: [3,1],critical : "distractor",};

  // BLOCK 7

  var mediumCandle = {
    url: 'js/stimuli/mediumCandle.png', name: "mediumCandle", width: 107, height: 130,
    instruction: "mediumCandle down", initialLoc: [1,1],critical : "target",
    contextURL: 'js/stimuli/mediumCandleContext.png',
    scriptedInstruction: "move the small candle down by one space"};
  var smallCandle = {
    url: 'js/stimuli/smallCandle.png', name: "smallCandle", width:100, height: 83,
    contextURL: 'js/stimuli/smallCandleContext.png',
    instruction: "", initialLoc: [3,1],critical : "distractor",};



  // BLOCK 8
  var computerMouse = {
    url: 'js/stimuli/computerMouse.png', name: "computerMouse", width:130, height: 112,
    instruction: "computerMouse up", initialLoc: [3,4],critical : "target",
    contextURL: 'js/stimuli/computerMouseContext.png',           
    scriptedInstruction: "move the mouse up by one space", };
  var toyMouse = {
    url: 'js/stimuli/toyMouse.png', name: "toyMouse", width:130, height: 109,
    contextURL: 'js/stimuli/toyMouseContext.png',     
    instruction: "", initialLoc: [3,1],critical : "distractor",};

  var criticalItems = [
    {
      objectSet: 1,
      target: sunGlasses,
      distractor: glassesCase,
    },{
      objectSet: 2,
      target: middleBlock,
      distractor: bottomBlock,
    },{
      objectSet: 3,
      target: cassetteTape,
      distractor: rollOfTape,
    },{
      objectSet: 4,
      target: mediumMeasuringCup,
      distractor: largeMeasuringCup,
    },{
      target: roundBrush,
      objectSet: 5,
      distractor: hairBrush,
    },{
      objectSet: 6,
      target: boardEraser,
      distractor: pencilEraser,
    },{
      objectSet: 7,
      target: mediumCandle,
      distractor: smallCandle,
    },{
      objectSet: 8,
      target: computerMouse,
      distractor: toyMouse,
    }];

  var referents = ["target", "distractor"];
  var contexts = ["isolated", "comparison"];

  var stimList = _.flatten(_.map(uniqueLabels, function(labelObj) {
    return _.map(referents, function(referent) {
      var relevantObject = criticalItems[Number(labelObj.objectSet) - 1][referent];

      return {text: labelObj.text, objectSet : labelObj.objectSet,
	      referent: referent, object : relevantObject};
    });
  }));
  console.log(stimList);
  return stimList;
}();


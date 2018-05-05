var fs = require('fs');
var babyparse = require('papaparse');
var _ = require('underscore');

function readCSV(filename){
    return babyparse.parse(fs.readFileSync(filename, 'utf8'),
			   {header: true, skipEmptyLines : true}
			  ).data;
  };

var criticalMessages = readCSV('../../../../../data/final/experiment1/refExpressions_standardized.csv');

var unscriptedLabels = _.map(criticalMessages, function(row) {
  return {text: row.text.trim(), objectSet : row.objectSet};
});

var scriptedLabels = [{text: "glasses", objectSet : 1},
		      {text: "bottom block", objectSet : 2},
		      {text: "tape",  objectSet : 3},
		      {text: "large measuring cup", objectSet : 4},
		      {text: "brush", objectSet : 5},
		      {text: "eraser", objectSet : 6},
		      {text: "small candle", objectSet : 7},
		      {text: "mouse", objectSet : 8}];

var uniqueLabels = _.unique(unscriptedLabels.concat(scriptedLabels),
			    function(item, key, a) {  return item.text; });

fs.writeFileSync("uniqueLabels.json", JSON.stringify(uniqueLabels, null, 4));

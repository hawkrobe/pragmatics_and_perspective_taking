var fs = require('fs');
var babyparse = require('babyparse');
var _ = require('underscore');

function readCSV(filename){
    return babyparse.parse(fs.readFileSync(filename, 'utf8'),
			   {header: true, skipEmptyLines : true}
			  ).data;
  };

var criticalMessages = readCSV('./messages.csv');

var unscriptedLabels = _.map(criticalMessages, function(row) {
  return {label: row.label.trim(), objectSet : row.objectSet};
});

var scriptedLabels = [{label: "glasses", objectSet : 1},
		      {label: "bottom block", objectSet : 2},
		      {label: "tape",  objectSet : 3},
		      {label: "large measuring cup", objectSet : 4},
		      {label: "brush", objectSet : 5},
		      {label: "eraser", objectSet : 6},
		      {label: "small candle", objectSet : 7},
		      {label: "mouse", objectSet : 8}];

var uniqueLabels = _.unique(unscriptedLabels.concat(scriptedLabels),
			    function(item, key, a) {  return item.label; });

fs.writeFileSync("uniqueLabels.json", JSON.stringify(uniqueLabels, null, 4));

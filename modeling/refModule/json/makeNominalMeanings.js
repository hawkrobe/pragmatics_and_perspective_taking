var _ = require('lodash');
var papaparse = require('papaparse');
var fs = require('fs');

var labelToObjName = function(label) {
  var lowerCased = label.toLowerCase();
  var noWhiteSpace = lowerCased.replace(/[^A-Z0-9]+/ig, "");
  return noWhiteSpace == "mms" ? "mnms" : noWhiteSpace;
};

var typicality = function () {
  var filename = ("../../data/modelTypicalities.csv");
  var parseResult = papaparse.parse(fs.readFileSync(filename, 'utf8'),
				    {header: true, skipEmptyLines : true});
  this.data = parseResult.data;
  //console.log("this.data:", this.data);
};

// typicality.prototype.clean = function() {
//   this.data = _.map(this.data, function(row) {
//     var newRow = _.clone(row);
//     var wordsInLabel = row.label.split(' ');
//     newRow.label = (_.includes(['a', 'an'], wordsInLabel[0]) ?
// 		    wordsInLabel.slice(1).join(' ') :
// 		    wordsInLabel.join(' '));
//     return newRow;
//   });
// };

typicality.prototype.getLabels = function() {
  return _.uniq(_.map(this.data, 'label'));
};

typicality.prototype.getTypicality = function(label, obj) {
  console.log(label)
  console.log(obj)
  var subset = _.filter(this.data, function(row) {
    return row.object === obj & row.label === label;
  });
  console.log(subset)
  return Number(subset[0]["m"]);
};

typicality.prototype.getPossibleReferents = function(label) {
  return _.map(_.filter(this.data, function(row) {
    return row.label === label;
  }), 'object');
};

typicality.prototype.makeTree = function() {
  this.tree = {};
  var that = this;
  _.each(this.labels, function(label) {
    var cleanedLabel = labelToObjName(label);
    that.tree[cleanedLabel] = {};
    _.each(that.getPossibleReferents(label), function(object) {
      that.tree[cleanedLabel][object] = that.getTypicality(label, object);
    });
  });
};

var t = new typicality();
//t.clean();
t.labels = t.getLabels();
t.makeTree();

fs.writeFileSync('keysar-meanings.json', JSON.stringify(t.tree, null, 2));

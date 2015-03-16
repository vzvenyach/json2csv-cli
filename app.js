var $ = jQuery = require('jquery');
require('./jquery.csv.js');

// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/master/csvkit/convert/js.py#L8-L27

// depends on jquery and jquery-csv (for now)

var fs = require('fs')

jsonObj = JSON.parse(fs.readFileSync("big.json"))
console.log("Converting...")
doCSV(jsonObj)

function doCSV(json) {
    var inArray = arrayFrom(json);
    var outArray = [];
    console.log("array created...")
    for (var row in inArray)
        outArray[outArray.length] = parse_object(inArray[row]);
    // $("span.rows.count").text("" + outArray.length);
    console.log("getting csv...")
    var csv = $.csv.fromObjects(outArray);
    console.log(csv)
}

function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/master/csvkit/convert/js.py#L8-L27

// depends on jquery and jquery-csv (for now)

function parse_object(obj, path) {
    if (path == undefined)
        path = "";

    var type = getType(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {

            var newD = parse_object(obj[i], path + i + "/");
            extend(d, newD);
        }

        return d;
    }

    else if (scalar) {
        var d = {};
        var endPath = path.substr(0, path.length-1);
        d[endPath] = obj;
        return d;
    }

    // ?
    else return {};
}

function getType(obj) {
   return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
}

function extend (out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
}

// otherwise, just find the first one
function arrayFrom(json) {
    var queue = [], next = json;
    while (next) {
        if (Array.isArray(next))
            return next;
        for (var key in next)
           queue.push(next[key]);
        next = queue.shift();
    }
    // none found, consider the whole object a row
    return [json];
}

// todo: add graceful error handling
function jsonFrom(input) {
  var string = $.trim(input);
  if (!string) return;
  return JSON.parse(string);
}
"use strict";
var par = require("par");

var Helpers = require("./helpers");
var Operations = require("./operations");

module.exports = {
	put: put
};

function put(db, segments, time, value, cb) {
	var pathHash = Helpers.hashPath(segments);

	Operations.putValue(db, pathHash, value, par(updateTime, db, time, segments, cb));
}

function updateTime(db, time, segments, cb, err) {
	if(err) return cb(err);
	var pathHash = Helpers.hashPath(segments);

	Operations.updatePath(db, pathHash, time, function(updateErr){
		if(updateErr) return cb(updateErr);

		var parentSegments = segments.slice(0, -1);
		var currentDirectory = segments[segments.length - 1];
		var parentHash = Helpers.hashPath(parentSegments);

		var hasMore = parentSegments.length;
		var next = hasMore ? par(updateTime, db, time, parentSegments, cb) : cb;

		Operations.updateChild(db, parentHash, currentDirectory, time, next);
	});
}

"use strict";
var streamToArray = require("stream-to-array");

var CONSTANTS = require("./constants");

module.exports = {
	getValue: getValue,
	putValue: putValue,
	updatePath: updatePath,
	existsPath: existsPath,
	childNames: childNames,
	updateChild: updateChild,
};

function childNames(db, pathHash, cb) {
	var start = pathHash + CONSTANTS.LAST + CONSTANTS.FIRST;
	var end = pathHash + CONSTANTS.LAST + CONSTANTS.LAST;

	return streamToArray(db.createReadStream({
		gt: start,
		lt: end,
		keys: true,
		values: false
	}), function (err, keys) {
		if(err) return cb(err);
		cb(null, keys.map(parseChildName));
	});
}

function parseChildName(key) {
	var child = key.slice(CONSTANTS.HASH_LENGTH + 1).toString();
	return child;
}

function existsPath(db, pathHash, cb) {
	var key = pathHash + CONSTANTS.FIRST + CONSTANTS.FIRST;

	db.get(key, function (err, value) {
		if(err){
			if(err.notFound)
				cb(null, false);
			else cb(err);
		} else cb(null, parseInt(value, 10));
	});
}

function getValue(db, pathHash, cb) {
	var key = pathHash + CONSTANTS.FIRST;

	db.get(key, cb);
}

function putValue(db, pathHash, value, cb) {
	var key = pathHash + CONSTANTS.FIRST;

	db.put(key, value, cb);
}

function updateChild(db, pathHash, child, time, cb) {
	var key = pathHash + CONSTANTS.LAST + child;

	db.put(key, time, cb);
}

function updatePath(db, pathHash, time, cb) {
	var key = pathHash + CONSTANTS.FIRST + CONSTANTS.FIRST;

	db.put(key, time + "", cb);
}

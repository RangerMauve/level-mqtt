"use strict";
var map = require("through2-map");

var CONSTANTS = require("./constants");

module.exports = {
	childNames: childNames,
	existsPath: existsPath,
	getValue: getValue,
	putValue: putValue,
	updateTime: updateTime,
};

function childNames(db, pathHash) {
	var start = pathHash + CONSTANTS.LAST + CONSTANTS.FIRST;
	var end = pathHash + CONSTANTS.LAST + CONSTANTS.LAST;

	return db.createReadStream({
		gt: start,
		lt: end,
		keys: true,
		values: false
	}).pipe(map(parseChildName));
}

function parseChildName(key) {
	return key.slice(CONSTANTS.HASH_LENGTH + 2);
}

function existsPath(db, pathHash, cb) {
	var key = pathHash + CONSTANTS.FIRST + CONSTANTS.FIRST;

	db.get(key, function (err, value) {
		if(err){
			if(err.notFound)
				cb(null, false);
			else cb(err);
		} else cb(null, value);
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

function updateTime(db, pathHash, time, cb) {
	var key = pathHash + CONSTANTS.FIRST + CONSTANTS.FIRST;

	db.put(key, time, cb);
}

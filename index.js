"use strict";
var map = require("through2-map");

var ALLOWED_CHARS = /^[\u0020-\u007E]$/;
var WILDCARDS = /\+|\#/;
var FIRST = "\u001B";
var LAST = "\u007F";
var HASH_LENGTH;

function MQTTLevelStore(db) {
	this._db = db;
}

MQTTLevelStore.prototype = {
	_db: null,

	get: get,
	put: put,
};

function get(path, cb) {
	var segments = makeSegments(path, true);
}

function put(path, value, cb) {
	var segments = makeSegments(path, true);

}

function makeSegments(path, strict) {
	var segments = null;
	if (Array.isArray(path))
		segments = path;
	else if (typeof path !== "string")
		throw new TypeError("Path must either be an Array or a String");
	else segments = path.split("/");

	validatePath(segments, strict);

	return segments;
}

function validatePath(path, strict) {
	path.forEach(function (segment) {
		if (typeof segment !== "string")
			throw new TypeError(segment + " Is not a string.\nPlease supply only strings if you pass an array for the path");
		if (!segment.match(ALLOWED_CHARS))
			throw new TypeError(segment + " Contains illegal characters.\nPlease only use visible ASCII characters");
		if (strict && segment.match(WILDCARDS))
			throw new TypeError(segment + " Contains a woldcard.\nPlease only use wildcards for query patterns");
	});
}

function childNames(db, pathHash) {
	var start = pathHash + LAST + FIRST;
	var end = pathHash + LAST + LAST;

	return db.createReadStream({
		gt: start,
		lt: end,
		keys: true,
		values: false
	}).pipe(map(parseChildName));
}

function parseChildName(key) {
	return key.slice(HASH_LENGTH + 2);
}

function hashPath(path) {

}

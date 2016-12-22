"use strict";
var rightPad = require("right-pad");

var ALLOWED_CHARS = /^[\u0020-\u007E]$/;
var WILDCARDS = /\+|\$/;
var LOWEST = "\u001B";
var HIGHEST = "\u007F";
var DIRECTORY_STORAGE = "\u001A";
var DEFAULT_SIZE = 32;

function MQTTLevelStore(db, options) {
	this._db = db;
	var realOptions = options || {
		sectionSize: DEFAULT_SIZE
	};
	var sectionSize = realOptions.sectionSize;
	this._sectionSize = sectionSize;
}

MQTTLevelStore.prototype = {
	_db: null,
	_sectionSize: DEFAULT_SIZE,

	get: get,
	put: put,
};

function get(path, cb) {
	var key = pathToKey(this._sectionSize, path);
	this._get(key, cb);
}

function put(path, value, cb) {
	var key = pathToKey(this._sectionSize, path);
	this._put(key, value, cb);
}

function pathToKey(sectionSize, path) {
	if (!path || (typeof path !== "string"))
		throw new TypeError("Path must be a non-empty string");

	if (!path.match(ALLOWED_CHARS))
		throw new TypeError("Path contains invalid characters. Please use visible ASCII characters");

	if (path.match(WILDCARDS))
		throw new TypeError("Path contains wildcards. You can only use + and # for querying and not for keys");

	var sections = path.split("/");

	var numSections = sections.length;

	if (numSections > 256)
		throw new TypeError("Path must not be more than 255 sections deep");

	var padded = sections.map(function(section) {
		if (section.length > sectionSize)
			throw new TypeError("Path contains segment <" + section + "> that is larger than the maximum segment size: " + sectionSize);
		return rightPad(section, sectionSize, LOWEST);
	});


	var parsedSections = padded.join("");

	var sizeString = sizeToKey(numSections);

	return sizeString + parsedSections;
}

function sizeToKey(size) {
	var sizePrefix = (size < 16) ? "0" : "";
	return sizePrefix + (size - 1).toString(16);
}

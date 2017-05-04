"use strict";
var FNV = require("fnv-lite");

var CONSTANTS = require("./constants");

module.exports = {
	makeSegments: makeSegments,
	hashPath: hashPath
};


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
		if (!segment.match(CONSTANTS.ALLOWED_CHARS))
			throw new TypeError(segment + " Contains illegal characters.\nPlease only use visible ASCII characters");
		if (strict && segment.match(CONSTANTS.WILDCARDS))
			throw new TypeError(segment + " Contains a woldcard.\nPlease only use wildcards for query patterns");
	});
}

function hashPath(segments) {
	return FNV.hex(segments.join("/"));
}

"use strict";
var par = require("par");
var streamToArray = require("stream-to-array");

function MQTTLevelStore(db) {
	this._db = db;
}

var Operations = require("./operations");
var Helpers = require("./helpers");

MQTTLevelStore.prototype = {
	_db: null,

	get: get,
	put: put,

	exists: exists,
	children: children,

	search: search,
};

function get(path, cb) {
	var segments = Helpers.makeSegments(path, true);
	var pathHash = Helpers.hashPath(segments);
	var db = this._db;

	Operations.getValue(db, pathHash, cb);
}

function put(path, value, cb) {
	var segments = Helpers.makeSegments(path, true);
	var pathHash = Helpers.hashPath(segments);
	var db = this._db;
	var time = new Date();

	Operations.setValue(db, pathHash, value, par(updateTime, segments));

	function updateTime(pathSegments, err) {
		if(err) return cb(err);
		if(!pathSegments.length) return cb(null, time);

		var currentHash = Helpers.hashPath(pathSegments);

		var parentSegments = segments.slice(0, segments.length - 1);
		var next = par(updateTime, parentSegments);
		Operations.updateTime(db, currentHash, time, next);
	}
}

function exists(path, cb) {
	var segments = Helpers.makeSegments(path, true);
	var pathHash = Helpers.hashPath(segments);
	var db = this._db;

	Operations.existsPath(db, pathHash, cb);
}

function children(path, cb) {
	var segments = Helpers.makeSegments(path, true);
	var pathHash = Helpers.hashPath(segments);
	var db = this._db;

	var nameStream = Operations.childNames(db, pathHash);
	streamToArray(nameStream, cb);
}

function search(pattern) {
	// TODO: Traverse pattern and create a stream of events
}

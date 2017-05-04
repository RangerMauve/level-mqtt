"use strict";

module.exports = MQTTLevelStore;

function MQTTLevelStore(db) {
	if(!(this instanceof MQTTLevelStore))
		return new MQTTLevelStore(db);
	this._db = db;
}

var Operations = require("./operations");
var Helpers = require("./helpers");
var Search = require("./search");
var Populate = require("./populate");

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
	var db = this._db;
	var time = Date.now();

	Populate.put(db, segments, time, value, cb);
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

	Operations.childNames(db, pathHash, cb);
}

function search(pattern, cb) {
	var segments = Helpers.makeSegments(pattern, false);
	var db = this._db;

	Search.search(db, segments, cb);
}

"use strict";
var each = require("async-each");
var toArray = require("stream-to-array");
var par = require("par");

var Operations = require("./operations");
var Helpers = require("./helpers");

module.exports = {
	search: search
};

function search(db, segments, cb) {
	searchNext(db, [], segments, cb);
}

function searchNext(db, prefix, segments, cb) {
	if (!segments.length)
		return getValue(db, prefix, cb);

	var next = segments[0];
	if (next === "+") {
		return getChildren(function (err, children) {
			if (err) return cb(err);
			var processChild = par(searchChild, db, prefix, segments.slice(1));
			each(
				children,
				processChild,
				par(accumulate, cb)
			);
		});
	} else if (next === "#") {
		allValues(db, prefix, cb);
	} else {
		search(db, prefix.concat(next), segments.slice(1), cb);
	}
}

function getChildren(db, prefix, cb) {
	var hashPath = Helpers.hashPath(prefix);
	toArray(Operations.childNames(db, hashPath), cb);
}

function getValue(db, prefix, cb) {
	var hashPath = Helpers.hashPath(prefix);
	Operations.existsPath(db, hashPath, function (err, exists) {
		if (err) return cb(err);
		if (!exists) return cb(null, []);
		Operations.getValue(db, hashPath, function (getErr, value) {
			if (getErr) cb(getErr);
			else cb(null, [{
				path: prefix,
				value: value
			}]);
		});
	});
}

function accumulate(cb, err, results) {
	if (err) return cb(err);
	return cb(null, results.reduce(concat, []));
}

function concat(a, b) {
	return a.concat(b);
}

function searchChild(db, prefix, segments, child, cb) {
	var newPrefix = prefix.concat(child);
	search(db, newPrefix, segments, cb);
}

function allValues(db, prefix, cb) {
	return getValue(db, prefix, function(err, rootValues) {
		if(err) return cb(err);
		getChildren(db, prefix, cb, function (childErr, childNames) {
			if(childErr) return cb(err);
			each(childNames, par(allChildValues, db, prefix), function (childValueErr, childValues) {
				if(childValueErr) cb(err, null);
				var all = rootValues.concat(childValues);
				cb(null, all);
			});
		});
	});
}

function allChildValues(db, prefix, child, cb) {
	allValues(db, prefix.concat(child), cb);
}

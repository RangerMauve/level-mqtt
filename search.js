"use strict";
var each = require("async-each");
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
		return getChildren(db, prefix, function (err, children) {
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
		searchNext(db, prefix.concat(next), segments.slice(1), cb);
	}
}

function getChildren(db, prefix, cb) {
	var hashPath = Helpers.hashPath(prefix);
	Operations.childNames(db, hashPath, cb);
}

function getValue(db, prefix, cb) {
	var hashPath = Helpers.hashPath(prefix);
	Operations.existsPath(db, hashPath, function (err, exists) {
		if (err) return cb(err);
		if (!exists) return cb(null, []);
		Operations.getValue(db, hashPath, function (getErr, value) {
			if(getErr){
				if(getErr.notFound)
					return cb(null, []);
				else return cb(getErr);
			}
			else cb(null, [{
				path: prefix.join("/"),
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
	searchNext(db, newPrefix, segments, cb);
}

function allValues(db, prefix, cb) {
	return getValue(db, prefix, function(err, rootValues) {
		if(err) return cb(err);
		getChildren(db, prefix, function (childErr, childNames) {
			if(childErr) return cb(childErr);
			each(childNames, par(allChildValues, db, prefix), function (childValueErr, childValues) {
				if(childValueErr) cb(childValueErr);
				var all = rootValues.concat(childValues).reduce(flatten, []);
				cb(null, all);
			});
		});
	});
}

function flatten(a,b) {
	return a.concat(b);
}

function allChildValues(db, prefix, child, cb) {
	allValues(db, prefix.concat(child), cb);
}

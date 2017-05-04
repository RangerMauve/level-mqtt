"use strict";
var test = require("tape");

var Helpers = require("../helpers");
var Populate = require("../populate");
var Search = require("../search");
var createDB = require("./createDB");

test("Search.search should be able to find a key by its value", function(t){
	t.plan(1);

	var db = createDB();

	var key = "foo/bar/baz";

	var segments = Helpers.makeSegments(key);

	var value = "hello world";

	var expected = [{
		path: key,
		value: value
	}];


	Populate.put(db, segments, Date.now(), value, function(popErr){
		if(popErr) return t.end(popErr);

		Search.search(db, segments, function(searchErr, results){
			if(searchErr) return t.end(searchErr);

			t.deepEqual(results, expected, "Got key that was placed in the DB");
		});
	});
});

test("Search.search should work with a + wildcard in the topic", function (t) {
	t.plan(1);

	var db = createDB();

	var key1 = "foo/bar/baz";
	var key2 = "foo/fizz/baz";
	var search = "foo/+/baz";

	var segments1 =  Helpers.makeSegments(key1);
	var segments2 = Helpers.makeSegments(key2);
	var searchSegments = Helpers.makeSegments(search);

	var value1 = "hello";
	var value2 = "world";


	var expected = [{
		path: key1,
		value: value1
	},{
		path: key2,
		value: value2
	}];

	Populate.put(db, segments1, Date.now(), value1, function (put1Err) {
		if(put1Err) return t.end(put1Err);

		Populate.put(db, segments2, Date.now(), value2, function (put2Err) {
			if(put2Err) return t.end(put1Err);

			Search.search(db, searchSegments, function (searchErr, results) {
				if(searchErr) return t.end(searchErr);

				t.deepEqual(results, expected, "Got keys and their values");
			});
		});
	});
});


test("Search.search should work with a # wildcard in the topic", function (t) {
	t.plan(1);

	var db = createDB();

	var keys = [
		"foo/bar",
		"foo/bar/baz",
		"foo/fizz"
	];
	var value = "Hello World";

	var search = Helpers.makeSegments("foo/#");

	var expected = keys.map(function(key){
		return {
			path: key,
			value: value
		};
	});

	Populate.put(db, Helpers.makeSegments(keys[0]), Date.now(), value, function (err1){
		if(err1) return t.end(err1);
		Populate.put(db, Helpers.makeSegments(keys[1]), Date.now(), value, function (err2){
			if(err2) return t.end(err2);
			Populate.put(db, Helpers.makeSegments(keys[2]), Date.now(), value, function (err3){
				if(err3) return t.end(err3);

				Search.search(db, search, function (searchErr, results) {
					if(searchErr) return t.end(searchErr);
					t.deepEqual(results, expected, "Got keys and their values");
				});
			});
		});
	});
});

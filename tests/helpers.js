"use strict";
var test = require("tape");

var CONSTANTS = require("../src/CONSTANTS");
var Helpers = require("../src/helpers");

test("Helpers.hashPath should hash using fnv", function (t) {
	t.plan(1);
	var path = ["hello", "world"];
	var hash = Helpers.hashPath(path);
	var expected = "07bc96c0f1c8eec4b933f45ff51f1ab8";
	t.equal(hash, expected, "Got expected hash");
});

test("Helpers.hashPath should handle empty paths", function (t) {
	t.plan(1);
	var path = [];
	var hash = Helpers.hashPath(path);
	var expected = CONSTANTS.ROOT;
	t.equal(hash, expected, "Got expected hash");
});

test("Helpers.makeSegments should take a string", function (t) {
	t.plan(1);
	var path = "hello";
	Helpers.makeSegments(path);
	t.pass("Created segments without fail");
});

test("Helpers.makeSegments should support multiple paths", function(t){
	t.plan(1);
	var path = "hello/world";
	var segments = Helpers.makeSegments(path);
	var split = ["hello", "world"];
	t.deepEqual(segments, split, "Git expected segments");
});

test("Helpers.makeSegments should not accept wildcards if strict", function(t){
	t.plan(1);
	var path = "hello/+";
	t.throws(function(){
		Helpers.makeSegments(path, true);
	}, /wildcard/, "Threw error");
});

test("Helpers.makeSegments should not accept invalid characters", function(t){
	t.plan(1);
	var path = "foo/\u0016/bar";
	t.throws(function(){
		Helpers.makeSegments(path);
	}, /illegal/, "Threw error");
});

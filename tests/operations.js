"use strict";
var test = require("tape");

var CONSTANTS = require("../src/constants");
var Operations = require("../src/operations");
var createDB = require("./createDB");

test("Operations.put and Operations.get should let you save and retrieve a value", function (t) {
	t.plan(2);
	var db = createDB();
	var hash = "hello";
	var value = "world";


	Operations.putValue(db, hash, value, function(err){
		if(err) return t.end(err);
		t.pass("Successfully put into DB");

		Operations.getValue(db, hash, function (getErr, storedValue) {
			if(getErr) return t.end(getErr);
			t.equal(storedValue, value, "Loaded correct value");
		});
	});
});

test("Operations.updatePath should create a directory and Operations.existsPath should fetch that it exists", function (t) {
	t.plan(2);
	var db = createDB();
	var hash = "Hello";
	var time = 420;

	Operations.updatePath(db, hash, time, function (err) {
		if(err) return t.end(err);
		t.pass("Sucessfully updated path timestamp");

		Operations.existsPath(db, hash, function(existErr, exists){
			if(existErr) return t.end(existErr);

			t.equal(exists, time, "Loaded time that was set");
		});
	});
});

test("Operations.updateChild should create children and Operations.childNames", function (t) {
	t.plan(3);

	var db = createDB();
	var hash = CONSTANTS.ROOT;
	var time = 420;

	var children = ["alice", "bob"];

	Operations.updateChild(db, hash, "alice", time, function (errA) {
		if(errA) return t.end(errA);
		t.pass("Wrote first child");

		Operations.updateChild(db, hash, "bob", time, function (errB) {
			if(errB) return t.end(errB);

			t.pass("Write second child");

			Operations.childNames(db, hash, function (nameErr, names) {
				if(nameErr) return t.end(nameErr);
				t.deepEqual(names, children, "Got expected children");
			});
		});
	});
});

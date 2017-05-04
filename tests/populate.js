"use strict";
var test = require("tape");

var Helpers = require("../helpers");
var Operations = require("../operations");
var Populate = require("../populate");
var createDB = require("./createDB");

test("Populate.put should store the data in the DB and populate the parents", function (t) {
	t.plan(4);

	var db = createDB();
	var segments = ["hello","world"];
	var value = "!";
	var time = 420;

	Populate.put(db, segments, time, value, function(putErr){
		if(putErr) return t.end(putErr);

		t.pass("Successfully ran put operation");

		Operations.getValue(db, Helpers.hashPath(segments), function (valueErr, storedValue) {
			if(valueErr) return t.end(valueErr);

			t.equal(storedValue, value, "Wrote value sucessfully");
		});
		Operations.existsPath(db, Helpers.hashPath(segments.slice(0, -1)), function (existsErr, storedTime) {
			if(existsErr) return t.end(existsErr);

			t.equal(storedTime, time, "Updated time for containing directory");
		});
		Operations.childNames(db, Helpers.hashPath(segments.slice(0, -1)), function (childError, children) {
			if(childError) return t.end(childError);

			t.deepEqual(children, ["world"], "Created child directory link");
		});
	});
});

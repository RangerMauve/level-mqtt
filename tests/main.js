"use strict";
var test = require("tape");
var each = require("async-each");

var MQTTLevelStore = require("../src").MQTTLevelStore;
var createDB = require("./createDB");

function createStore(){
	return new MQTTLevelStore(createDB());
}

test("MQTTLevelStore able to put and get", function (t) {
	t.plan(2);

	var store = createStore();

	var key = "foo/bar";
	var value = "Hello World";

	store.put(key, value, function (putErr) {
		if(putErr) return t.end(putErr);

		t.pass("Able to put data into store");

		store.get(key, function (getErr, gotValue) {
			if(getErr) return t.end(getErr);
			t.equals(gotValue, value, "Read back proper value");
		});
	});
});

test("MQTTLevelStore should generate parent nodes on a put", function (t) {
	t.plan(3);

	var store = createStore();

	var key = "foo/bar/baz";
	var segments = [
		"foo",
		"foo/bar",
		"foo/bar/baz"
	];

	store.put(key, "Hello World", function (putErr) {
		if(putErr) return t.end(putErr);

		each(segments, function(segment, cb){
			store.exists(segment, cb);
		}, function(err, results){
			if(err) t.end(err);
			results.forEach(function(result, index){
				t.ok(result, "Directory " + segments[index] + " exists");
			});
		});
	});
});

test("MQTTLevelStore should be able to list children", function (t) {
	t.plan(1);

	var store = createStore();

	store.put("Hello/World", "hi", function (put1Err){
		if(put1Err) return t.end(put1Err);

		store.put("Hello/Universe", "hi", function (put2Err) {
			if(put2Err) return t.end(put2Err);

			store.children("Hello", function (childErr, children) {
				if(childErr) return t.end(childErr);

				// Notice that children are fetched in alphanumeric order
				t.deepEqual(children, ["Universe", "World"], "Got children");
			});
		});
	});
});


test("MQTTLevelStore should be able to search values based on a wildcard", function (t) {
	t.plan(1);

	var keys = [
		"foo/bar",
		"foo/bar/baz",
		"foo/fizz"
	];
	var value = "Hello World";

	var search = "+/#";

	var expected = keys.map(function(key){
		return {
			path: key,
			value: value
		};
	});

	var store = createStore();

	each(keys, function(key, cb){
		store.put(key, value, cb);
	}, function(putErr){
		if(putErr) return t.end(putErr);

		store.search(search, function (searchErr, results) {
			if(searchErr) return t.end(searchErr);
			t.deepEqual(results, expected, "Got keys and their values");
		});
	});
});

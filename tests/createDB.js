"use strict";
module.exports = createDB;

function createDB() {
	return require("levelup")(Math.random(), {
		db: require("memdown")
	});
}

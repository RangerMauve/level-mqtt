# level-mqtt
Store key-value pairs in LevelDB, query with MQTT.

Inspired by filesystems and ldap, and MQTT. Provides a more powerful key-value store by allowing to fetch patterns.

```bash
npm install --save level-mqtt
```

## Example

``` javascript
var MQTTLevelStore = require("level-mqtt").MQTTLevelStore;

// any levelup-compatible DB instance
var db = someLevelDBInstance();

var store = MQTTLevelStore(db);

// Remember to handle errors!
store.put("foo/bar", "hello", function(err){
	store.put("foo/baz", "world", function (err) {
		store.search("foo/+", function (err, results) {
			results === [{
				path: "foo/bar",
				value: "hello"
			},{
				path: "foo/baz",
				value: "world"
			}]
		});
	});
});
```

## API

### `MQTTLevelStore.put(path : String, value : String, cb : Function<Error>)`

Store a value in the store.
 - `path` should be a string like `foo/bar/baz` to use to build up each directory in the path.
 - `value` should be a string to store in leveldb at that key.
 - `cb` will take an error if anything is wrong.

### `MQTTLevelStore.get(path : String, cb : Function<Error, String>)`

Fetch a value at a path in the store (Like in a key-value store).
 - `path` the string used to reference a key
 - `cb` will take an error if anything is wrong or the key doesn't exist, otherwise it'll give you `null` and the value

### `MQTTLevelStore.exists(path : String, cb : Function<Error, False|Number>)`

Checks if a directory exists in the tree. e.g if you put the key `foo/bar/baz`, then the following directories would exist: `foo/bar/baz`, `foo/bar`, `foo`.
 - `path` is the path to the directory you want to check
 - `cb` will have an error if something unexpected happens, otherwise it will provide either `false` if the directory doesn't exist, or a number representing the timestamp of when the directory was last updated (a put was performed either on it, or it's children)

### `MQTTLevelStore.children(path : String, cb : Function<Error, Array<String>>)`

Fetches names of all child directorys of a given directory. e.g if you put the keys `foo/bar` and `foo/baz`, calling `store.children("foo")` will yield `["bar", "baz"]`. Note that child names will be returned in alphabetical order.
 - `path` is the name of the directory to get children for
 - `cb` will either error out or return an array of child names. If there are no children, it will yield an empty array.

### `MQTTLevelStore.search(pattern : String, cb : Function<Error, Array<{Path, Value}>>)`

Searches through the tree in the database and returns an array of all keys that match the pattern, along with their values. Patterns are defined using MQTT, and you can read up on that [here](http://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices). The short of it is that you can use `+` as a directory name in order to match any child name at a path. e.g. `foo/+/bar` will match `foo/fizz/bar` and `foo/buzz/bar`. The `#` wildcard means "anything at this directory and all it's children". e.g. if you have the keys `foo`, `foo/bar`, `foo/bar/baz`, and `foo/fizz`, using the pattern `foo/#`, will match _all_ of those keys. You can have `+` wildcards anywhere in the pattern, but `#` wildcards can only go at the end.
 - `pattern` is the pattern to use to search the tree
 - `cb` will either have an error, or it will yield an array of objects which contain the `path` that was matched and the `value` at that path.

# Ideas

The goal is to make it easy to store and query trees of data using MQTT topic patterns. It takes the simple interface of a key-value store, and makes it very powerful by adding

## Definitions

* `FIRST` is a placeholder for a low valued ASCII character to be used for delimiting
* `LAST` is a placeholder for a high valued ASCII character to be used for delimiting
* `HASH` is a placeholder for the hash of a directory
* `NAME` is a placeholder for a directory's name, excluding the rest of the path (name of `/foo/bar/` is `bar`)
* `NOW` is a placeholder for the current wall-clock time that an operation is occurring at.

## Layout of keys
The paths `/foo/bar`, `foo/bar/`, `foo/bar`, and `/foo/bar/` are all equivalent to the directory `foo/bar`. Paths cannot contain wildcard characters (`+` and `#`)

Directories are hashed to avoid storing long keys and ensuring uniformity among keys. Will probably use [FNV-1a](https://github.com/casetext/fnv-lite) for hashing. Hashes should produced fixed length strings (prefix with `0`'s if necessary) in order to improve performance of retrieving parts of keys.

Directory names can only contain ASCII values between `LAST` and `FIRST`

If a directory exists, the following key is created: `HASH` + `FIRST` + `FIRST`. The value can be anything that's non `0`. Might be a good place for a timestamp of when the directory was created or updated?

Directories can hold one value, this is placed under `HASH` + `FIRST`. Notice that this will make sure that the value is placed right after the key describing that the directory exists

Links to sub-directories will be placed under `HASH` + `LAST` + `NAME`. This will place them after the directory contents and any metadata. The value of the key can be anything that is non `0`. Might be a good place for a creation timestamp. All sub-directories can be found by querying keys between `HASH` + `LAST` and `HASH` + `LAST` + `LAST`. The sub-directory name is preserved and not hashed to ensure ordering when reading keys and allowing to query ranges of sub-directories if needed.

## Getting paths
Getting the value at a non-wildcard path is easy. Just look up `HASH` + `FIRST` + `FIRST` for the value. If it doesn't exist, throw an error.

## Setting paths
When a path gets set all directories on the path will be written.

### Example:

`SET /foo/bar/baz/ to Quix`

Would create the following keys

`HASH(foo/bar/baz)` + `FIRST` + `FIRST` = `"Quix"`
`HASH(foo/bar/baz)` + `FIRST` = `NOW`
`HASH(foo/bar)` + `LAST` + `"baz"` = `NOW`
`HASH(foo/bar)` + `FIRST` = `NOW`
`HASH(foo)` + `LAST` + `"bar"` = `NOW`
`HASH(foo)` + `FIRST` = `NOW`

Notice that the order starts from the deepest point of the directory to the top level. This is to prevent unnecessary updates if a directory already exists.
Potentially the order won't matter if batching all operations at once will improve performance drastically.

## Getting patterns
MQTT specifies two kinds of "wildcard" characters which can be used in a directory name as a placeholder for multiple names.

### Example:

If we have the following directories set up:

	`foo` "Alice"
	`foo/bar` "Bob"
	`foo/baz` "Eve"
	`foo/bar/quix` "Carol"
	`qux/bar` "Dan"

### `+`

`+` is used to match a placeholder at a certain depth in a path. It can be placed at any point in the path. You can have more than on `+` wildcard in a path

`foo/+` will match the following:

	`foo/bar`
	`foo/baz`

Notice that `foo` and `foo/bar/baz` are ignored because they are at different depths, and `qux/bar` has a different directory name at the top level

If we used `+/bar`, we would get back:

	`foo/bar`
	`qux/bar`

Because the wildcard is at the top level.


### `#`

`#` is used to match all subdirectories for a given directory. It can be placed once at the end of a path. As well as matching subdirectories, it matches the directory directly before the `#` wildcard

`foo/#` will match the following:

	`foo`
	`foo/bar`
	`foo/baz`
	`foo/bar/quix`

Make sure you remember that `#` will read the directory before the `#` as well as all it's children!
Notice that `qux/bar` didn't get matched because it had a different top level directory.

Since `#` is only allowed at the end, the following would be an illegal topic: `foo/#/bar`

You can use both `+` and `#` in a path. (e.g `foo/+/bar/#` to read all directories under `foo`, find the ones with a subdirectory `bar`, and get all children of those directories)

A neat trick is that if you just use the path `#`, you can retrieve all values in a store

## Traversal operations (Interal)

### childNames(path) -> [child names]
Lists all of the direct child directories at the given path

### matchingChildren(path, pattern) -> [child names]
Lists all children (and sub-children) of the path that match the given pattern.

### allChildren(path) -> [child paths]
List all children and sub-children under a given path. (the `#` wildcard)

# q-ify

## Usage:

```
npm install q-ify --save
```

``` javascript
var qify = require('q-ify');

// simple static method wrapping
var qfs = qify(['readFile', 'readdir'], 'fs');

// w
```

#### `qify(methods, object, context)`

Returns an object that has all methods available 
on the original object with selected methods 
in that return promises.

#### `qify.factory(methods, factory, context)`

Returns a factory function that creates qified objects.

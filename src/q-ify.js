//     Qify
//     (c) simonfan
//     QIfy is licensed under the MIT terms.

/**
 * Create objects from wrapped functions
 *
 * @module Qify
 */

'use strict';

var Q = require('q'),
	_ = require('lodash');

/**
 * Normalizes the methods hash.
 *
 * @method normalizeMethodsHash
 * @private
 */
function normalizeMethodsHash(methods) {
	if (_.isArray(methods)) {

		return _.object(methods, methods);

	} else if (_.isString(methods)) {

		var res = {};
		res[methods] = methods;

		return res;

	} else {

		return methods;
	}
}

/**
 * @class qify
 */

/**
 * Takes an object and returns a version of
 * it with promisified methods.
 *
 * @method promisifyObject
 *
 * @param source {Object|String}
 *     Object: it is the object whose methods will be promisified.
 *     String: the module which returns an object to be promisified.
 *
 * @param methods {Object|Array}
 *     Array: array of methodNames to be promisified.
 *     Object: hash in format to: from, mapping methods
 *         of the original object to the ones in the promisified
 *         object.
 */
function promisifyObject(source, methods, bind) {

	// methods: { to: from }
	methods = normalizeMethodsHash(methods);

	var res = Object.create(source);

	if (bind) {
		_.each(methods, function (from, to) {
			res[to] = Q.nbind(source[from], res);
		});

	} else {
		_.each(methods, function (from, to) {
			res[to] = Q.denodeify(source[from]);
		});
	}

	return res;
}


/**
 * Requires the module and pass the returning object to qify.
 */
function promisifyModule(mod, methods, bind) {
	var object = require(mod);

	return promisifyObject(object, methods, bind);
}

/**
 * Takes a factory function and wraps it
 * with a function that runs the factory,
 * promisifies the resulting object and returns
 * the promisified version.
 *
 * @method factory
 *
 * @param fac {Function|Object}
 *     Function: run the `fac` function and
 *         promisify the object returned, binding the
 *         promisified methods to it.
 *     Object: *experimental* use Object.create(fac)
 *         and promisify the resulting object.
 *
 * @param methods {Array|Object}
 *     See @promisifyObject @param methods.
 */
function promisifyFactory(fac, methods, bind) {

	// default bind to true
	bind = typeof bind === 'undefined' ? true : bind;

	return function () {
		// invoke the fac and create an instance
		// of the object
		var obj = fac.apply(null, arguments);

		// promisify the methods on the given object
		return promisifyObject(obj, methods, bind);
	};
}

/**
 * Facade for either
 * promisifyObject or promisifyFactory
 *
 * @method qify
 *
 * - promisifyObject:
 * @param first {String|Object}
 * @param methods {Array|Object}
 *
 * - promisifyFactory
 * @param first {Function}
 * @param methods {Array|String}
 *
 * - promisifyModule:
 * @param first {String}
 * @param mehtods {Array|String|Object}
 */
var qify = module.exports = function qify(first, methods, bind) {

	if (typeof first === 'string') {

		return promisifyModule.apply(null, arguments);

	} else if (typeof first === 'object') {

		return promisifyObject.apply(null, arguments);

	} else if (typeof first === 'function') {

		return promisifyFactory.apply(null, arguments);
	}
};

/**
 * Make methods directly available on the object returned by module.
 */
qify.object = promisifyObject;
qify.factory = promisifyFactory;
qify.module = promisifyModule;

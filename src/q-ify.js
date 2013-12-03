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
 * @class qify
 */


/**
 * Create a promise-based version of a node.js
 * callback signature function. (denodeify or nfbind).
 *
 * @method promisifyFunction
 * @param func {Function}
 * @param [context] {Object}
 */
function promisifyFunction(func, context) {
	return context ? Q.nbind(func, context) : Q.denodeify(func);
}

/**
 * Takes an object and returns a version of
 * it with promisified methods optionally bound to the
 * some context.
 *
 * @method promisifyObject
 *
 * @param methods {Object|Array}
 *     Array: array of methodNames to be promisified.
 *     Object: hash in format to: from, mapping methods
 *         of the original object to the ones in the promisified
 *         object.
 *
 * @param object {Object|String}
 *     Object: it is the object whose methods will be promisified.
 *     String: the module which returns an object to be promisified.
 *
 * @param [context] {Object|Boolean}
 *     Object: the object to which bind promisified methods context
 *     Boolean: whether to bind methods to the object being promisified.
 */
function promisifyObject(methods, object, context) {

	// setting default values

	// if context is Boolean and true,
	// it is the object.
	context = context === true ? object : context;

	object = typeof object === 'string' ? require(object) : object;

	var res = Object.create(object);


	if (_.isArray(methods)) {

		methods.forEach(function (m) {
			res[m] = promisifyFunction(object[m], context);
		});

	} else if (_.isObject(methods)) {
		// methods: { to: from }

		_.each(methods, function (from, to) {
			res[to] = promisifyFunction(object[from], context);
		});
	}

	return res;
}

/**
 * Takes a methods hash and either
 * [1] a builder function that returns an object
 * [2] an object to be used as base by Object.create
 * and returns a function that creates a promisified
 * version of either the object returned (1) or
 * object created (2).
 *
 * @method factory
 *
 * @param methods {Array|Object}
 *     See @promisifyObject @param methods.
 *
 * @param fac {Function|Object}
 *     Function: run the `fac` function and
 *         promisify the object returned, binding the
 *         promisified methods to it.
 *     Object: *experimental* use Object.create(fac)
 *         and promisify the resulting object.
 *
 * @param context {Boolean|Object}
 *     Boolean: whether to bind the methods to the object
 *         created;
 *     Object: Context to which bind methods.
 */
function factory(methods, fac, context) {

	// context defaults to true.
	context = typeof context === 'undefined' ? true : context;

	if (typeof fac === 'object') {
		return function () {
			var obj = Object.create(fac);

			return promisifyObject(methods, obj, context);
		};

	} else if (typeof fac === 'function') {

		return function () {
			// invoke the fac and create an instance
			// of the object
			var obj = fac.apply(null, arguments);

			console.log(methods);
			console.log(obj);
			console.log(context);

			// promisify the methods on the given object
			return promisifyObject(methods, obj, context);
		};
	}
}

/**
 * Facade for either
 * promisifyObject or promisifyFunction
 *
 * @method qify
 *
 * - promisifyObject:
 * @param first {Array|Object} Methods
 * @param second {String|Object} Object
 * @param third {Object|Boolean} Context
 *
 * - promisifyFunction
 * @param first {Function} Function to be promisified
 * @param [second] {Object} Context
 */
var qify = module.exports = function qify(first, second, third) {

	if (typeof first === 'object') {

		// object denodeify.
		// first:
		//     {Array} of methods
		//     {Object} is a method map from -> to
		// second:
		//     {String} module name
		//     {Object} object to be q-ified
		// third:
		//     {Object} context to which methods should be bound
		//     {Boolean} should the object be bound to itself?

		return promisifyObject.apply(null, arguments);

	} else if (typeof first === 'function') {

		// simple denodeify.
		// first:
		//     {Function} function to be denodeified
		// second:
		//     {Object} context
		return promisifyFunction.apply(null, arguments);
	}
};

/**
 * Make methods directly available on the object returned by module.
 */
qify.factory = factory;
qify.promisifyObject = promisifyObject;
qify.promisifyFunction = promisifyFunction;

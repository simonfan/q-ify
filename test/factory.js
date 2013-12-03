(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'../src/q-ify' :
		// browser
		'q-ify',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(qify, should) {
	'use strict';

	var Q = require('q');

	describe('qify factory', function () {
		beforeEach(function (done) {
			var Foo = process.Foo = function Foo(attributes) {
				this.attributes = attributes;
			};

			Foo.prototype.eventuallyGet = function eventuallyGet(attributeName, cb) {

				var attribute = this.attributes[ attributeName ];

				setTimeout(function() {
					if (typeof attribute !== 'undefined') {
						cb(null, attribute);
					} else {
						cb('Attribute not found');
					}
				});
			};

			done();
		});

		it('creates a builder', function (done) {
			var qFoo = qify.factory(['eventuallyGet'], function(attributes) {
				return new process.Foo(attributes);
			});

			var foo = qFoo({
				name: 'little foo',
				age: 5
			});

			console.log(foo)

			var eventuallyGetName = foo.eventuallyGet('name'),
				eventuallyGetError = foo.eventuallyGet('not-existent');

			should(Q.isPromise(eventuallyGetName)).be.true;
			should(Q.isPromise(eventuallyGetError)).be.true;

			eventuallyGetName
				.done(function gotName(name) {
					should(name).eql('little foo');
				});

			eventuallyGetError
				.done(null, function(error) {
					should(error).eql('Attribute not found');
				});

			Q.allSettled([eventuallyGetName, eventuallyGetError])
				.done(function() {
					done()
				});
		});
	});
});

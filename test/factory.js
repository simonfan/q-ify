'use strict';

var should = require('should');

var qify = require('../src/q-ify');

var Q = require('q');

describe('qify factory', function () {
	beforeEach(function (done) {
		var Foo = this.Foo = function Foo(attributes) {
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
		var Foo = this.Foo,
			qFoo = qify.factory(function(attributes) {
				return new Foo(attributes);
			}, ['eventuallyGet']);

		var foo = qFoo({
			name: 'little foo',
			age: 5
		});

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

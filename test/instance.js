'use strict';

var should = require('should');

var qify = require('../src/q-ify');

var Q = require('q');

describe('qify working with instance objects', function () {
	beforeEach(function (done) {

		var Foo = process.Foo = function Foo(bar) {
			this.bar = bar;
		};

		Foo.prototype.callbackBar = function callbackBar(succeed, cb) {
			var bar = this.bar;

			setTimeout(function() {

				if (succeed) {
					cb(null, bar);
				} else {
					cb('failure', bar);
				}

			}, 200);
		};

		done();
	});

	it('pre test', function (done) {
		var littleFoo = new process.Foo('little');

		// check that the callback is working
		littleFoo.callbackBar(true, function(err, bar) {

			bar.should.eql('little');

			done();
		});

	});

	it('should bind promise returning method to the object', function(done) {
		var littleFoo = new process.Foo('little');

		littleFoo = qify(littleFoo, ['callbackBar'], true);

		var success = littleFoo
			.callbackBar(true)
			.done(function(bar) {
				bar.should.eql('little');
			})

		var failure = littleFoo
			.callbackBar(false)
			.done(function succeed(bar) {
				// should never be called
			}, function fail(err) {
				err.should.ok;
			});

		Q.allSettled([success, failure])
			.then(function() {
				done();
			})
	});
});

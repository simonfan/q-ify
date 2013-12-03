(function(name, factory) {

	var deps = typeof define !== 'function' ?
		// node
		['should', '../src/q-ify', 'q'] :
		// browser
		['should', 'q-ify'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(should, qify, Q) {
	'use strict';

	var path = require('path');

	describe('Static: ', function () {
		beforeEach(function (done) {
			done();
		});

		it('wraps node module static methods in promise-based API', function (done) {

			should(true).ok;

			var qfs = qify(['readFile'], 'fs');

			console.log(qfs);

			qfs.should.have.property('readFile');

			should(Q.isPromise(qfs.readFile('lala'))).ok;

			// failure reading
			var fail = qfs.readFile('non-existent-file')
				.done(function(data) {

				}, function(err) {
					should(err).ok
				});

			// success reading
			var success = qfs.readFile(path.join(__dirname, 'temp/data.json'), { encoding: 'utf-8' })
				.done(function(data) {

					data.should.be.type('string');

					data = JSON.parse(data);

					data.should.have.property('name', 'lambda');

				}, function(err) {

				})

			Q.allSettled([fail, success])
				.done(function() {
					done();
				});

		});

		it('Should map methods to other names', function() {

			var qfs = qify({
				qReadFile: 'readFile',
			}, 'fs');

			qfs.should.have.property('qReadFile');
			qfs.readFile.should.eql(require('fs').readFile);

		});

		it('should keep old methods untouched', function() {
			var qfs = qify(['readdir'], 'fs');

			qfs.readdir.should.not.eql(require('fs').readdir);
			qfs.readFile.should.eql(require('fs').readFile);
		});
	});
});

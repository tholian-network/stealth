
import { console  } from './console.mjs';



const compare = function(array1, array2) {

	if (array1.length !== array2.length) {
		return true;
	}

	for (let a = 0, al = array1.length; a < al; a++) {

		if (array1[a] !== array2[a]) {
			return true;
		}

	}

	return false;

};



export const Renderer = function(settings) {

	this.settings = Object.assign({}, settings);
	this._cache   = null;

};


Renderer.prototype = {

	render: function(data) {

		let cache = this._cache || null;
		if (cache !== null) {

			let temp = [];

			data.states.forEach((state) => {

				state.tests.forEach((test) => {

					test.results.data.forEach((result) => {
						temp.push(result);
					});

				});

			});


			let diff = compare(temp, cache);
			if (diff === false) {

				if (data.state !== null) {
					return;
				}

			}

		}


		if (this.settings.debug === true) {
			console.log('');
		} else {
			console.clear();
		}


		// Reset cache
		cache = this._cache = [];


		let blank = '';

		data.states.forEach((state) => {

			state.tests.forEach((test) => {

				if (test.name.length > blank.length) {
					blank = new Array(test.name.length).fill(' ').join('');
				}

			});

		});

		data.states.forEach((state, s) => {

			if (s > 0) console.log('');


			let status = 'unknown';

			if (data.state === state) {
				console.warn('review/' + state.id + '.mjs:');
			} else {
				console.log('review/' + state.id + '.mjs:');
			}


			let all_ok = true;

			state.tests.forEach((test) => {

				test.results.data.forEach((result) => {
					cache.push(result);
				});


				let indent  = blank.substr(0, blank.length - test.name.length);
				let message = '> ' + test.name + ' ' + indent + test.results.render();

				if (data.state === state && data.state.test === test) {

					console.warn(message);

				} else {

					let fails = test.results.data.includes(false);
					let nulls = test.results.data.includes(null);

					if (fails === true) {
						all_ok = false;
						status = 'fail';
						console.error(message);
					} else if (nulls === false) {
						console.info(message);
					} else if (nulls === true && test.results.index > 0) {
						all_ok = false;
						status = 'fail';
						console.warn(message);
					} else {
						all_ok = false;
						console.log(message);
					}

				}

			});


			if (all_ok === true) {
				status = 'okay';
			}


			if (data.state === state) {

				if (data.state.test !== null) {
					console.warn('running "' + data.state.test.name + '" ... ');
				} else {
					console.warn('running ... ');
				}

			} else if (status === 'okay') {
				console.info('okay.');
			} else if (status === 'fail') {
				console.error('fail!');
			} else {
				console.log('unknown?');
			}

		});

	}

};


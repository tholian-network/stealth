
import { describe, finish } from '../../covert/index.mjs';
import { Date, isDate     } from '../source/Date.mjs';



describe('Date.isDate()', function(assert) {

	let date1 = new Date('01.02.20 13:37Z');
	let date2 = new Date('2020-02-01T13:37:00Z');

	assert(typeof Date.isDate, 'function');

	assert(Date.isDate(date1), true);
	assert(Date.isDate(date2), true);

});


describe('isDate()', function(assert) {

	let date1 = new Date('01.02.20 13:37Z');
	let date2 = new Date('2020-02-01T13:37:00Z');

	assert(typeof isDate, 'function');

	assert(isDate(date1), true);
	assert(isDate(date2), true);

});

describe('Date.prototype.toISOString()', function(assert) {

	let date1 = new Date('02.01.2020 13:37Z');
	let date2 = new Date('2020-02-01T13:37:00Z');

	assert(Object.prototype.toString.call(date1), '[object Date]');
	assert(Object.prototype.toString.call(date2), '[object Date]');

	assert((date1).toISOString(), '2020-02-01T13:37:00.000Z');
	assert((date2).toISOString(), '2020-02-01T13:37:00.000Z');

});

describe('Date.prototype.valueOf()', function(assert) {

	let date1 = new Date('03.04.2020 13:37Z');
	let date2 = new Date('2020-03-04T13:37:00Z');

	assert((date1).valueOf(), 1583329020000);
	assert((date2).valueOf(), 1583329020000);

	assert(JSON.stringify(date1), '"2020-03-04T13:37:00.000Z"');
	assert(JSON.stringify(date2), '"2020-03-04T13:37:00.000Z"');

});


export default finish('base/Date', {
	internet: false,
	network:  false
});


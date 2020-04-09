
import { describe, finish } from '../../covert/index.mjs';
import { Date, isDate     } from '../source/Date.mjs';



describe('Date', function(assert) {

	let date1 = new Date('01.02.20 13:37');
	let date2 = new Date('01.02.20 13:37');

	assert(typeof Date.isDate, 'function');
	assert(Date.isDate, isDate);

	assert(isDate(date1), true);
	assert(isDate(date2), true);

	assert(Object.prototype.toString.call(date1), '[object Date]');
	assert(Object.prototype.toString.call(date2), '[object Date]');

	assert((date1).toString(), 'Thu Jan 02 2020 13:37:00 GMT+0100 (Central European Standard Time)');
	assert((date2).toString(), 'Thu Jan 02 2020 13:37:00 GMT+0100 (Central European Standard Time)');

	assert((date1).valueOf(), 1577968620000);
	assert((date2).valueOf(), 1577968620000);

	assert(JSON.stringify(date1), '"2020-01-02T12:37:00.000Z"');
	assert(JSON.stringify(date2), '"2020-01-02T12:37:00.000Z"');

});


export default finish('base/Date');


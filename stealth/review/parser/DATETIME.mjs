
import { describe, finish } from '../../../covert/index.mjs';
import { DATETIME         } from '../../../stealth/source/parser/DATETIME.mjs';



describe('DATETIME.isDATETIME()/leapyear', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('29.02.2020 01:02:03');
	let date3 = DATETIME.parse('30.02.2020 01:02:03');
	let date4 = DATETIME.parse('2020-02-30T01:02:03.123Z');

	assert(DATETIME.isDATETIME(date1), false);
	assert(DATETIME.isDATETIME(date2), true);
	assert(DATETIME.isDATETIME(date3), false);
	assert(DATETIME.isDATETIME(date4), true);

});

describe('DATETIME.isDATE()/leapyear', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('29.02.2020');
	let date3 = DATETIME.parse('30.02.2020');
	let date4 = DATETIME.parse('2020-02-30T01:02:03.123Z');

	assert(DATETIME.isDATE(date1), true);
	assert(DATETIME.isDATE(date2), true);
	assert(DATETIME.isDATE(date3), false);
	assert(DATETIME.isDATE(date4), false);

});

describe('DATETIME.parse()/timestamp', function(assert) {

	let date1 = DATETIME.parse(1600000000000);
	let date2 = DATETIME.parse(-12219292800000);
	let date3 = DATETIME.parse(11139552000000);

	assert(date1, {
		year:   2020,
		month:  9,
		day:    13,
		hour:   14,
		minute: 26,
		second: 40
	});

	assert(date2, {
		year:   1582,
		month:  10,
		day:    15,
		hour:   0,
		minute: 53,
		second: 28
	});

	assert(date3, {
		year:   2323,
		month:  1,
		day:    1,
		hour:   1,
		minute: 0,
		second: 0
	});

});

describe('DATETIME.isDATETIME()/timestamp', function(assert) {

	let date1 = DATETIME.parse(1600000000000);
	let date2 = DATETIME.parse(-12219292800000);
	let date3 = DATETIME.parse(11139552000000);

	assert(DATETIME.isDATETIME(date1), true);
	assert(DATETIME.isDATETIME(date2), true);
	assert(DATETIME.isDATETIME(date3), true);

});

describe('DATETIME.parse()/iso8601', function(assert) {

	let date1 = DATETIME.parse('2020-09-13T12:26:40Z');
	let date2 = DATETIME.parse('1582-10-15T00:00:00Z');

	assert(date1, {
		year:   2020,
		month:  9,
		day:    13,
		hour:   14,
		minute: 26,
		second: 40
	});

	assert(date2, {
		year:   1582,
		month:  10,
		day:    15,
		hour:   0,
		minute: 53,
		second: 28
	});

});

describe('DATETIME.isDATETIME()/iso8601', function(assert) {

	let date1 = DATETIME.parse('2020-09-13T12:26:40Z');
	let date2 = DATETIME.parse('1582-10-15T00:00:00Z');

	assert(DATETIME.isDATETIME(date1), true);
	assert(DATETIME.isDATETIME(date2), true);

});

describe('DATETIME.parse()/time', function(assert) {

	let time1 = DATETIME.parse('01:02:03');
	let time2 = DATETIME.parse('24:02:03');
	let time3 = DATETIME.parse('12:60:00');
	let time4 = DATETIME.parse('12:59:60');

	assert(time1, {
		year:   null,
		month:  null,
		day:    null,
		hour:   1,
		minute: 2,
		second: 3
	});

	assert(time2, {
		year:   null,
		month:  null,
		day:    null,
		hour:   null,
		minute: 2,
		second: 3
	});

	assert(time3, {
		year:   null,
		month:  null,
		day:    null,
		hour:   12,
		minute: null,
		second: 0
	});

	assert(time4, {
		year:   null,
		month:  null,
		day:    null,
		hour:   12,
		minute: 59,
		second: null
	});

});

describe('DATETIME.isTIME()/time', function(assert) {

	let time1 = DATETIME.parse('01:02:03');
	let time2 = DATETIME.parse('24:02:03');
	let time3 = DATETIME.parse('12:60:00');
	let time4 = DATETIME.parse('12:59:60');

	assert(DATETIME.isTIME(time1), true);
	assert(DATETIME.isTIME(time2), false);
	assert(DATETIME.isTIME(time3), false);
	assert(DATETIME.isTIME(time4), false);

});

describe('DATETIME.parse()/date', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('2020-02-29');
	let date3 = DATETIME.parse('30.02.2020');
	let date4 = DATETIME.parse('2020-02-31');

	assert(date1, {
		year:   2019,
		month:  2,
		day:    28,
		hour:   null,
		minute: null,
		second: null
	});

	assert(date2, {
		year:   2020,
		month:  2,
		day:    29,
		hour:   null,
		minute: null,
		second: null
	});

	assert(date3, {
		year:   2020,
		month:  2,
		day:    30,
		hour:   null,
		minute: null,
		second: null
	});

	assert(date4, {
		year:   2020,
		month:  2,
		day:    31,
		hour:   null,
		minute: null,
		second: null
	});

});

describe('DATETIME.isDATE()/date', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('2020-02-29');
	let date3 = DATETIME.parse('30.02.2020');
	let date4 = DATETIME.parse('2020-02-31');

	assert(DATETIME.isDATE(date1), true);
	assert(DATETIME.isDATE(date2), true);
	assert(DATETIME.isDATE(date3), false);
	assert(DATETIME.isDATE(date4), false);

});

describe('DATETIME.parse()/datetime', function(assert) {

	let datetime1 = DATETIME.parse('28.02.2019 01:02:03');
	let datetime2 = DATETIME.parse('2020-02-29 24:02:03');
	let datetime3 = DATETIME.parse('30.02.2020 12:60:00');
	let datetime4 = DATETIME.parse('2020-02-31 12:59:60');

	assert(datetime1, {
		year:   2019,
		month:  2,
		day:    28,
		hour:   1,
		minute: 2,
		second: 3
	});

	assert(datetime2, {
		year:   2020,
		month:  2,
		day:    29,
		hour:   null,
		minute: 2,
		second: 3
	});

	assert(datetime3, {
		year:   2020,
		month:  2,
		day:    30,
		hour:   12,
		minute: null,
		second: 0
	});

	assert(datetime4, {
		year:   2020,
		month:  2,
		day:    31,
		hour:   12,
		minute: 59,
		second: null
	});

});

describe('DATETIME.isDATETIME()/datetime', function(assert) {

	let datetime1 = DATETIME.parse('28.02.2019 01:02:03');
	let datetime2 = DATETIME.parse('28.02.2019 23:59:59');
	let datetime3 = DATETIME.parse('2020-02-29 24:02:03');
	let datetime4 = DATETIME.parse('2020-02-29 23:02:03');
	let datetime5 = DATETIME.parse('30.02.2020 12:60:00');
	let datetime6 = DATETIME.parse('01.02.2020 12:59:00');
	let datetime7 = DATETIME.parse('2020-02-31 12:59:60');
	let datetime8 = DATETIME.parse('2020-02-01 12:59:59');

	assert(DATETIME.isDATETIME(datetime1), true);
	assert(DATETIME.isDATETIME(datetime2), true);
	assert(DATETIME.isDATETIME(datetime3), false);
	assert(DATETIME.isDATETIME(datetime4), true);
	assert(DATETIME.isDATETIME(datetime5), false);
	assert(DATETIME.isDATETIME(datetime6), true);
	assert(DATETIME.isDATETIME(datetime7), false);
	assert(DATETIME.isDATETIME(datetime8), true);

});

// TODO: describe('DATETIME.render()', function(assert) {});
// TODO: describe('DATETIME.sort()', function(assert) {});


export default finish('stealth/parser/DATETIME');


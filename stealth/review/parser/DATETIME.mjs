
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

describe('DATETIME.isDate()/leapyear', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('29.02.2020');
	let date3 = DATETIME.parse('30.02.2020');
	let date4 = DATETIME.parse('2020-02-30T01:02:03.123Z');

	assert(DATETIME.isDate(date1), true);
	assert(DATETIME.isDate(date2), true);
	assert(DATETIME.isDate(date3), false);
	assert(DATETIME.isDate(date4), false);

});

describe('DATETIME.parse()/IMF', function(assert) {

	let date1 = DATETIME.parse('Sun, 14 Apr 2019 13:15:09 GMT');
	let date2 = DATETIME.parse('Sat, 09 Aug 1997 23:54:35 GMT');

	assert(date1, {
		year:    2019,
		month:   4,
		day:     14,
		hour:    13,
		minute:  15,
		second:  9
	});

	assert(date2, {
		year:    1997,
		month:   8,
		day:     9,
		hour:    23,
		minute:  54,
		second:  35
	});

});

describe('DATETIME.parse()/iso8601', function(assert) {

	let date1 = DATETIME.parse('2020-09-13T12:26:40Z');
	let date2 = DATETIME.parse('1582-10-15T00:00:00Z');

	assert(date1, {
		year:   2020,
		month:  9,
		day:    13,
		hour:   12,
		minute: 26,
		second: 40
	});

	assert(date2, {
		year:   1582,
		month:  10,
		day:    15,
		hour:   0,
		minute: 0,
		second: 0
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

describe('DATETIME.isTime()/time', function(assert) {

	let time1 = DATETIME.parse('01:02:03');
	let time2 = DATETIME.parse('24:02:03');
	let time3 = DATETIME.parse('12:60:00');
	let time4 = DATETIME.parse('12:59:60');

	assert(DATETIME.isTime(time1), true);
	assert(DATETIME.isTime(time2), false);
	assert(DATETIME.isTime(time3), false);
	assert(DATETIME.isTime(time4), false);

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

describe('DATETIME.isDate()/date', function(assert) {

	let date1 = DATETIME.parse('28.02.2019');
	let date2 = DATETIME.parse('2020-02-29');
	let date3 = DATETIME.parse('30.02.2020');
	let date4 = DATETIME.parse('2020-02-31');

	assert(DATETIME.isDate(date1), true);
	assert(DATETIME.isDate(date2), true);
	assert(DATETIME.isDate(date3), false);
	assert(DATETIME.isDate(date4), false);

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

describe('DATETIME.render()', function(assert) {

	let datetime = DATETIME.parse('1582-01-01 23:59:59');
	let date     = DATETIME.parse('2020-01-10');
	let time     = DATETIME.parse('12:03:04');

	assert(DATETIME.render(datetime), '1582-01-01 23:59:59');
	assert(DATETIME.render(date),     '2020-01-10');
	assert(DATETIME.render(time),     '12:03:04');

});

describe('DATETIME.sort()', function(assert) {

	let datetime1 = DATETIME.parse('1582-01-01 23:59:59');
	let datetime2 = DATETIME.parse('2020-01-01 23:02:03');
	let datetime3 = DATETIME.parse('2020-01-10 23:02:00');
	let datetime4 = DATETIME.parse('2020-06-01 12:02:01');
	let datetime5 = DATETIME.parse('2020-06-01 12:02:02');
	let datetime6 = DATETIME.parse('2020-06-01 12:03:01');

	let date1 = DATETIME.parse('1582-01-02');
	let date2 = DATETIME.parse('2020-01-10');
	let date3 = DATETIME.parse('2020-03-01');
	let date4 = DATETIME.parse('2021-01-01');

	let time1 = DATETIME.parse('12:01:02');
	let time2 = DATETIME.parse('12:03:04');
	let time3 = DATETIME.parse('12:03:05');
	let time4 = DATETIME.parse('23:01:05');

	assert(DATETIME.sort([
		datetime4,
		datetime2,
		datetime6,
		datetime1,
		datetime5,
		datetime3
	]), [
		datetime1,
		datetime2,
		datetime3,
		datetime4,
		datetime5,
		datetime6
	]);

	assert(DATETIME.sort([
		date4,
		date1,
		date3,
		date2
	]), [
		date1,
		date2,
		date3,
		date4
	]);

	assert(DATETIME.sort([
		time4,
		time1,
		time3,
		time2
	]), [
		time1,
		time2,
		time3,
		time4
	]);

	assert(DATETIME.sort([
		datetime6,
		date4,
		datetime5,
		date3,
		datetime4,
		time4,
		date2,
		datetime3,
		time3,
		date1,
		datetime2,
		time2,
		datetime1,
		time1
	]), [
		datetime1,
		date1,
		datetime2,
		datetime3,
		date2,
		date3,
		datetime4,
		datetime5,
		datetime6,
		date4,
		time1,
		time2,
		time3,
		time4
	]);

});

describe('DATETIME.toIMF()', function(assert) {

	let date1 = DATETIME.parse('Sun, 14 Apr 2019 13:15:09 GMT');
	let date2 = DATETIME.parse('Fri, 09 Aug 1997 23:54:35 GMT');
	let date3 = DATETIME.parse('Sun, 01 Dec 3001 23:59:59 GMT');
	let imf1  = DATETIME.toIMF(date1);
	let imf2  = DATETIME.toIMF(date2);
	let imf3  = DATETIME.toIMF(date3);

	assert(imf1, 'Sun, 14 Apr 2019 13:15:09 GMT');
	assert(imf2, 'Sat, 09 Aug 1997 23:54:35 GMT');
	assert(imf3, 'Tue, 01 Dec 3001 23:59:59 GMT');

});

describe('DATETIME.toDate()', function(assert) {

	let datetime = DATETIME.parse('2020-01-01 01:00:00');
	let date     = DATETIME.parse('2020-01-02');
	let time     = DATETIME.parse('01:02:03');

	assert(DATETIME.toDate(datetime), {
		year:   2020,
		month:  1,
		day:    1,
		hour:   null,
		minute: null,
		second: null
	});

	assert(DATETIME.toDate(date), {
		year:   2020,
		month:  1,
		day:    2,
		hour:   null,
		minute: null,
		second: null
	});

	assert(DATETIME.toDate(time), null);

});

describe('DATETIME.toTime()', function(assert) {

	let datetime = DATETIME.parse('2020-01-01 01:00:00');
	let date     = DATETIME.parse('2020-01-02');
	let time     = DATETIME.parse('01:02:03');

	assert(DATETIME.toTime(datetime), {
		year:   null,
		month:  null,
		day:    null,
		hour:   1,
		minute: 0,
		second: 0
	});

	assert(DATETIME.toTime(date), null);

	assert(DATETIME.toTime(time), {
		year:   null,
		month:  null,
		day:    null,
		hour:   1,
		minute: 2,
		second: 3
	});

});


export default finish('stealth/parser/DATETIME', {
	internet: false,
	network:  false
});


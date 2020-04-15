
import { describe, finish } from '../index.mjs';
import { Timeline         } from '../source/Timeline.mjs';



const TEMPLATE = function(assert) {

	let bar = 132;

	assert(bar, 123);

	setTimeout(() => {
		assert(true);
	}, 1000);

};

const TOLERANCE = 16; // node.js/libuv uses 16ms callstack



describe('Timeline.from', function(assert) {

	let timeline1 = Timeline.from(null);
	let timeline2 = Timeline.from(5);
	let timeline3 = Timeline.from(TEMPLATE);
	let timeline4 = Timeline.from([ 13, 37, null ]);
	let timeline5 = Timeline.from([ null, {}, 13 ]);


	assert(timeline1.index === 0);
	assert(timeline2.index === 0);
	assert(timeline3.index === 0);
	assert(timeline4.index === 0);
	assert(timeline5.index === 0);

	assert(timeline1.start === null);
	assert(timeline2.start === null);
	assert(timeline3.start === null);
	assert(timeline4.start === null);
	assert(timeline5.start === null);

	assert(timeline1.length === 0);
	assert(timeline2.length === 5);
	assert(timeline3.length === 2);
	assert(timeline4.length === 3);
	assert(timeline5.length === 3);

	assert(timeline2.data[0] === null);
	assert(timeline2.data[1] === null);
	assert(timeline2.data[2] === null);
	assert(timeline2.data[3] === null);
	assert(timeline2.data[4] === null);

	assert(timeline3.data[0] === null);
	assert(timeline3.data[1] === null);

	assert(timeline4.data[0] === 13);
	assert(timeline4.data[1] === 37);
	assert(timeline4.data[2] === null);

	assert(timeline5.data[0] === null);
	assert(timeline5.data[1] === null);
	assert(timeline5.data[2] === 13);

});

describe('timeline.toString', function(assert) {

	let timeline = Timeline.from(null);

	assert(timeline.toString(),                      '[object Timeline]');
	assert(Object.prototype.toString.call(timeline), '[object Timeline]');

});

describe('timeline.complete', function(assert) {

	let timeline = Timeline.from(4);

	assert(timeline.start === null);
	timeline.time();
	assert(timeline.start !== null);
	assert(timeline.complete(), false);

	timeline.time();
	assert(timeline.complete(), false);

	timeline.time();
	assert(timeline.complete(), false);

	timeline.time();
	assert(timeline.complete(), false);

	timeline.time();
	assert(timeline.complete(), true);

});

describe('timeline.current', function(assert) {

	let timeline = Timeline.from(4);

	assert(timeline.current(), 0);
	assert(timeline.index,     0);
	timeline.time();
	assert(timeline.current(), 0);
	assert(timeline.index,     0);

	timeline.time();
	assert(timeline.current(), 1);
	assert(timeline.index,     1);

	timeline.time();
	assert(timeline.current(), 2);
	assert(timeline.index,     2);

	timeline.time();
	assert(timeline.current(), 3);
	assert(timeline.index,     3);

	timeline.time();
	assert(timeline.current(), 4);
	assert(timeline.index,     4);

});

describe('timeline.progress', function(assert) {

	let timeline = Timeline.from(2);

	assert(timeline.progress(), 0);
	timeline.time();
	assert(timeline.progress(), 0);

	setTimeout(() => {
		assert(timeline.progress() >= 100 && timeline.progress() <= 100 + TOLERANCE);
	}, 100);

	setTimeout(() => {
		assert(timeline.progress() >= 200 && timeline.progress() <= 200 + TOLERANCE);
	}, 200);

	setTimeout(() => {
		assert(timeline.progress() >= 300 && timeline.progress() <= 300 + TOLERANCE);
	}, 300);

	setTimeout(() => {
		assert(timeline.progress() >= 400 && timeline.progress() <= 400 + TOLERANCE);
	}, 400);

	setTimeout(() => {
		assert(timeline.progress() >= 500 && timeline.progress() <= 500 + TOLERANCE);
	}, 500);

});

describe('timeline.includes', function(assert) {

	let timeline1 = Timeline.from([ 13, 37,   null ]);
	let timeline2 = Timeline.from([ 13, 12,   37   ]);
	let timeline3 = Timeline.from([ 13, null, 13   ]);
	let timeline4 = Timeline.from([ 37, null, 37   ]);


	assert(timeline1.includes(13),   true);
	assert(timeline1.includes(37),   true);
	assert(timeline1.includes(null), true);

	assert(timeline2.includes(13),   true);
	assert(timeline2.includes(37),   true);
	assert(timeline2.includes(null), false);

	assert(timeline3.includes(13),   true);
	assert(timeline3.includes(37),   false);
	assert(timeline3.includes(null), true);

	assert(timeline4.includes(13),   false);
	assert(timeline4.includes(37),   true);
	assert(timeline4.includes(null), true);

});

describe('timeline.render', function(assert) {

	let timeline1 = Timeline.from([ 13, 37,   null ]);
	let timeline2 = Timeline.from([ 13, 12,   37   ]);
	let timeline3 = Timeline.from([ 13, 999,  3713 ]);
	let timeline4 = Timeline.from([ 37, null, 1337 ]);
	let timeline5 = Timeline.from([ 13, null, null ]);
	let timeline6 = Timeline.from(0);


	assert(timeline1.render(), '| 13ms| 37ms|  ?  |');
	assert(timeline2.render(), '| 13ms| 12ms| 37ms|');
	assert(timeline3.render(), '| 13ms|999ms|  4s |');
	assert(timeline4.render(), '| 37ms|  ?  |  1s |');
	assert(timeline5.render(), '| 13ms|  ?  |  ?  |');
	assert(timeline6.render(), '| no assert() calls |');

});

describe('timeline.reset', function(assert) {

	let timeline = Timeline.from(3);

	assert(timeline.index,   0);
	assert(timeline.start,   null);
	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);

	timeline.time();

	setTimeout(() => {
		timeline.time();
	}, 100);

	setTimeout(() => {
		timeline.time();
	}, 200);

	setTimeout(() => {
		timeline.time();
	}, 300);

	setTimeout(() => {

		timeline.reset();

		assert(timeline.index,   0);
		assert(timeline.start,   null);
		assert(timeline.data[0], null);
		assert(timeline.data[1], null);
		assert(timeline.data[2], null);
		assert(timeline.length,  3);

	}, 500);

});

describe('timeline.time', function(assert) {

	let timeline = Timeline.from(3);


	assert(timeline.index,   0);
	assert(timeline.start,   null);
	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);

	timeline.time();

	assert(timeline.index,   0);
	assert(timeline.start,   Date.now());
	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);


	setTimeout(() => {
		timeline.time();
	}, 100);

	setTimeout(() => {
		timeline.time();
	}, 200);

	setTimeout(() => {
		timeline.time();
	}, 300);

	setTimeout(() => {

		assert(timeline.index,   3);
		assert(timeline.start !== null);
		assert(timeline.data[0] >= 100 && timeline.data[0] < 100 + TOLERANCE);
		assert(timeline.data[1] >= 200 && timeline.data[1] < 200 + TOLERANCE);
		assert(timeline.data[2] >= 300 && timeline.data[2] < 300 + TOLERANCE);
		assert(timeline.length,  3);

	}, 500);

});


export default finish('covert/Timeline');


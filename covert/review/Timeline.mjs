
import { isFunction           } from '../../covert/extern/base.mjs';
import { describe, finish     } from '../../covert/index.mjs';
import { Timeline, isTimeline } from '../../covert/source/Timeline.mjs';



const LINK = {
	file: '/tmp/Timeline.mjs',
	line: 3
};

const TEMPLATE = function(assert) {

	let bar = 132;

	assert(bar, 123);

	setTimeout(() => {
		assert(true);
	}, 1000);

	assert(true);

};

const TOLERANCE = 16; // node.js/libuv uses 16ms callstack



describe('new Timeline()', function(assert) {

	let results = new Timeline([{
		code: 'assert(bar, 123);',
		diff: null,
		file: '/tmp/whatever.mjs',
		line: 4
	}, {
		code: 'assert(true);',
		diff: null,
		file: '/tmp/whatever.mjs',
		line: 7
	}, {
		code: 'assert(true);',
		diff: null,
		file: '/tmp/whatever.mjs',
		line: 10
	}]);

	assert(results.length,       3);
	assert(results.data.length,  3);
	assert(results.stack.length, 3);

});

describe('Timeline.isTimeline()', function(assert) {

	assert(isFunction(Timeline.isTimeline), true);

	let results1 = Timeline.from(null);
	let results2 = Timeline.from(5);
	let results3 = Timeline.from(TEMPLATE, LINK);

	assert(Timeline.isTimeline(results1), false);
	assert(Timeline.isTimeline(results2), true);
	assert(Timeline.isTimeline(results3), true);

});

describe('isTimeline()', function(assert) {

	assert(isFunction(isTimeline), true);

	let results1 = Timeline.from(null);
	let results2 = Timeline.from(5);
	let results3 = Timeline.from(TEMPLATE, LINK);

	assert(isTimeline(results1), false);
	assert(isTimeline(results2), true);
	assert(isTimeline(results3), true);

});

describe('Timeline.from()', function(assert) {

	assert(isFunction(Timeline.from), true);

	let timeline1 = Timeline.from(null);
	let timeline2 = Timeline.from(5);
	let timeline3 = Timeline.from(TEMPLATE, LINK);

	assert(timeline1, null);

	assert(timeline2.length,       5);
	assert(timeline2.data.length,  5);
	assert(timeline2.data[0],      null);
	assert(timeline2.data[1],      null);
	assert(timeline2.data[2],      null);
	assert(timeline2.data[3],      null);
	assert(timeline2.data[4],      null);
	assert(timeline2.stack.length, 5);
	assert(timeline2.start,        null);

	assert(timeline3.length,       3);
	assert(timeline3.data.length,  3);
	assert(timeline3.data[0],      null);
	assert(timeline3.data[1],      null);
	assert(timeline3.data[2],      null);
	assert(timeline3.stack.length, 3);
	assert(timeline3.start,        null);

});

describe('Timeline.prototype.toString()', function(assert) {

	let timeline = Timeline.from(TEMPLATE, LINK);

	assert(timeline.toString(),                      '[object Timeline]');
	assert(Object.prototype.toString.call(timeline), '[object Timeline]');

});

describe('Timeline.prototype.complete()', function(assert) {

	let timeline = Timeline.from(4);

	assert(timeline.start, null);
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

describe('Timeline.prototype.current()', function(assert) {

	let timeline = Timeline.from(4);

	assert(timeline.current(), 0);

	timeline.time();
	assert(timeline.current(), 0);

	timeline.time();
	assert(timeline.current(), 1);

	timeline.time();
	assert(timeline.current(), 2);

	timeline.time();
	assert(timeline.current(), 3);

	timeline.time();
	assert(timeline.current(), 4);

});

describe('Timeline.prototype.progress()', function(assert) {

	let timeline = Timeline.from(2);

	assert(timeline.progress(), 0);
	timeline.time();
	assert(timeline.progress(), 0);

	setTimeout(() => {
		assert(timeline.progress() >= 100);
		assert(timeline.progress() <= 100 + TOLERANCE);
	}, 100);

	setTimeout(() => {
		assert(timeline.progress() >= 200);
		assert(timeline.progress() <= 200 + TOLERANCE);
	}, 200);

	setTimeout(() => {
		assert(timeline.progress() >= 300);
		assert(timeline.progress() <= 300 + TOLERANCE);
	}, 300);

	setTimeout(() => {
		assert(timeline.progress() >= 400);
		assert(timeline.progress() <= 400 + TOLERANCE);
	}, 400);

	setTimeout(() => {
		assert(timeline.progress() >= 500);
		assert(timeline.progress() <= 500 + TOLERANCE);
	}, 500);

});

describe('Timeline.prototype.includes()', function(assert) {

	let timeline1 = Timeline.from(3);
	let timeline2 = Timeline.from(3);
	let timeline3 = Timeline.from(3);
	let timeline4 = Timeline.from(3);

	timeline1.data[0] = 13;
	timeline1.data[1] = 37;
	timeline1.data[2] = null;

	timeline2.data[0] = 13;
	timeline2.data[1] = 12;
	timeline2.data[2] = 37;

	timeline3.data[0] = 13;
	timeline3.data[1] = null;
	timeline3.data[2] = 13;

	timeline4.data[0] = 37;
	timeline4.data[1] = null;
	timeline4.data[2] = 37;

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

describe('Timeline.prototype.render()', function(assert) {

	let timeline1 = Timeline.from(3);
	let timeline2 = Timeline.from(3);
	let timeline3 = Timeline.from(3);
	let timeline4 = Timeline.from(3);
	let timeline5 = Timeline.from(3);
	let timeline6 = Timeline.from(0);

	timeline1.data[0] = 13;
	timeline1.data[1] = 37;
	timeline1.data[2] = null;

	timeline2.data[0] = 13;
	timeline2.data[1] = 12;
	timeline2.data[2] = 37;

	timeline3.data[0] = 13;
	timeline3.data[1] = 999;
	timeline3.data[2] = 3713;

	timeline4.data[0] = 37;
	timeline4.data[1] = null;
	timeline4.data[2] = 1337;

	timeline5.data[0] = 13;
	timeline5.data[1] = null;
	timeline5.data[2] = null;

	assert(timeline1.render(), '| 13ms| 37ms|  ?  |');
	assert(timeline2.render(), '| 13ms| 12ms| 37ms|');
	assert(timeline3.render(), '| 13ms|999ms|  4s |');
	assert(timeline4.render(), '| 37ms|  ?  |  1s |');
	assert(timeline5.render(), '| 13ms|  ?  |  ?  |');
	assert(timeline6.render(), '| no assert() calls |');

});

describe('Timeline.prototype.reset()', function(assert) {

	let timeline = Timeline.from(3);

	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);
	assert(timeline.start,   null);

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

		assert(timeline.data[0], null);
		assert(timeline.data[1], null);
		assert(timeline.data[2], null);
		assert(timeline.length,  3);
		assert(timeline.start,   null);

	}, 500);

});

describe('Timeline.prototype.time()', function(assert) {

	let timeline = Timeline.from(3);

	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);
	assert(timeline.start,   null);

	timeline.time();

	assert(timeline.data[0], null);
	assert(timeline.data[1], null);
	assert(timeline.data[2], null);
	assert(timeline.length,  3);
	assert(timeline.start,   Date.now());

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

		assert(timeline.data[0] >= 100);
		assert(timeline.data[0] < 100 + TOLERANCE);
		assert(timeline.data[1] >= 200);
		assert(timeline.data[1] < 200 + TOLERANCE);
		assert(timeline.data[2] >= 300);
		assert(timeline.data[2] < 300 + TOLERANCE);
		assert(timeline.length,  3);
		assert(timeline.start !== null);

	}, 500);

});


export default finish('covert/Timeline', {
	internet: false,
	network:  false
});


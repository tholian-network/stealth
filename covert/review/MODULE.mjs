
import { describe, finish } from '../../covert/index.mjs';
import COVERT               from '../../covert/index.mjs';



describe('MODULE', function(assert) {

	assert(typeof COVERT['Covert'],      'function');
	assert(typeof COVERT['ENVIRONMENT'], 'object');
	assert(typeof COVERT['Filesystem'],  'function');
	assert(typeof COVERT['Linter'],      'function');
	assert(typeof COVERT['Network'],     'function');
	assert(typeof COVERT['Renderer'],    'function');
	assert(typeof COVERT['Results'],     'function');
	assert(typeof COVERT['Review'],      'function');
	assert(typeof COVERT['Timeline'],    'function');

	assert(typeof COVERT['after'],    'function');
	assert(typeof COVERT['before'],   'function');
	assert(typeof COVERT['describe'], 'function');
	assert(typeof COVERT['finish'],   'function');

	assert(typeof COVERT['isCovert'],     'function');
	assert(typeof COVERT['isFilesystem'], 'function');
	assert(typeof COVERT['isLinter'],     'function');
	assert(typeof COVERT['isNetwork'],    'function');
	assert(typeof COVERT['isRenderer'],   'function');
	assert(typeof COVERT['isResults'],    'function');
	assert(typeof COVERT['isReview'],     'function');
	assert(typeof COVERT['isTimeline'],   'function');

	assert(Object.keys(COVERT), [

		'after',
		'before',
		'describe',
		'finish',

		'isCovert',
		'isFilesystem',
		'isLinter',
		'isNetwork',
		'isRenderer',
		'isResults',
		'isReview',
		'isTimeline',

		'Covert',
		'ENVIRONMENT',
		'Filesystem',
		'Linter',
		'Network',
		'Renderer',
		'Results',
		'Review',
		'Timeline'

	]);

});


export default finish('covert/MODULE', {
	internet: false,
	network:  false
});


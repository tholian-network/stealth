
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Task                            } from '../../../../stealth/source/server/service/Task.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Task()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.task instanceof Task, true);

});

describe('Task.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.task.toJSON), true);

	assert(this.server.services.task.toJSON(), {
		type: 'Task Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Task.isTask()', function(assert) {

	assert(isFunction(Task.isTask), true);

	assert(Task.isTask(null), false);
	assert(Task.isTask({}),   false);

	assert(Task.isTask({
		domain: 'example.com',
		tasks: [{
			url:    'https://example.com/index.html',
			action: 'download',
			start:  '2021-12-31 12:00:00',
			stop:   '2021-12-31 23:59:59',
			repeat: null
		}]
	}), true);
});

describe('Task.toTask()', function(assert) {

	assert(isFunction(Task.toTask), true);

	assert(Task.toTask(null), null);
	assert(Task.toTask({}),   null);

	assert(Task.toTask({
		domain: 'example.com',
		tasks:  []
	}), {
		domain: 'example.com',
		tasks:  []
	});

	assert(Task.toTask({
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/invalid.html',
			action: null,
			start:  '2021-12-31 12:00:00',
			stop:   '2021-12-31 23:59:59',
			repeat: 'minutely'
		}, {
			not: 'valid'
		}]
	}), {
		domain: 'example.com',
		tasks:  []
	});

	assert(Task.toTask({
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/some-page.html',
			action: 'download',
			start:  '2021-12-31 12:00:00',
			stop:   '2021-12-31 23:59:59',
			repeat: 'minutely'
		}, {
			not: 'valid'
		}]
	}), {
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/some-page.html',
			action: 'download',
			start:  '2021-12-31 12:00:00',
			stop:   '2021-12-31 23:59:59',
			repeat: 'minutely'
		}]
	});

	assert(Task.toTask({
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/index.html',
			action: 'download',
			start:  '2021-12-31 13:33:37',
			stop:   '2021-12-31 23:59:59',
			repeat: null
		}]
	}), {
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/index.html',
			action: 'download',
			start:  '2021-12-31 13:33:37',
			stop:   '2021-12-31 23:59:59',
			repeat: null
		}]
	});

});

describe('Task.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.task.save), true);

	this.server.services.task.save({
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/index.html',
			action: 'download',
			start:  '2021-12-31 13:33:37',
			stop:   '2021-12-31 23:59:59',
			repeat: 'hourly'
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'task',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Task.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.task.read), true);

	this.server.services.task.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'task',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				tasks:  [{
					url:    'https://example.com/index.html',
					action: 'download',
					start:  '2021-12-31 13:33:37',
					stop:   '2021-12-31 23:59:59',
					repeat: 'hourly'
				}]
			}
		});

	});

});

describe('Task.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.task.remove), true);

	this.server.services.task.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'task',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Task.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.task.read), true);

	this.server.services.task.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'task',
				event:   'read'
			},
			payload: null
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Task', {
	internet: false,
	network:  true
});


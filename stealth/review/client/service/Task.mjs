
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Task                                                         } from '../../../../stealth/source/client/service/Task.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Task()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.task instanceof Task, true);

});

describe('Task.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.task.toJSON), true);

	assert(this.client.services.task.toJSON(), {
		type: 'Task Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Task.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.task.save), true);

	this.client.services.task.save({
		domain: 'example.com',
		tasks:  [{
			url:    'https://example.com/index.html',
			action: 'download',
			start:  '2021-12-31 13:33:37',
			stop:   '2021-12-31 23:59:59',
			repeat: 'hourly'
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Task.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.task.read), true);

	this.client.services.task.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			tasks:  [{
				url:    'https://example.com/index.html',
				action: 'download',
				start:  '2021-12-31 13:33:37',
				stop:   '2021-12-31 23:59:59',
				repeat: 'hourly'
			}]
		});

	});

});

describe('Task.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.task.remove), true);

	this.client.services.task.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

describe('Task.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.task.read), true);

	this.client.services.task.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Task', {
	internet: false,
	network:  true
});


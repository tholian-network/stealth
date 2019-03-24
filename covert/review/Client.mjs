
import { after, before, describe, finish } from '../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from './Server.mjs';

import { Client } from '../../stealth/source/Client.mjs';



before(srv_connect);

export const connect = describe('client.connect', function(assert) {

	this.client = new Client();

	this.client.connect('localhost', 13337, (result) => {
		this.client.services['mockup'] = null;
		assert(result);
	});

});

describe('client.send/event', function(assert) {

	this.client.once('request', (request) => {
		assert(request.headers.service === 'mockup');
		assert(request.headers.event === 'event');
		assert(request.payload === 'payload');
	});

	this.client.send({
		headers: {
			service: 'mockup',
			event:   'event'
		},
		payload: 'payload'
	});

});

describe('client.send/method', function(assert) {

	this.client.once('request', (request) => {
		assert(request.headers.service === 'mockup');
		assert(request.headers.method === 'method');
		assert(request.payload === 'payload');
	});

	this.client.send({
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

export const disconnect = describe('client.disconnect', function(assert) {

	assert(this.client.disconnect());
	this.client = null;

});

after(srv_disconnect);


export default finish('Client');


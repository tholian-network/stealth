
import net      from 'net';
import { HTTP } from './protocol/HTTP.mjs';
import { WS   } from './protocol/WS.mjs';


const Stealth = function(data) {

	let settings = Object.assign({
		host:    'localhost',
		port:    65432,
		profile: '/tmp/stealth',
		root:    null
	}, data);


	this.host = settings.host;
	this.port = settings.port;
	this.root = settings.root;

	this.server    = null;
	this.protocols = {
		http: new HTTP(this),
		ws:   new WS(this)
	};


};


Stealth.prototype = {

	init: function() {

		if (this.server === null) {

			this.server = new net.Server({
				allowHalfOpen:  true,
				pauseOnConnect: true
			});

			this.server.on('connection', socket => {

				socket.on('data', blob => {

					let req = blob.toString('utf8');
					let raw = req.split('\n').map(line => line.trim());

					if (raw[0].includes('HTTP/1.1')) {

						let tmp    = raw[0].split(' ');
						let method = null;
						let url    = null;

						if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp[0])) {
							method = tmp[0];
						}

						if (tmp[1].startsWith('/')) {
							url = tmp[1];
						}

						if (method !== null && url !== null) {

							let headers = {};

							raw.slice(1).filter(line => line.trim() !== '').forEach(line => {

								let key = line.split(':')[0].trim().toLowerCase();
								let val = line.split(':').slice(1).join(':').trim();

								headers[key] = val;

							});

							if (
								headers['connection'] === 'upgrade'
								&& headers['upgrade'] === 'websocket'
								&& headers['sec-websocket-protocol'] === 'stealth-browser'
							) {

								this.protocols.ws.upgrade(socket, headers, result => {

									if (result === true) {

										socket.allowHalfOpen = true;
										socket.setTimeout(0);
										socket.setNoDelay(true);
										socket.setKeepAlive(true, 0);
										socket.removeAllListeners('timeout');

										socket.removeAllListeners('data');
										socket.on('data', blob => this.protocols.ws.receive(socket, blob));

									} else {
										socket.close();
									}

								});


								console.log('Socket need Upgrade to WebSocket protocol!');
								console.log(headers);

							} else {

								socket.allowHalfOpen = true;
								socket.setTimeout(0);
								socket.setNoDelay(true);
								socket.setKeepAlive(true, 0);
								socket.removeAllListeners('timeout');

								this.protocols.http.receive(socket, blob);

							}

						} else {

							socket.write('Sorry, telnet is not allowed.');
							socket.end();

						}

					}

				});

				socket.on('error',   _ => {});
				socket.on('close',   _ => {});
				socket.on('timeout', _ => socket.close());

				socket.resume();

			});

			this.server.on('error', _ => this.server.close());
			this.server.on('close', _ => {});


			console.log('Stealth Service listening on http://' + this.host + ':' + this.port);
			this.server.listen(this.port, this.host === 'localhost' ? null : this.host);

		}

	}

};


export { Stealth };


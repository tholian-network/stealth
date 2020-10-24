
## Covert Guide

The Usage is documented in Covert's [README.md](/covert/README.md) file.


## Architecture

The [Covert](/covert/source) Project is a standalone Testrunner that runs in
`node.js` version `12+` and uses `ECMAScript imports` without transpilation to
guarantee identical behaviour when it comes to API tests or Integration tests.

- A [Review](/covet/source/Review.mjs) is a set of tests, including preparation (`before`) and cleanup (`after`) helpers.
- Each Implementation in `/source/...mjs` has a Review located at `/review/...mjs`.

Covert is able to watch for filesystem changes (see Usage of `watch`) and can
re-execute Review(s) when the Implementation has changed.


## Execution Process

The [covert/make.mjs](/covert/make.mjs) builds Covert.

As Covert also includes peer-to-peer tests for end-to-end network services, it
requires the host machine to be reachable under at least two different IPs.

If the host machine has no internet connection, some network-related tests
will fail, such as
[stealth/connection/DNS](/stealth/review/connection/DNS.mjs),
[stealth/connection/HTTPS](/stealth/review/connection/HTTPS.mjs),
[stealth/connection/HTTP](/stealth/review/connection/HTTP.mjs),
or [stealth/client/Host](/stealth/review/client/Host.mjs).

As the only failsafe way to do this (without requiring two network cards or
WAN/LAN connections), there's the requirement to reach the local machine
via the IPs `127.0.0.1`, `127.0.0.2` and `127.0.0.3`.

**MacOS**

On MacOS it is necessary to create an alias for the loopback interface
before Covert itself can be run. Covert automatically creates an alias
for above mentioned additional IPs on MacOS and will ask for your
`sudo` password in order to be able to do so.

Currently there's no way to simulate slower network connections as there's
no `netem` nor `tc` available on Darwin-based systems, so the `--network`
flag has no effect on MacOS and should not be used.


## Reviews

Multiple Example Reviews are available in these folders:

- [base/review](/base/review)
- [covert/review](/covert/review)
- [stealth/review](/stealth/review)


Codestyle Rules (Assumptions) of a Review:

- All Reviews (in `/review/*`) have to use `ES Modules` syntax.
- All Sources (in `/source/*`) have to use `ES Modules` syntax.
- Reviews can have multiple `before()` entries for preparation.
- Reviews can have multiple `after()` entries for cleanup.
- Reviews can have multiple stateless `describe()` entries.
- Reviews need to `export default` via `finish('library/namespace/Identifier')` to ensure ES Modules compatibility.
- `assert()` calls have to be in a separate line.
- `assert()` calls have to be branch-less, surrounding `if/elseif/else` conditions are not allowed.


Exports of the Review Folder (`/library/review/index.mjs`):

The `index.mjs` of any Review Folder has to export the following properties as a `default` export:

- `(Array) reviews[]` that contains all imported reviews.
- `(Object) sources{}` that contains a Source-to-Review map that allows overriding
   which Review has to reflect what Implementation.

```javascript
// Example index.mjs file

// imports of /review/*.mjs
import Foo from './Foo.mjs';
import Bar from './Bar.mjs';
import Doo from './network/Doo.mjs';


// Review ids are consistent with paths.
// Foo.id = 'my-project/Foo'
// Bar.id = 'my-project/Bar'
// Doo.id = 'my-project/network/Doo'


export default {

	reviews: [

		Foo,
		Bar,
		Doo

	],

	sources: {

		// The Bar review has two implementations,
		// one for node and one for the browser

		'browser/Bar': 'Bar',
		'node/Bar':    'Bar',

		// The Bar review should test the following ES Module
		// that is located at my-project/source/node/Bar.mjs
		// (Note that polyfills can be tested this way)

		'Bar':         'node/Bar',

		// Qux does not need to be tested

		'Qux': null

	}

};
```


**Example Review**:

```javascript
import { before, after, describe, finish } from '../../../covert/index.mjs';
import { Example                         } from '../../../library/source/namespace/Example.mjs';



before('prepare stuff', function(assert) {

	this.example = new Example();

	assert(this.example !== null);

	this.example.on('event', () => {
		assert(true);
	});

});

describe('simple test', function(assert) {

	assert(this.example !== null);
	assert(this.example.method(), true);

	this.example.async((response) => {
		assert(response, { foo: 'bar' });
	});

	assert(this.example.link, 'https://example.com/index.html');

});

describe('debug test', function(assert, console) {

	// This can be used with covert scan <Example> --debug=true

	console.info('This is an info');
	console.warn(this.example);
	console.error('console is integrated');
	console.blink('console is also sandboxed');

});

after('cleanup stuff', function(assert) {

	this.example.on('destroy', () => {
		assert(true);
	});

	this.example.destroy();
	this.example = null;

});


// /library/source/namespace/Example.mjs is the Source Code
// /library/review/namespace/Example.mjs is this Review

export default finish('library/namespace/Example');
```


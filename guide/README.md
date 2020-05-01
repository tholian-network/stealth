
# Developer Guide

This Guide is intended as a reference document for both the concept and architecture,
and their documentation of implementations.

The idea is that this guide helps developers to implement their own Browser Frontend
(or Client or Peer) that can reuse the Stealth Service and its provided APIs.

Currently, the Repository consists of these important folders:

- [Base](/base) is a Library (`BASE.mjs`) containing Polyfills for both the Browser and Stealth.
- [Browser](/browser) is the Web-Based Frontend for Stealth that can be used as a Progressive Web App.
- [Covert](/covert) is the Test Runner.
- [Stealth](/stealth) is the Stealth Service (that runs in node.js).


# Guide Contents

- [README.md](./README.md) is this file.
- [concept/Browser.md](./concept/Browser.md) explains the Browser and Browser UI.
- [concept/Covert.md](./concept/Covert.md) explains the Covert Testrunner.
- [concept/Stealth.md](./concept/Stealth.md) explains the Stealth Service.
- [concept/Service.md](./concept/Service.md) explains the Stealth Service API.

- [service/Cache.md](./service/Cache.md) explains the `cache` Service API.
- [service/Host.md](./service/Host.md) explains the `host` Service API.
- [service/Mode.md](./service/Mode.md) explains the `mode` Service API.
- [service/Peer.md](./service/Peer.md) explains the `peer` Service API.
- [service/Redirect.md](./service/Redirect.md) explains the `redirect` Service API.
- [service/Session.md](./service/Session.md) explains the `session` Service API.
- [service/Settings.md](./service/Settings.md) explains the `settings` Service API.
- [service/Stash.md](./service/Stash.md) explains the `stash` Service API.


# Implementation Examples

Each Project has a `/review` folder which contains Reviews for the Covert Testrunner.
The idea behind a `Review` is the complete audit-by-example of the equivalent implementation
in the `/source` folder.

For example, the [/stealth/review/Request.mjs](/stealth/review/Request.mjs) reviews the
[/stealth/source/Request.mjs](/stealth/source/Request.mjs) implementation and it can be
run directly with `covert scan stealth/Request`.

The Usage of `Covert` is documented in the Covert's [README.md](/covert/README.md) file.


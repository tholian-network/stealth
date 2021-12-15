
# Developer Guide

This Guide is intended as a reference document for both the concept and architecture,
and their documentation of implementations.

The idea is that this guide helps developers to implement their own Browser Frontend
(or Client or Peer) that can reuse the Stealth Service and its provided APIs.

Currently, the Repository consists of these important folders:

- [Base](/base) is a Library that contains Polyfills for Browser, Covert and Stealth.
- [Browser](/browser) is the Web-based Frontend for Stealth that can be used as a Progressive Web App.
- [Covert](/covert) is the Test Runner.
- [Profile](/profile) is the Tholian Vendor Profile.
- [Stealth](/stealth) is the Stealth Service (that runs in node.js).


# Guide Contents

- [README.md](./README.md) is this file.
- [security/Network.md](./security/Network.md) contains the Network Security guide and explains potential Attack Vectors.
- [security/Site.md](./security/Site.md) contains the Site Security guide and explains potential Attack Vectors.
- [concept/Browser.md](./concept/Browser.md) explains the Browser and Browser UI.
- [concept/Covert.md](./concept/Covert.md) explains the Covert Testrunner.
- [concept/Stealth.md](./concept/Stealth.md) explains the Stealth Service.
- [concept/Service.md](./concept/Service.md) explains the Stealth Service API.
- [concept/Network.md](./concept/Network.md) explains Network Topology and Service Discovery Workflows.


# Implementation Notes

- [implementation/Parser.md](./implementation/Parser.md) documents parser implementation quirks and differences.


# Implementation Examples

Each Project has a `/review` folder which contains Reviews for Covert. The idea behind a
`Review` is the complete audit-by-example of the equivalent implementation in the `/source`
folder.

For example, the [/stealth/review/Request.mjs](/stealth/review/Request.mjs) reviews the
[/stealth/source/Request.mjs](/stealth/source/Request.mjs) implementation and it can be
run directly with `covert scan stealth/Request`.

The Usage of `Covert` is documented in the Covert's [README.md](/covert/README.md) file.


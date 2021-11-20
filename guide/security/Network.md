
# Network Security Guide

The Stealth Service allows to relay traffic with multiple mechanisms,
and allows to share network connections with its Peers in a local
manner and/or global manner, so it's hard to get a hold of it in terms
of networked state complexity or whether or not it can be abused to
identify an end-user uniquely.

Every Stealth Service also contains:

- A SOCKS Proxy running on port `65432`.
- An HTTP/S Proxy (that supports `CONNECT` and `GET`) on port `65432`.
- A Webserver that serves the Browser UI at port `65432` and path `/browser/*`.
- Websocket Services that serve the peer-to-peer API on port `65432`.
- A Multicast DNS-SD Service that interacts with other local Stealth peers on port `5353`.
- A DNS Router that observes and caches DNS requests in the network from Stealth peer on port `65432`.


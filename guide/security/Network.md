
# Network Security Guide

(This Document is Work in Progress)

The Stealth Service allows to relay traffic with multiple mechanisms,
and allows to share network connections with its Peers in a local
manner and/or global manner, so it's hard to get a hold of it in terms
of networked state complexity or whether or not it can be abused to
identify an end-user uniquely.

Every Stealth Service also contains:

- An HTTP/S Proxy (that supports `CONNECT` and `GET`) on port `65432`.
- A Webserver that serves the Browser UI at port `65432` and path `/browser/*`.
- A Websocket Services that serves the Peer-to-Peer API on port `65432`.
- A Multicast DNS-SD Service that interacts with other local Stealth Peers on port `5353`.
- A DNS Router that can resolve DNS Requests for other Peers on port `65432`.
- A SOCKS Proxy running on port `65432`.


## Attack Vector: TCP/UDP Manipulation

## Attack Vector: TCP/UDP Fingerprinting

## Attack Vector: NAT Blocking

## Attack Vector: DHT / Radar Access Blocking

## Attack Vector: DNS Manipulation

## Attack Vector: DNS Tracking

## Attack Vector: HTTP Downgrade Attack

## Attack Vector: TLS Downgrade Attack(s)

## Attack Vector: TLS Timing/Side-Channel Attack(s)

## Attack Vector: HTTP/S Traffic Correlation Tracking

## Attack Vector: Multicast DNS-SD Manipulation

## Attack Vector: Multicast DNS-SD Tracking


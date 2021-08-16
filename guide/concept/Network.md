
# Network Topology and Service Discovery

The Tholian Network operates the `tholian.network` domain,
which allows us to create certificates for each username.

In the following examples, `alice` and `bob` try to communicate, each
owning their local TLS certificate in the Stealth Profile folder.


## Offline Discovery

[DNS-based Service Discovery](https://dns-sd.org), otherwise known as
Bonjour or Zeroconf networking allows each Stealth instance to discover
other peers locally.

Multicast DNS interaction is compatible with DNS-SD and operates on the
multicast addresses `244.0.0.251` and `ff02::fb` on port `5353` and,
as all other Stealth Service APIs, also on port `65432`.

- Alice started her Stealth Browser and it tries to find other Peers.
- Alice's Stealth Browser sends out a `PTR` question for `_stealth._wss.tholian.local` and `_stealth._ws.tholian.local` via Multicast DNS.
- Bob's Stealth Browser answers with a `PTR` entry pointing to `bob.tholian.local`, and additionally sends his local IPs (`A` and `AAAA`) and a service descriptor (`SRV`).
- Bob's response also contained a `TXT` entry with the Stealth Browser version and the public `bob.tholian.local` TLS certificate.
- Alice's Stealth Browser listened to the Multicast DNS address and discovered Bob's Stealth Browser successfully.
- Alice can now ask Bob whether he wants to add her as a Trusted Peer.
- If Bob confirms Alice as a Peer, both will have themselves as Trusted Peers, with their pinned TLS certificates.


## Online Discovery

The Radar Service APIs are compatible with the Stealth Service APIs,
so Radar instances can also be used as a `TURN` server to discover
other peers.

DNS interaction with the Radar Service operates on the domain
`radar.tholian.network` on port `65432`.

- Alice wants to go online and changes the Internet Setting in her Stealth Browser to Broadband or Mobile.
- Alice's Stealth Browser sends out a `SRV` question for `_stealth._wss.tholian.network` via DNS.
- Radar Service replies with a service descriptor (`SRV`).
- Alice's Stealth Browser connects to the Radar Service via a `WS/13` Connection and asks for Peers.
- Radar Service replies with a list of Peers, which come presorted for Alice.
- Alice can now share her Browser Cache with other Peers, if she chooses to add them as Trusted Peers.

An important side note:

Radar Service maintains a list of active Online Peers that might or might not have a working ISP that
allows them to reach the Internet. Peers are therefore presorted so that e.g. Alice receives Peers
that are not only inside her ISP's NAT, but which are also from other ISPs in her country and from
other countries as well. This guarantees that Alice can always at least use one type of Peer in order
to avoid censorship and MITM blocking of websites.


## Peer-to-Peer Topologies

Peers are categorized in different types, in order to be able to guarantee that Peers can always find
other Peers; even when their ISP is blocking (almost) all ways to communicate with the Internet.

If the ISP offers end-to-end IPv6 with a `global` scope, PWNAT is enough to fully to break out of NAT
restrictions. This was tested and confirmed with `1und1`, `kabelbw`, `telefonica/o2`, `t-mobile DE/CH/US`,
`t-online`, and `vodafone` as internet providers. The likeliness of IPv6 support is higher with mobile
carrier-grade NATs, so it's recommended to try out a mobile SIM as a gateway if your cable ISP doesn't
provide IPv6 support.


The Radar Service's `Peer` API categorizes suitable Peers by the following criteria:

- Same ISP, same NAT
- Same ISP, different NAT
- Different ISP, same country
- Different ISP, different country


As some NATs might not want to cooperate in above explained scenarios, Stealth Browser instances transparently
switch between these network protocols:

- `SOCKS` Connection to relay connections via other locally or globally reachable Peers.
- `WS` Connection as the primary Service API communication protocol.

- `WS` Connection to encapsulate other protocols via `binary` frames.
- `DNS` Connection to encapsulate other protocols via `TXT` frames.
- `ICMP` Connection to encapsulate other protocols by using the PWNAT technique to break out of NATs.


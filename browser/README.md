
# Architecture

TBD


# Work in Progress / TODO

- Buffer data type with `serialize()` method, which is
  used for raw data when no text document was loaded
  via WebSocket.

- Buffer.type should reflect all MIME types correctly,
  for example 'image/x-icon' as binary and 'text/html'
  as text-decodeable content.

- Peer.prototype.load should call `/api/load` or similar
  behind the scenes. The result has a `result.buffer`
  property that reflects the buffer instance.



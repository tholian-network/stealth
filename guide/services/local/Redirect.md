
# Redirect Service

The Redirect Service is a local service that provides the
correct redirect headers and payload that HTTP clients can
understand.

It is compliant with [RFC 7231](https://tools.ietf.org/html/rfc7231.html).

## get()

`get({ code: Number, path: String }, callback)`

returns the `headers` and `payload` for the redirect.

```javascript
// get(payload) example
{
	code: 307,
	path: '/redirect/to/this/path.html'
}
```


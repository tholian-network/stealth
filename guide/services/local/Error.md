
# Error Service

The Error Service is a local service that provides status code
conversions into messages that HTTP clients can understand.

It is compliant with [RFC 7231](https://tools.ietf.org/html/rfc7231.html).

## get()

`get({ code: Number }, callback)`

returns the `headers` and `payload` for the error.

```javascript
// get(payload) example
{
	code: 404
}
```


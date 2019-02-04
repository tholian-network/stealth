
# File Service

The File Service is a local service that provides access to
both `browser` internal and `stealth` internal assets on the
hard drive that are necessary to load the `Stealth Browser`
and serve the `/browser/index.html` and its dependencies
correctly.

## read()

`read({ path: String }, callback)`

reads the file from the Stealth `root` folder.

```javascript
// read(payload) example
{
	path: '/browser/index.html'
}
```


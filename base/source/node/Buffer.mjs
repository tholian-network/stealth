
export const Buffer = (function(global) {
	return global.Buffer;
})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

export const isBuffer = Buffer.isBuffer;


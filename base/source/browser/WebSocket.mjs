
export const WebSocket = (function(global) {
	return global.WebSocket;
})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));



if (typeof Array.isArray !== 'function') {

	Array.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

}

if (typeof Function.isFunction !== 'function') {

	Function.isFunction = function(fun) {
		return Object.prototype.toString.call(fun) === '[object Function]';
	};

}

if (typeof Number.isNumber !== 'function') {

	Number.isNumber = function(num) {
		return Object.prototype.toString.call(num) === '[object Number]';
	};

}

if (typeof Object.isObject !== 'function') {

	Object.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

}

if (typeof RegExp.isRegExp !== 'function') {

	RegExp.isRegExp = function(reg) {
		return Object.prototype.toString.call(reg) === '[object RegExp]';
	};

}

if (typeof String.isString !== 'function') {

	String.isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	};

}

export const POLYFILLS = {
	isArray:    Array.isArray,
	isFunction: Function.isFunction,
	isNumber:   Number.isNumber,
	isObject:   Object.isObject,
	isRegExp:   RegExp.isRegExp,
	isString:   String.isString
};


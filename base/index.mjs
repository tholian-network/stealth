
import {
	console,
	Array,
	Boolean,
	Buffer,
	Date,
	Emitter,
	Function,
	Map,
	Number,
	Object,
	RegExp,
	Set,
	String
} from './build/node.mjs';

export {
	console,
	Array,    isArray,
	Boolean,  isBoolean,
	Buffer,   isBuffer,
	Date,     isDate,
	Emitter,  isEmitter,
	Function, isFunction,
	Map,      isMap,
	Number,   isNumber,
	Object,   isObject,
	RegExp,   isRegExp,
	Set,      isSet,
	String,   isString
} from './build/node.mjs';



export default {

	console:    console,

	Array:      Array,
	Boolean:    Boolean,
	Buffer:     Buffer,
	Date:       Date,
	Emitter:    Emitter,
	Function:   Function,
	Map:        Map,
	Number:     Number,
	Object:     Object,
	RegExp:     RegExp,
	Set:        Set,
	String:     String,

	isArray:    Array.isArray,
	isBoolean:  Boolean.isBoolean,
	isBuffer:   Buffer.isBuffer,
	isDate:     Date.isDate,
	isEmitter:  Emitter.isEmitter,
	isFunction: Function.isFunction,
	isMap:      Map.isMap,
	isNumber:   Number.isNumber,
	isObject:   Object.isObject,
	isRegExp:   RegExp.isRegExp,
	isSet:      Set.isSet,
	isString:   String.isString

};


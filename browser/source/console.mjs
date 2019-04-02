
const _console = window.console;

export const clear = _console.clear;
export const log   = _console.log;
export const info  = _console.info;
export const pace  = _console.log;
export const warn  = _console.warn;
export const error = _console.error;

export const console = {
	clear: clear,
	error: error,
	info:  info,
	log:   log,
	pace:  pace,
	warn:  warn
};

export default console;



import { isArray, isDate, isNumber, isObject, isString } from '../../extern/base.mjs';


const GREGORIAN = {
	1:  31, 2:  28, 3:  31,
	4:  30, 5:  31, 6:  30,
	7:  31, 8:  31, 9:  30,
	10: 31, 11: 30, 12: 31
};

const isIMF = function(str) {

	if (isString(str) === true) {

		let tmp      = str.split(' ');
		let weekday  = tmp[0] || '';
		let day      = tmp[1] || '';
		let month    = tmp[2] || '';
		let year     = tmp[3] || '';
		let time     = tmp[4] || '';
		let timezone = tmp[5] || '';

		if (
			/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),$/g.test(weekday) === true
			&& /^([0-9]{2})$/g.test(day) === true
			&& /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/g.test(month) === true
			&& /^([0-9]{4})$/g.test(year) === true
			&& /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/g.test(time) === true
			&& timezone === 'GMT'
		) {
			return true;
		}

	}


	return false;

};

const toDays = (year, month) => {

	let is_leap_year = false;

	if (year % 4 !== 0) {
		is_leap_year = false;
	} else if (year % 100 !== 0) {
		is_leap_year = true;
	} else if (year % 400 !== 0) {
		is_leap_year = false;
	} else {
		is_leap_year = true;
	}

	if (is_leap_year === true && month === 2) {
		return GREGORIAN[month] + 1;
	} else {
		return GREGORIAN[month];
	}

};

const format = (str, length) => {

	if (str.length < length) {
		return new Array(length - str.length).fill('0').join('') + str;
	}

	return str;

};

const render_date = function(date) {

	let str = '';

	str += date.year;
	str += '-';
	str += format('' + date.month, 2);
	str += '-';
	str += format('' + date.day, 2);

	return str;

};

const render_time = function(time) {

	let str = '';

	str += format('' + time.hour, 2);
	str += ':';
	str += format('' + time.minute, 2);
	str += ':';
	str += format('' + time.second, 2);

	return str;

};



const DATETIME = {

	compare: function(a, b) {

		let is_datetime_a = DATETIME.isDATETIME(a) === true || DATETIME.isDate(a) === true || DATETIME.isTime(a) === true;
		let is_datetime_b = DATETIME.isDATETIME(b) === true || DATETIME.isDate(b) === true || DATETIME.isTime(b) === true;

		if (is_datetime_a === true && is_datetime_b === true) {

			if (a.year !== null && b.year !== null) {

				if (a.year < b.year) return -1;
				if (a.year > b.year) return 1;

			} else if (a.year !== null) {
				return -1;
			} else if (b.year !== null) {
				return 1;
			}

			if (a.month !== null && b.month !== null) {

				if (a.month < b.month) return -1;
				if (a.month > b.month) return 1;

			} else if (a.month !== null) {
				return -1;
			} else if (b.month !== null) {
				return 1;
			}

			if (a.day !== null && b.day !== null) {

				if (a.day < b.day) return -1;
				if (a.day > b.day) return 1;

			} else if (a.day !== null) {
				return -1;
			} else if (b.day !== null) {
				return 1;
			}

			if (a.hour !== null && b.hour !== null) {

				if (a.hour < b.hour) return -1;
				if (a.hour > b.hour) return 1;

			} else if (a.hour !== null) {
				return -1;
			} else if (b.hour !== null) {
				return 1;
			}

			if (a.minute !== null && b.minute !== null) {

				if (a.minute < b.minute) return -1;
				if (a.minute > b.minute) return 1;

			} else if (a.minute !== null) {
				return -1;
			} else if (b.minute !== null) {
				return 1;
			}

			if (a.second !== null && b.second !== null) {

				if (a.second < b.second) return -1;
				if (a.second > b.second) return 1;

			} else if (a.second !== null) {
				return -1;
			} else if (b.second !== null) {
				return 1;
			}

			return 0;

		} else if (is_datetime_a === true) {
			return -1;
		} else if (is_datetime_b === true) {
			return 1;
		}


		return 0;

	},

	isDate: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			if (
				isNumber(payload.year) === true
				&& payload.year >= 0
				&& isNumber(payload.month) === true
				&& payload.month >= 1
				&& payload.month <= 12
				&& isNumber(payload.day) === true
				&& payload.hour === null
				&& payload.minute === null
				&& payload.second === null
			) {

				let max_days = toDays(payload.year, payload.month);
				if (payload.day >= 1 && payload.day <= max_days) {
					return true;
				}

			}

		}


		return false;

	},

	isDATETIME: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			if (
				isNumber(payload.year) === true
				&& payload.year >= 0
				&& isNumber(payload.month) === true
				&& payload.month >= 1
				&& payload.month <= 12
				&& isNumber(payload.day) === true
				&& isNumber(payload.hour) === true
				&& payload.hour >= 0
				&& payload.hour <= 23
				&& isNumber(payload.minute) === true
				&& payload.minute >= 0
				&& payload.minute <= 59
				&& isNumber(payload.second) === true
				&& payload.second >= 0
				&& payload.second <= 59
			) {

				let max_days = toDays(payload.year, payload.month);
				if (payload.day >= 1 && payload.day <= max_days) {
					return true;
				}

			}

		}


		return false;

	},

	isTime: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			if (
				payload.year === null
				&& payload.month === null
				&& payload.day === null
				&& isNumber(payload.hour) === true
				&& payload.hour >= 0
				&& payload.hour <= 23
				&& isNumber(payload.minute) === true
				&& payload.minute >= 0
				&& payload.minute <= 59
				&& isNumber(payload.second) === true
				&& payload.second >= 0
				&& payload.second <= 59
			) {
				return true;
			}

		}


		return false;

	},

	parse: function(date_or_num_or_str) {

		let year   = null;
		let month  = null;
		let day    = null;
		let hour   = null;
		let minute = null;
		let second = null;


		if (isDate(date_or_num_or_str) === true) {

			year   = date_or_num_or_str.getUTCFullYear();
			month  = date_or_num_or_str.getUTCMonth() + 1;
			day    = date_or_num_or_str.getUTCDate();
			hour   = date_or_num_or_str.getUTCHours();
			minute = date_or_num_or_str.getUTCMinutes();
			second = date_or_num_or_str.getUTCSeconds();

		} else if (
			isString(date_or_num_or_str) === true
			&& date_or_num_or_str.includes('T') === true
			&& date_or_num_or_str.endsWith('Z') === true
		) {

			let date = new Date(date_or_num_or_str);

			year   = date.getUTCFullYear();
			month  = date.getUTCMonth() + 1;
			day    = date.getUTCDate();
			hour   = date.getUTCHours();
			minute = date.getUTCMinutes();
			second = date.getUTCSeconds();

		} else if (isIMF(date_or_num_or_str) === true) {

			let date = new Date(date_or_num_or_str);

			year   = date.getUTCFullYear();
			month  = date.getUTCMonth() + 1;
			day    = date.getUTCDate();
			hour   = date.getUTCHours();
			minute = date.getUTCMinutes();
			second = date.getUTCSeconds();

		} else if (isString(date_or_num_or_str) === true) {

			if (/^([0-9]{2}):([0-9]{2}):([0-9]{2})$/g.test(date_or_num_or_str) === true) {

				let tmp_hour   = parseInt(date_or_num_or_str.split(':')[0], 10);
				let tmp_minute = parseInt(date_or_num_or_str.split(':')[1], 10);
				let tmp_second = parseInt(date_or_num_or_str.split(':')[2], 10);

				if (
					Number.isNaN(tmp_hour) === false
					&& tmp_hour >= 0
					&& tmp_hour <= 23
				) {
					hour = tmp_hour;
				}

				if (
					Number.isNaN(tmp_minute) === false
					&& tmp_minute >= 0
					&& tmp_minute <= 59
				) {
					minute = tmp_minute;
				}

				if (
					Number.isNaN(tmp_second) === false
					&& tmp_second >= 0
					&& tmp_second <= 59
				) {
					second = tmp_second;
				}

			} else if (/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/g.test(date_or_num_or_str) === true) {

				let tmp_year  = parseInt(date_or_num_or_str.split('-')[0], 10);
				let tmp_month = parseInt(date_or_num_or_str.split('-')[1], 10);
				let tmp_day   = parseInt(date_or_num_or_str.split('-')[2], 10);

				if (
					Number.isNaN(tmp_year) === false
					&& tmp_year >= 0
				) {
					year = tmp_year;
				}

				if (
					Number.isNaN(tmp_month) === false
					&& tmp_month >= 1
					&& tmp_month <= 12
				) {
					month = tmp_month;
				}

				if (
					Number.isNaN(tmp_day) === false
					&& tmp_day >= 1
					&& tmp_day <= 31
				) {
					day = tmp_day;
				}

			} else if (/^([0-9]{8})$/g.test(date_or_num_or_str) === true) {

				let tmp_year  = parseInt(date_or_num_or_str.substr(0, 4), 10);
				let tmp_month = parseInt(date_or_num_or_str.substr(4, 2), 10);
				let tmp_day   = parseInt(date_or_num_or_str.substr(6, 2), 10);

				if (
					Number.isNaN(tmp_year) === false
					&& tmp_year >= 0
				) {
					year = tmp_year;
				}

				if (
					Number.isNaN(tmp_month) === false
					&& tmp_month >= 1
					&& tmp_month <= 12
				) {
					month = tmp_month;
				}

				if (
					Number.isNaN(tmp_day) === false
					&& tmp_day >= 1
					&& tmp_day <= 31
				) {
					day = tmp_day;
				}

			} else if (/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})$/g.test(date_or_num_or_str) === true) {

				let tmp_day   = parseInt(date_or_num_or_str.split('.')[0], 10);
				let tmp_month = parseInt(date_or_num_or_str.split('.')[1], 10);
				let tmp_year  = parseInt(date_or_num_or_str.split('.')[2], 10);

				if (
					Number.isNaN(tmp_year) === false
					&& tmp_year >= 0
				) {
					year = tmp_year;
				}

				if (
					Number.isNaN(tmp_month) === false
					&& tmp_month >= 1
					&& tmp_month <= 12
				) {
					month = tmp_month;
				}

				if (
					Number.isNaN(tmp_day) === false
					&& tmp_day >= 1
					&& tmp_day <= 31
				) {
					day = tmp_day;
				}

			} else if (date_or_num_or_str.trim().includes(' ') === true) {

				let tmp_date = DATETIME.parse(date_or_num_or_str.trim().split(' ').shift());
				let tmp_time = DATETIME.parse(date_or_num_or_str.trim().split(' ').pop());


				if (
					isNumber(tmp_date.year) === true
					&& tmp_date.year >= 0
				) {
					year = tmp_date.year;
				}

				if (
					isNumber(tmp_date.month) === true
					&& tmp_date.month >= 1
					&& tmp_date.month <= 12
				) {
					month = tmp_date.month;
				}

				if (
					isNumber(tmp_date.day) === true
					&& tmp_date.day >= 1
					&& tmp_date.day <= 31
				) {
					day = tmp_date.day;
				}

				if (
					isNumber(tmp_time.hour) === true
					&& tmp_time.hour >= 0
					&& tmp_time.hour <= 23
				) {
					hour = tmp_time.hour;
				}

				if (
					isNumber(tmp_time.minute) === true
					&& tmp_time.minute >= 0
					&& tmp_time.minute <= 59
				) {
					minute = tmp_time.minute;
				}

				if (
					isNumber(tmp_time.second) === true
					&& tmp_time.second >= 0
					&& tmp_time.second <= 59
				) {
					second = tmp_time.second;
				}

			}

		}


		return {
			year:   year,
			month:  month,
			day:    day,
			hour:   hour,
			minute: minute,
			second: second
		};

	},

	render: function(datetime) {

		datetime = isObject(datetime) ? datetime: null;


		if (datetime !== null) {

			if (DATETIME.isDATETIME(datetime) === true) {
				return render_date(datetime) + ' ' + render_time(datetime);
			} else if (DATETIME.isDate(datetime) === true) {
				return render_date(datetime);
			} else if (DATETIME.isTime(datetime) === true) {
				return render_time(datetime);
			}

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((datetime) => {
				return (
					DATETIME.isDATETIME(datetime) === true
					|| DATETIME.isDate(datetime) === true
					|| DATETIME.isTime(datetime) === true
				);
			}).sort((a, b) => {
				return DATETIME.compare(a, b);
			});

		}


		return [];

	},

	toIMF: function(datetime) {

		datetime = (DATETIME.isDATETIME(datetime) || DATETIME.isDate(datetime)) ? datetime : null;


		if (datetime !== null) {
			return new Date(render_date(datetime) + 'T' + render_time(datetime) + 'Z').toGMTString();
		}

		return null;

	},

	toDate: function(datetime) {

		datetime = (DATETIME.isDATETIME(datetime) || DATETIME.isDate(datetime)) ? datetime : null;


		if (datetime !== null) {

			return {
				year:   datetime.year,
				month:  datetime.month,
				day:    datetime.day,
				hour:   null,
				minute: null,
				second: null
			};

		}


		return null;

	},

	toTime: function(datetime) {

		datetime = (DATETIME.isDATETIME(datetime) || DATETIME.isTime(datetime)) ? datetime : null;


		if (datetime !== null) {

			return {
				year:   null,
				month:  null,
				day:    null,
				hour:   datetime.hour,
				minute: datetime.minute,
				second: datetime.second
			};

		}


		return null;

	}

};


export { DATETIME };


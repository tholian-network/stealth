
import dgram from 'dgram';

import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { DNS                } from '../../../stealth/source/connection/DNS.mjs';
import { IP                 } from '../../../stealth/source/parser/IP.mjs';
import { URL                } from '../../../stealth/source/parser/URL.mjs';



const PAYLOADS = {

	'A': {

		'REQUEST': Buffer.from([
			0x96, 0x9a, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08, 0x97, 0xc2, 0xbd, 0x6d,
			0xfe, 0x48, 0xb9, 0x31
		]),

		'RESPONSE': Buffer.from([
			0x96, 0x9a, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x01, 0x00, 0x01, 0xc0, 0x0c, 0x00,
			0x01, 0x00, 0x01, 0x00, 0x00, 0xfd, 0xd7, 0x00,
			0x04, 0x5d, 0xb8, 0xd8, 0x22, 0x00, 0x00, 0x29,
			0x04, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1c,
			0x00, 0x0a, 0x00, 0x18, 0x97, 0xc2, 0xbd, 0x6d,
			0xfe, 0x48, 0xb9, 0x31, 0x98, 0xe6, 0x7c, 0x76,
			0x60, 0x5f, 0x63, 0x38, 0x91, 0xc4, 0x11, 0xa9,
			0xcb, 0x8c, 0x3b, 0x5f
		])

	},

	'AAAA': {

		'REQUEST': Buffer.from([
			0x68, 0xbf, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x1c, 0x00, 0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08, 0xce, 0x2b, 0x43, 0x6f,
			0xf4, 0x93, 0x6f, 0x32
		]),

		'RESPONSE': Buffer.from([
			0x68, 0xbf, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x1c, 0x00, 0x01, 0xc0, 0x0c, 0x00,
			0x1c, 0x00, 0x01, 0x00, 0x00, 0xe0, 0xf9, 0x00,
			0x10, 0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00,
			0x01, 0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19,
			0x46, 0x00, 0x00, 0x29, 0x04, 0xd0, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x1c, 0x00, 0x0a, 0x00, 0x18,
			0xce, 0x2b, 0x43, 0x6f, 0xf4, 0x93, 0x6f, 0x32,
			0xc0, 0xe0, 0x51, 0xac, 0x60, 0x5f, 0x62, 0xb5,
			0x9b, 0xb2, 0x3c, 0xb1, 0xcb, 0xae, 0xd2, 0x90
		])

	},

	'CNAME': {

		'REQUEST': Buffer.from([
			0x59, 0x6b, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x70, 0x72, 0x6f,
			0x70, 0x68, 0x65, 0x74, 0x05, 0x68, 0x65, 0x69,
			0x73, 0x65, 0x02, 0x64, 0x65, 0x00, 0x00, 0x05,
			0x00, 0x01, 0x00, 0x00, 0x29, 0x10, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x0a, 0x00,
			0x08, 0x68, 0x2a, 0x8f, 0x91, 0x5f, 0x27, 0xd2,
			0xe5
		]),

		'RESPONSE': Buffer.from([
			0x59, 0x6b, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x70, 0x72, 0x6f,
			0x70, 0x68, 0x65, 0x74, 0x05, 0x68, 0x65, 0x69,
			0x73, 0x65, 0x02, 0x64, 0x65, 0x00, 0x00, 0x05,
			0x00, 0x01, 0xc0, 0x0c, 0x00, 0x05, 0x00, 0x01,
			0x00, 0x00, 0xd1, 0x64, 0x00, 0x16, 0x07, 0x68,
			0x65, 0x69, 0x73, 0x65, 0x30, 0x32, 0x08, 0x77,
			0x65, 0x62, 0x74, 0x72, 0x65, 0x6b, 0x6b, 0x03,
			0x6e, 0x65, 0x74, 0x00, 0x00, 0x00, 0x29, 0x04,
			0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1c, 0x00,
			0x0a, 0x00, 0x18, 0x68, 0x2a, 0x8f, 0x91, 0x5f,
			0x27, 0xd2, 0xe5, 0x55, 0x86, 0x65, 0x1f, 0x60,
			0x5f, 0x69, 0xcc, 0x7b, 0xf8, 0xfe, 0x5a, 0xb6,
			0xc2, 0xee, 0xae
		])

	},

	'MX': {

		'REQUEST': Buffer.from([
			0x70, 0x52, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x06, 0x67, 0x69, 0x74,
			0x68, 0x75, 0x62, 0x03, 0x63, 0x6f, 0x6d, 0x00,
			0x00, 0x0f, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x00,
			0x0a, 0x00, 0x08, 0x83, 0x33, 0x6c, 0x49, 0x04,
			0x1f, 0x12, 0x05
		]),

		'RESPONSE': Buffer.from([
			0x70, 0x52, 0x81, 0x80, 0x00, 0x01, 0x00, 0x05,
			0x00, 0x00, 0x00, 0x01, 0x06, 0x67, 0x69, 0x74,
			0x68, 0x75, 0x62, 0x03, 0x63, 0x6f, 0x6d, 0x00,
			0x00, 0x0f, 0x00, 0x01, 0xc0, 0x0c, 0x00, 0x0f,
			0x00, 0x01, 0x00, 0x00, 0x0e, 0x10, 0x00, 0x13,
			0x00, 0x01, 0x05, 0x61, 0x73, 0x70, 0x6d, 0x78,
			0x01, 0x6c, 0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c,
			0x65, 0xc0, 0x13, 0xc0, 0x0c, 0x00, 0x0f, 0x00,
			0x01, 0x00, 0x00, 0x0e, 0x10, 0x00, 0x09, 0x00,
			0x05, 0x04, 0x61, 0x6c, 0x74, 0x31, 0xc0, 0x2a,
			0xc0, 0x0c, 0x00, 0x0f, 0x00, 0x01, 0x00, 0x00,
			0x0e, 0x10, 0x00, 0x09, 0x00, 0x0a, 0x04, 0x61,
			0x6c, 0x74, 0x33, 0xc0, 0x2a, 0xc0, 0x0c, 0x00,
			0x0f, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10, 0x00,
			0x09, 0x00, 0x05, 0x04, 0x61, 0x6c, 0x74, 0x32,
			0xc0, 0x2a, 0xc0, 0x0c, 0x00, 0x0f, 0x00, 0x01,
			0x00, 0x00, 0x0e, 0x10, 0x00, 0x09, 0x00, 0x0a,
			0x04, 0x61, 0x6c, 0x74, 0x34, 0xc0, 0x2a, 0x00,
			0x00, 0x29, 0x04, 0xd0, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x1c, 0x00, 0x0a, 0x00, 0x18, 0x83, 0x33,
			0x6c, 0x49, 0x04, 0x1f, 0x12, 0x05, 0xd0, 0x41,
			0x18, 0x11, 0x60, 0x6c, 0x62, 0x7e, 0xa8, 0xf0,
			0x2f, 0xaf, 0x08, 0x92, 0x4e, 0x44
		])

	},

	'NS': {

		'REQUEST': Buffer.from([
			0x2b, 0x42, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08, 0xc4, 0x48, 0x51, 0x35,
			0x86, 0xb3, 0x78, 0xd4
		]),

		'RESPONSE': Buffer.from([
			0x2b, 0x42, 0x81, 0x80, 0x00, 0x01, 0x00, 0x02,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x02, 0x00, 0x01, 0xc0, 0x0c, 0x00,
			0x02, 0x00, 0x01, 0x00, 0x01, 0x51, 0x80, 0x00,
			0x14, 0x01, 0x61, 0x0c, 0x69, 0x61, 0x6e, 0x61,
			0x2d, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x73,
			0x03, 0x6e, 0x65, 0x74, 0x00, 0xc0, 0x0c, 0x00,
			0x02, 0x00, 0x01, 0x00, 0x01, 0x51, 0x80, 0x00,
			0x04, 0x01, 0x62, 0xc0, 0x2b, 0x00, 0x00, 0x29,
			0x04, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1c,
			0x00, 0x0a, 0x00, 0x18, 0xc4, 0x48, 0x51, 0x35,
			0x86, 0xb3, 0x78, 0xd4, 0x96, 0x22, 0x5c, 0xff,
			0x60, 0x5f, 0x6b, 0x69, 0x27, 0x16, 0x8d, 0x1e,
			0xf3, 0xa0, 0x28, 0x7e
		])

	},

	'PTR_IPV4': {

		'REQUEST': Buffer.from([
			0x1a, 0xc8, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x03, 0x32, 0x34, 0x36,
			0x03, 0x31, 0x36, 0x33, 0x03, 0x32, 0x31, 0x37,
			0x02, 0x39, 0x35, 0x07, 0x69, 0x6e, 0x2d, 0x61,
			0x64, 0x64, 0x72, 0x04, 0x61, 0x72, 0x70, 0x61,
			0x00, 0x00, 0x0c, 0x00, 0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08, 0x1e, 0x7a, 0xb3, 0xc2,
			0x91, 0xe8, 0xda, 0x22
		]),

		'RESPONSE': Buffer.from([
			0x1a, 0xc8, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x03, 0x32, 0x34, 0x36,
			0x03, 0x31, 0x36, 0x33, 0x03, 0x32, 0x31, 0x37,
			0x02, 0x39, 0x35, 0x07, 0x69, 0x6e, 0x2d, 0x61,
			0x64, 0x64, 0x72, 0x04, 0x61, 0x72, 0x70, 0x61,
			0x00, 0x00, 0x0c, 0x00, 0x01, 0xc0, 0x0c, 0x00,
			0x0c, 0x00, 0x01, 0x00, 0x01, 0x3d, 0x90, 0x00,
			0x0f, 0x09, 0x61, 0x72, 0x63, 0x68, 0x6c, 0x69,
			0x6e, 0x75, 0x78, 0x03, 0x6f, 0x72, 0x67, 0x00,
			0x00, 0x00, 0x29, 0x04, 0xd0, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00
		])

	},

	'PTR_IPV6': {

		'REQUEST': Buffer.from([
			0xc1, 0xc3, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x01, 0x31, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x66, 0x01, 0x31,
			0x01, 0x62, 0x01, 0x36, 0x01, 0x30, 0x01, 0x31,
			0x01, 0x30, 0x01, 0x63, 0x01, 0x39, 0x01, 0x66,
			0x01, 0x34, 0x01, 0x30, 0x01, 0x31, 0x01, 0x30,
			0x01, 0x61, 0x01, 0x32, 0x03, 0x69, 0x70, 0x36,
			0x04, 0x61, 0x72, 0x70, 0x61, 0x00, 0x00, 0x0c,
			0x00, 0x01, 0x00, 0x00, 0x29, 0x10, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x0a, 0x00,
			0x08, 0xfb, 0xb2, 0x09, 0x25, 0xf5, 0xbd, 0x88,
			0x51
		]),

		'RESPONSE': Buffer.from([
			0xc1, 0xc3, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x01, 0x31, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x30, 0x01, 0x30,
			0x01, 0x30, 0x01, 0x30, 0x01, 0x66, 0x01, 0x31,
			0x01, 0x62, 0x01, 0x36, 0x01, 0x30, 0x01, 0x31,
			0x01, 0x30, 0x01, 0x63, 0x01, 0x39, 0x01, 0x66,
			0x01, 0x34, 0x01, 0x30, 0x01, 0x31, 0x01, 0x30,
			0x01, 0x61, 0x01, 0x32, 0x03, 0x69, 0x70, 0x36,
			0x04, 0x61, 0x72, 0x70, 0x61, 0x00, 0x00, 0x0c,
			0x00, 0x01, 0xc0, 0x0c, 0x00, 0x0c, 0x00, 0x01,
			0x00, 0x01, 0x4e, 0xd4, 0x00, 0x0f, 0x09, 0x61,
			0x72, 0x63, 0x68, 0x6c, 0x69, 0x6e, 0x75, 0x78,
			0x03, 0x6f, 0x72, 0x67, 0x00, 0x00, 0x00, 0x29,
			0x04, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		])

	},

	'SRV': {

		'REQUEST': Buffer.from([
			0x0b, 0x0f, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x08, 0x5f, 0x73, 0x74,
			0x65, 0x61, 0x6c, 0x74, 0x68, 0x04, 0x5f, 0x77,
			0x73, 0x73, 0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69,
			0x61, 0x6e, 0x07, 0x6e, 0x65, 0x74, 0x77, 0x6f,
			0x72, 0x6b, 0x00, 0x00, 0x21, 0x00, 0x01, 0x00,
			0x00, 0x29, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x0c, 0x00, 0x0a, 0x00, 0x08, 0xd5, 0xaa,
			0xab, 0x40, 0xb9, 0x7d, 0x86, 0x08
		]),


		'RESPONSE': Buffer.from([
			0x0b, 0x0f, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01, 0x08, 0x5f, 0x73, 0x74,
			0x65, 0x61, 0x6c, 0x74, 0x68, 0x04, 0x5f, 0x77,
			0x73, 0x73, 0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69,
			0x61, 0x6e, 0x07, 0x6e, 0x65, 0x74, 0x77, 0x6f,
			0x72, 0x6b, 0x00, 0x00, 0x21, 0x00, 0x01, 0xc0,
			0x0c, 0x00, 0x21, 0x00, 0x01, 0x00, 0x00, 0x0e,
			0x10, 0x00, 0x1d, 0x00, 0x00, 0x00, 0x00, 0xff,
			0x98, 0x05, 0x72, 0x61, 0x64, 0x61, 0x72, 0x07,
			0x74, 0x68, 0x6f, 0x6c, 0x69, 0x61, 0x6e, 0x07,
			0x6e, 0x65, 0x74, 0x77, 0x6f, 0x72, 0x6b, 0x00,
			0x00, 0x00, 0x29, 0x04, 0xd0, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x1c, 0x00, 0x0a, 0x00, 0x18, 0xd5,
			0xaa, 0xab, 0x40, 0xb9, 0x7d, 0x86, 0x08, 0x2f,
			0xc7, 0xbb, 0xe9, 0x60, 0x6c, 0x3f, 0xba, 0x32,
			0x85, 0xfa, 0x7c, 0x92, 0x7d, 0x8c, 0xa8
		])

	},

	'TXT': {

		'REQUEST': Buffer.from([
			0x43, 0x5f, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08, 0x41, 0x63, 0x6f, 0x57,
			0x65, 0x33, 0x74, 0x1a
		]),

		'RESPONSE': Buffer.from([
			0x43, 0x5f, 0x81, 0x80, 0x00, 0x01, 0x00, 0x02,
			0x00, 0x00, 0x00, 0x01, 0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x10, 0x00, 0x01, 0xc0, 0x0c, 0x00,
			0x10, 0x00, 0x01, 0x00, 0x01, 0x51, 0x80, 0x00,
			0x21, 0x20, 0x38, 0x6a, 0x35, 0x6e, 0x66, 0x71,
			0x6c, 0x64, 0x32, 0x30, 0x7a, 0x70, 0x63, 0x79,
			0x72, 0x38, 0x78, 0x6a, 0x77, 0x30, 0x79, 0x64,
			0x63, 0x66, 0x71, 0x39, 0x72, 0x6b, 0x38, 0x68,
			0x67, 0x6d, 0xc0, 0x0c, 0x00, 0x10, 0x00, 0x01,
			0x00, 0x01, 0x51, 0x80, 0x00, 0x0c, 0x0b, 0x76,
			0x3d, 0x73, 0x70, 0x66, 0x31, 0x20, 0x2d, 0x61,
			0x6c, 0x6c, 0x00, 0x00, 0x29, 0x04, 0xd0, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x1c, 0x00, 0x0a, 0x00,
			0x18, 0x41, 0x63, 0x6f, 0x57, 0x65, 0x33, 0x74,
			0x1a, 0xa9, 0xd6, 0xea, 0xf5, 0x60, 0x5f, 0x68,
			0xd5, 0x83, 0x7e, 0xb0, 0x93, 0xc4, 0x8f, 0xba,
			0xa5
		])

	}

};



describe('DNS.connect()', function(assert) {

	assert(isFunction(DNS.connect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.disconnect()', function(assert) {

	assert(isFunction(DNS.disconnect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.receive()/client/A', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['A']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   38554,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'A',
						value:  null
					}],
					answers: [{
						domain: 'example.com',
						type:   'A',
						value:  IP.parse('93.184.216.34')
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/AAAA', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['AAAA']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   26815,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'AAAA',
						value:  null
					}],
					answers: [{
						domain: 'example.com',
						type:   'AAAA',
						value:  IP.parse('2606:2800:220:1:248:1893:25c8:1946')
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/CNAME', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['CNAME']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   22891,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'prophet.heise.de',
						type:   'CNAME',
						value:  null
					}],
					answers: [{
						domain: 'prophet.heise.de',
						type:   'CNAME',
						value:  'heise02.webtrekk.net'
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/MX', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['MX']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   28754,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'github.com',
						type:   'MX',
						value:  null
					}],
					answers: [{
						domain: 'github.com',
						type:   'MX',
						value:  'aspmx.l.google.com',
						weight: 1
					}, {
						domain: 'github.com',
						type:   'MX',
						value:  'alt1.aspmx.l.google.com',
						weight: 5
					}, {
						domain: 'github.com',
						type:   'MX',
						value:  'alt2.aspmx.l.google.com',
						weight: 5
					}, {
						domain: 'github.com',
						type:   'MX',
						value:  'alt3.aspmx.l.google.com',
						weight: 10
					}, {
						domain: 'github.com',
						type:   'MX',
						value:  'alt4.aspmx.l.google.com',
						weight: 10
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/NS', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['NS']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   11074,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'NS',
						value:  null
					}],
					answers: [{
						domain: 'example.com',
						type:   'NS',
						value:  'a.iana-servers.net'
					}, {
						domain: 'example.com',
						type:   'NS',
						value:  'b.iana-servers.net'
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/PTR/v4', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['PTR_IPV4']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   6856,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  IP.parse('95.217.163.246')
					}],
					answers: [{
						domain: 'archlinux.org',
						type:   'PTR',
						value:  IP.parse('95.217.163.246')
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/PTR/v6', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['PTR_IPV6']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   49603,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
					}],
					answers: [{
						domain: 'archlinux.org',
						type:   'PTR',
						value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/SRV', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['SRV']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   2831,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: '_stealth._wss.tholian.network',
						type:   'SRV',
						value:  null
					}],
					answers: [{
						domain: '_stealth._wss.tholian.network',
						type:   'SRV',
						value:  'radar.tholian.network',
						weight: 0,
						port:   65432
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/client/TXT', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['TXT']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   17247,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'TXT',
						value:  null
					}],
					answers: [{
						domain: 'example.com',
						type:   'TXT',
						value:  [
							Buffer.from('8j5nfqld20zpcyr8xjw0ydcfq9rk8hgm', 'utf8')
						]
					}, {
						domain: 'example.com',
						type:   'TXT',
						value:  [
							Buffer.from('v=spf1 -all', 'utf8')
						]
					}]
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/A', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['A']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   38554,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'A',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/AAAA', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['AAAA']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   26815,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'AAAA',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/CNAME', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['CNAME']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   22891,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'prophet.heise.de',
						type:   'CNAME',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/MX', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['MX']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   28754,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'github.com',
						type:   'MX',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/NS', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['NS']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   11074,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'NS',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/PTR/v4', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['PTR_IPV4']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   6856,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  IP.parse('95.217.163.246')
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/PTR/v6', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['PTR_IPV6']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   49603,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/SRV', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['SRV']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   2831,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: '_stealth._wss.tholian.network',
						type:   'SRV',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.receive()/server/TXT', function(assert) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['TXT']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   17247,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'TXT',
						value:  null
					}],
					answers: []
				}
			});

			connection.disconnect();

		});

	});

});

describe('DNS.send()/client/A', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'A',
					value:  IP.parse('93.184.216.34')
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/AAAA', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  IP.parse('2606:2800:220:1:248:1893:25c8:1946')
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/CNAME', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  null
				}],
				answers: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  'heise02.webtrekk.net'
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/MX', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'github.com',
					type:   'MX',
					value:  null
				}],
				answers: [{
					domain: 'github.com',
					type:   'MX',
					value:  'aspmx.l.google.com',
					weight: 1
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt1.aspmx.l.google.com',
					weight: 5
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt2.aspmx.l.google.com',
					weight: 5
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt3.aspmx.l.google.com',
					weight: 10
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt4.aspmx.l.google.com',
					weight: 10
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'github.com',
					type:   'MX',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/NS', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'NS',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'NS',
					value:  'a.iana-servers.net'
				}, {
					domain: 'example.com',
					type:   'NS',
					value:  'b.iana-servers.net'
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'NS',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/SRV', function(assert) {

	assert(isFunction(DNS.send), true);


	let url         = URL.parse('dns://1.0.0.1:53');
	let connection1 = DNS.connect(url);
	let connection2 = DNS.connect(url);

	connection1.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  'radar.tholian.network',
					weight: 0,
					port:   65432
				}]
			}
		});

	});

	connection1.once('@connect', () => {

		DNS.send(connection1, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

	connection2.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  'radar.tholian.network',
					weight: 1,
					port:   65432
				}]
			}
		});

	});

	connection2.once('@connect', () => {

		DNS.send(connection2, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.send()/client/TXT', function(assert) {

	assert(isFunction(DNS.send), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   137,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.network',
					type:   'TXT',
					value:  null
				}],
				answers: [{
					domain: 'tholian.network',
					type:   'TXT',
					value:  Buffer.from('All your data are belong to you, the user.', 'utf8')
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 137
			},
			payload: {
				questions: [{
					domain: 'tholian.network',
					type:   'TXT',
					value:  null
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('DNS.upgrade()', function(assert) {

	let server      = dgram.createSocket('udp4');
	let connection1 = DNS.upgrade(server);

	connection1.once('@connect', () => {
		assert(true);
	});

	connection1.once('request', (request) => {

		assert(request, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  null
				}]
			}
		});

		connection1.once('@disconnect', () => {
			assert(true);
		});

	});

	server.bind(13337);


	let url         = URL.parse('dns://localhost:13337');
	let connection2 = DNS.connect(url);

	connection2.once('@connect', () => {

		setTimeout(() => {

			DNS.send(connection2, {
				headers: {
					'@id': 1337
				},
				payload: {
					questions: [{
						domain: 'tholian.local',
						type:   'TXT',
						value:  null
					}]
				}
			}, (result) => {

				assert(result, true);

			});

		}, 100);

		setTimeout(() => {
			assert(DNS.disconnect(connection2), true);
		}, 500);

	});

	connection2.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		server.close();
		assert(true);
	}, 1000);

});



export default finish('stealth/connection/DNS', {
	internet: true,
	network:  false
});


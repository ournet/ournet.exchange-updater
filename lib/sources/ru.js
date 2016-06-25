'use strict';

var utils = require('../utils');

var headers = {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
};

var dayDate = new Date();
dayDate.setHours(dayDate.getHours() + 4);

var bankiReg = /<tr\s*>\s*<td[^>]*>\s*<div[^>]*>\s*<\/div>\s*([A-Z]{3})\s*<\/td>\s*<td\s*>\s*(\d+)\s*<\/td>\s*<td\s*>\s*<a[^>]*>[^<]*<\/a>\s*<\/td>\s*<td[^>]*>\s*([\d, ]+)\s*<\/td>\s*<td[^>]*>\s*([\d, ]+)\s*<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}) [^<]+<\/td>/g;

var sources = [{
	source: 78,
	options: {
		url: 'http://www.cbr.ru/currency_base/daily.aspx?date_req=' + utils.formatDate(dayDate).split('-').reverse().join('.'),
		headers: headers,
		dateReg: /<h2>Центральный банк Российской Федерации установил с (\d{2}\.\d{2}\.\d{4})/i,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: /<td>(\w+)<\/td>\s*<td>([\d]+)<\/td>\s*<td>[^<]+<\/td>\s*<td>([\d, ]+)<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy']
	},
	post: function(rates) {
		rates.forEach(function(rate) {
			rate.sale = rate.buy;
		});
		return rates;
	}
}, {
	source: 74,
	options: {
		url: 'http://www.banki.ru/products/currency/bank/uralsib/Moskva/',
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: bankiReg,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date']
	}
}, {
	source: 58,
	options: {
		url: 'http://www.banki.ru/products/currency/bank/alfabank/Moskva/',
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: bankiReg,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date']
	}
}, {
	source: 81,
	options: {
		url: 'http://www.banki.ru/products/currency/bank/homecreditbank/Moskva/',
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: bankiReg,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date']
	}
}, {
	source: 75,
	options: {
		url: 'http://www.banki.ru/products/currency/bank/chelinvest/Chelyabinsk/',
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: bankiReg,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date']
	}
}, {
	source: 79,
	options: {
		url: 'http://www.banki.ru/products/currency/bank/emb/Ekaterinburg/',
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		},
		reg: bankiReg,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date']
	}
}];

module.exports = sources;

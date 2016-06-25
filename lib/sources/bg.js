'use strict';

var headers = {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
};

module.exports = [{
	source: 100,
	options: {
		url: 'http://www.bnb.bg/Statistics/StExternalSector/StExchangeRates/StERForeignCurrencies/index.htm',
		reg: /<tr[^>]*>\s*<td[^>]*>\s*[^>]+\s*<\/td>\s*<td[^>]*>\s*(\w{3})\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy'],
		headers: headers,
		dateReg: /<h2>Обменни курсове за\s+(\d+\.\d+\.\d{4})\s*<\/h2>/i,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	},
	post: function(rates) {
		rates.forEach(function(rate) {
			rate.sale = rate.buy;
		});
		if (rates.length > 0) {
			rates.push({
				buy: 1.95583,
				sale: 1.95583,
				multiplier: 1,
				currency: 'EUR',
				date: rates[0].date
			});
		}
		return rates;
	}
}, {
	source: 101,
	options: {
		url: 'http://www.rbb.bg/bg/corporate-clients/investments-and-fx-market/fx-market-and-instruments/currency-rates/',
		reg: /<tr(?:[^>]*)>\s*<td nowrap="nowrap" class="plugin_link">\s*<a(?:[^>]*)>\s*(\w{3})\s*<\/a>\s*<\/td>\s*<td[^>]*>[^<]+<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>(?:[\s\d\w-]+)<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.-]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.-]+)\s*<\/td>\s*<td[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*(?:[^<])*\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date'],
		headers: headers,
		dateParser: function(date) {
			return date.split(/\s+/)[0];
		}
	}
}, {
	source: 102,
	options: {
		url: 'http://www.sgeb.bg/bg/byrzi-vryzki/valutni-kursove.html',
		reg: /<tr(?:[^>]*)>\s*<td class="nowrap">\s*(?:[^>]*)\s*<\/td>\s*<td[^>]*>\s*(\w{3})\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.-]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>([\d\.]+)<\/td>\s*<td[^>]*>\s*(?:[\d\.\w\/]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.\w\/]+)\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'buy', 'sale'],
		headers: headers,
		dateReg: /<h2 class="heading-normal">Валутни курсове за\s+(\d{2}-\d{2}-\d{4})<\/h2>/i,
		dateParser: function(date) {
			date = date.split(/-/g);
			date.reverse();
			return date.join('-');
		}
	}
}, {
	source: 103,
	options: {
		url: 'http://www.fibank.bg/bg/page/461',
		reg: /<tr(?:[^>]*)>\s*<td>\s*[^<]+\s*<\/td>\s*<td>\s*<em>\s*(\w{3})\s*<\/em>\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>([\d\.]+)<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy', 'sale'],
		headers: headers,
		dateReg: /Валутни курсове към\s+(\d{2}\.\d{2}\.\d{4})/i,
		dateParser: function(date) {
			date = date.split(/ /)[0];
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	}
}, {
	source: 104,
	options: {
		url: 'http://www.unicreditbulbank.bg/bg/Currency_Rates/Currencies/index.htm',
		reg: /<tr[^>]*>\s*<td>\s*(\w{3})\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.|]+)\s*<\/td>\s*<td[^>]*>([\d\.]+)<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(\d{2}.\d{2}.\d{4})\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy', 'sale', 'date'],
		headers: headers,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	}
}, {
	source: 105,
	options: {
		url: 'https://dskbank.bg/page/default.aspx?&xml_id=/bg-BG/.currency',
		reg: /<tr[^>]*>\s*<td[^>]*>\s*<b>\s*(\w{3})\s*<\/b>\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(\d{2}.\d{2}.\d{4})[^<]*<\/td><\/tr>/gi,
		names: ['currency', 'buy', 'sale', 'date'],
		headers: headers,
		dateParser: function(date) {
			date = date.split(/ /)[0];
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	}
}, {
	source: 106,
	options: {
		url: 'http://www.tbvictoria.bg/RatesDetail',
		reg: /<tr[^>]*>\s*<td[^>]*>\s*(\w{3})\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>\s*(?:[\d\.]+)\s*<\/td>\s*<td[^>]*>([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'multiplier', 'buy', 'sale'],
		headers: headers,
		dateReg: /<td class="blueRow" colspan="2">(\d+\.\d{2}.\d{4})<\/td>/gi,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	}
}, {
	source: 107,
	options: {
		url: 'http://www.procreditbank.bg/bg/page/205/',
		reg: /<tr[^>]*>\s*<td[^>]*>\s*(\w{3})\s*\/\s*BGN\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<td[^>]*>\s*([\d\.]+)\s*<\/td>\s*<\/tr>/gi,
		names: ['currency', 'buy', 'sale'],
		headers: headers,
		limit: 4,
		dateReg: /<h2>Валутни курсове за дата (\d+\.\d{2}.\d{4})[^<]*<\/h2>/i,
		dateParser: function(date) {
			date = date.split(/\./g);
			date.reverse();
			return date.join('-');
		}
	}
}];

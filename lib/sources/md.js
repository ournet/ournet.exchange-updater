"use strict";

var utils = require("../utils");
var Promise = utils.Promise;

var headers = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
};

var sourcesMap = {
	bnm: 2,
	bem: 6,
	soc: 7,
	bcr: 8,
	comertbank: 9,
	energbank: 10,
	ecb: 11,
	eximbank: 12,
	fincombank: 13,
	mobiasbanca: 14,
	micb: 15,
	maib: 16,
	procreditbank: 17,
	uni: 18,
	victoriabank: 19,
	armetis: 20,
	aurmar: 21,
	ciocana: 23,
	clio: 24,
	degh: 25,
	fianirix: 26,
	orion: 29,
	vadisan: 31,
	valutaelit: 32,
};

var cursHtml;

function getCursHtml() {
	if (cursHtml) {
		return Promise.resolve(cursHtml);
	}

	var date = new Date();
	date.setHours(date.getHours() + 4);

	var urlDate = utils.formatDate(date).split("-");
	urlDate = urlDate.reverse().join(".");

	var url =
		"https://www.curs.md/ro/ajax/block?block_name=bank_valute_table&referer=curs_valutar_banci&region=all&ofType=all&CotDate=" +
		urlDate;

	return utils
		.request({
			url: url,
			headers: headers,
		})
		.then(function (html) {
			cursHtml = html;
			return cursHtml;
		});
}

module.exports = [
	{
		name: "curs.md",
		options: {
			source: {
				reg: /<tr class="([\w_\d-]+)\s*">\s*<td class="bank_name">\s*<span[^>]*>[^<]+<\/span>\s*<a[^>]*>[^<]*<\/a>\s*(?:<sup>[^<]*<\/sup>)?\s*<\/td>\s*(<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*\s*<td class="column-\w{3}[^"]*"[^>]*>[\d,-]+<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*<td class="column-\w+[^"]*"[^>]*>[\d,-]*<\/td>\s*)/gi,
			},
			reg: /<td class="column-(\w{3})[^"]*"[^>]*>([\d,-]+)<\/td>\s*<td class="column-\w{3}[^"]*"[^>]*>([\d,-]+)<\/td>/gi,
			names: ["currency", "buy", "sale"],
			headers: headers,
			dateReg: /<input id="BanksCotDate" type="hidden" name="CotDate" value="(\d{4}-\d{2}-\d{2})"/i,
		},
		pre: function () {
			var self = this;
			return getCursHtml().then(function (html) {
				self.options.html = html;
			});
		},
		post: function (rates) {
			rates = rates.filter(function (rate) {
				rate.source = sourcesMap[rate.source];
				return !!rate.source;
			});

			// throw new Error('stop');
			return rates;
		},
	},
];

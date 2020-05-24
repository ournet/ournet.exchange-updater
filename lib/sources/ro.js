"use strict";

var utils = require("../utils");
var exchange = require("ournet.data.exchange");
var country = "ro";

var headers = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
};

var dayDate = new Date();
dayDate.setHours(dayDate.getHours() + 4);
dayDate = utils.formatDate(dayDate);

var currencyIds = [
	[9, "EUR"],
	[20, "USD"],
	[5, "CHF"],
	[12, "100JPY"],
	[10, "GBP"],
	[3, "BGN"],
	[13, "MDL"],
	[11, "100HUF"],
	[2, "AUD"],
	[4, "CAD"],
	[6, "CZK"],
	[7, "DKK"],
	[8, "EGP"],
	[14, "NOK"],
	[15, "PLN"],
	[16, "RUB"],
	[17, "SEK"],
	[18, "SKK"],
	[19, "TRY"],
	[31, "RSD"],
	[32, "UAH"],
	[33, "AED"],
];

var sources = [
	{
		source: 3,
		options: {
			url: "http://www.bnr.ro/nbrfxrates.xml",
			headers: headers,
			dateReg: /<Cube date="(\d{4}-\d{2}-\d{2})">/i,
			reg: /<Rate currency="(\w{3})"(?: multiplier="(\d+)")?>([\d.]+)<\/Rate>/gi,
			formaItem: function (result) {
				var item = {
					currency: result[1],
				};
				if (result.length === 4) {
					item.multiplier = parseInt(result[2]);
					item.sale = item.buy = parseFloat(result[3]);
				} else {
					item.sale = item.buy = parseFloat(result[2]);
				}

				return item;
			},
		},
	},
];

function postRates(rates) {
	rates = rates.filter(function (rate) {
		rate.source = exchange.data.getSourceByUniqueName(
			country,
			rate.source.replace(/(-bank)?-\d+$/i, "")
		);
		rate.source = (rate.source && rate.source.id) || null;
		return !!rate.source;
	});
	// console.log('rates', rates);
	// throw new Error('stop');
	return rates;
}

function addSources() {
	for (var i = currencyIds.length - 1; i >= 0; i--) {
		var cid = currencyIds[i];
		var multiplier =
			cid[1].length > 3 ? parseInt(cid[1].substr(0, cid[1].length - 3)) : 1;
		var currency = cid[1].substr(cid[1].length - 3);
		sources.push({
			name: "business24.ro",
			options: {
				url:
					"http://www.business24.ro/index.php?module=AmvcCVBanks&id=" +
					cid[0] +
					"&date=" +
					dayDate,
				reg: /\/banci-romania\/([\w-\d]+)">\s*(?:[\w- ]+)\s*<\/a><\/div><p class="fleft" style="width:111px;"> ([\d, -]+) <\/p><p class="fleft" style="width:70px;"> ([\d, -]+) <\/p><div class="clear"><\/div><\/div><div class="clear"><\/div>/gi,
				names: ["source", "buy", "sale"],
				headers: headers,
				dateReg: / id="date" value="(\d{4}-\d{2}-\d{2})"/i,
				values: {
					multiplier: multiplier,
					currency: currency,
				},
			},
			post: postRates,
		});
	}
}

addSources();

module.exports = sources;

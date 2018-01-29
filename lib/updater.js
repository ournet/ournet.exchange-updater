'use strict';

var exchange = require('ournet.data.exchange');
var utils = require('./utils');
var Promise = utils.Promise;
var _ = utils._;
var explorer = require('./explorer');
var logger = require('./logger');

function pastRate(rate) {
	var date = new Date(rate.date);
	var instance = exchange.AccessService.instance;
	var past1dayKeys = exchange.data.formatRateKeys(rate.country, date, rate.source, rate.currency, 1, 3);
	var past7dayKeys = exchange.data.formatRateKeys(rate.country, date, rate.source, rate.currency, 7, 3);
	var past30dayKeys = exchange.data.formatRateKeys(rate.country, date, rate.source, rate.currency, 30, 3);
	//console.log(past1dayKeys);

	function setPastRate(days, r) {
		if (r && r.length > 0) {
			rate['buy' + days + 'd'] = r[0].buy;
			rate['sale' + days + 'd'] = r[0].sale;
		}
	}

	return Promise.props({
		past1d: instance.getRates({
			keys: past1dayKeys
		}),
		past7d: instance.getRates({
			keys: past7dayKeys
		}),
		past30d: instance.getRates({
			keys: past30dayKeys
		})
	}).then(function (result) {
		if (!result) {
			return rate;
		}

		setPastRate(1, result.past1d);
		setPastRate(7, result.past7d);
		setPastRate(30, result.past30d);

		return rate;
	});
}

function saveRates(rates) {
	var date = new Date();
	var fdate = utils.formatDate(date);
	return Promise.map(rates, function (rate) {
		rate.key = exchange.data.formatRateKey(rate.country, rate.date || fdate, rate.source, rate.currency);
		rate.date = rate.date || fdate;
		// console.log(rate.date);
		return pastRate(rate).delay(1000).then(function () {
			return rate;
		});
	}).each(function (rate) {
		return exchange.ControlService.instance.putRate(rate).delay(1000);
	});
}

function exploreCountry(country) {
	//if (country == 'ru') return;

	function getSources() {
		return exchange.AccessService.instance.getSources({
			country: country
		}).then(function (sources) {
			return _.pluck(sources, 'id');
		});
	}

	var codes = exchange.data.getCurrenciesCodes(country);

	return explorer.explore(country)
		.then(function (rates) {
			rates = rates || [];
			var count = 0;
			return getSources().then(function (sources) {
				rates = rates.filter(function (rate) {
					return sources.indexOf(rate.source) > -1 && codes.indexOf(rate.currency) > -1;
				});

				count += rates.length;
				return saveRates(rates)
					.then(function () {
						logger.warn('Added ' + count + ' rates for ' + country);
					});
			});
		})
		.catch(function (error) {
			logger.error('Error on exploring country ' + country, error);
		});
}

exports.explore = function () {
	const countries = process.env.COUNTRIES && process.env.COUNTRIES.split(/[\s,;]+/);
	if (countries && countries.length) {
		return Promise.resolve(countries).each(exploreCountry);
	}
	return exchange.AccessService.instance.getCountries().each(exploreCountry);
	// return Promise.resolve(['ru']).each(exploreCountry);
};

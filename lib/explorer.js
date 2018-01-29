'use strict';

var debug = require('debug')('exchange-updater');
var utils = require('./utils');
var Promise = utils.Promise;
var getDates = utils.getDates;
var htmlExtract = require('./extractors/html_extractor');
var logger = require('./logger');

function preSource(country, source) {
	var preResult;
	if (source.pre) {
		preResult = source.pre();
	}
	return Promise.resolve(preResult).delay(1000 * 1);
}

exports.explore = function (country) {
	var dates = getDates();
	var sources = require('./sources/' + country);

	debug('exploring country: ' + country);
	logger.warn('exploring country: ' + country);

	return Promise.resolve(sources)
		.map(function (source) {
			return preSource(country, source).then(function () {
				var sourceName = source.name || source.source;
				debug('starting explore source:', sourceName);
				var extract = source.extractor || htmlExtract;
				return extract(source.options)
					.then(function (rates) {
						rates = rates || [];
						debug('done explore source:', sourceName);
						let preFilterCount = rates.length;
						const initialRates = rates;
						rates = rates.filter(function (rate) {
							rate.source = rate.source || source.source;
							rate.country = country;
							rate.multiplier = rate.multiplier || 1;

							return dates.indexOf(rate.date) > -1;
						});
						if (rates.length !== preFilterCount) {
							debug(`pre filter ${preFilterCount}!=${rates.length}, dates=${initialRates.map(item => item.date)}`);
						}
						preFilterCount = rates.length;
						if (source.post) {
							rates = source.post(rates);
						}
						if (rates.length !== preFilterCount) {
							debug(`pre post ${preFilterCount}!=${rates.length}`);
						}
						if (rates.length < 2) {
							debug('rates length < 2')
							rates = [];
						}
						if (rates.length === 0) {
							logger.warn('No rates for source: ' + sourceName);
						}
						return rates;
					}).catch(function (extractError) {
						logger.error('Error on source: ' + source.options.url, extractError);
					});
			});
		}).then(function (list) {
			var allData = [];
			list.forEach(function (rates) {
				if (Array.isArray(rates)) {
					allData = allData.concat(rates);
				}
			});

			debug('explored for ' + country + ' ' + allData.length + ' rates');
			logger.warn('explored for ' + country + ' ' + allData.length + ' rates');

			// console.log(allData);

			return allData;
		});
};

'use strict';

var debug = require('debug')('exchange-updater');
var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;
var request = utils.request;

function getPage(url, headers) {
	return request({
		url: url,
		timeout: 1000 * 5,
		headers: headers
	});
}

function getDate(html, options) {
	if (options.dateReg) {
		var result;
		if ((result = options.dateReg.exec(html)) !== null) {
			return options.dateParser ? options.dateParser(result[1]) : result[1];
		}
	}
}

function formaItem(result, options) {
	var names = options.names;
	var line = {};
	for (var i = 1; i < result.length && i <= names.length; i++) {
		line[names[i - 1]] = result[i];
	}

	return line;
}

function getLines(html, options) {
	var reg = options.reg;
	var result;
	var list = [];
	var date = options.date || getDate(html, options);
	var found = false;
	// if (!date) {
	// 	// console.log('no date');
	// 	return [];
	// }
	// debug('reg', reg);
	while ((result = reg.exec(html)) !== null) {
		found = true;
		var line;
		if (options.formaItem) {
			line = options.formaItem(result);
		} else {
			line = formaItem(result, options);
		}

		if (line.currency) {
			line.currency = line.currency.trim().toUpperCase();
		}
		if (line.multiplier) {
			line.multiplier = parseInt(line.multiplier);
		}
		if (line.buy && (typeof line.buy === 'string')) {
			line.buy = parseFloat(line.buy.replace(/[ ,]/g, '.'));
		}
		if (line.sale && (typeof line.sale === 'string')) {
			line.sale = parseFloat(line.sale.replace(/[ ,]/g, '.'));
		}
		if (isNaN(line.buy) && isNaN(line.sale)) {
			// console.log('no data', line);
			debug('no data', line);
			continue;
		}
		if (line.date) {
			line.date = options.dateParser ? options.dateParser(line.date) : line.date;
		} else if (date) {
			line.date = date;
		}

		if (!line.multiplier && options.values && options.values.multiplier) {
			line.multiplier = options.values.multiplier;
		}
		if (!line.currency && options.values && options.values.currency) {
			line.currency = options.values.currency;
		}
		if (!line.date) {
			debug('not found date');
			continue;
		}

		list.push(line);
		if (options.limit && options.limit === list.length) {
			break;
		}
	}

	if (!found) {
		// debug('no line found!', html);
	}

	list = _.uniq(list, 'currency');

	return list;
}

function explore(html, options) {
	options.date = options.date || getDate(html, options);

	if (options.source && options.source.reg) {
		var result;
		var lines = [];
		var found = false;
		// debug('source reg', options.source.reg);
		while ((result = options.source.reg.exec(html)) !== null) {
			found = true;
			var source = result[options.source.sourceIndex || 1];
			// debug('source', result[1]);
			var innerHtml = result[options.source.htmlIndex || 2];
			// debug('innerHtml length', innerHtml && innerHtml.length);
			var items = getLines(innerHtml, options);

			for (var i = items.length - 1; i >= 0; i--) {
				var item = items[i];
				item.source = source;
			}

			lines = lines.concat(items);
		}
		if (!found) {
			debug('no source found in html!');
		}
		// console.log(lines);
		return Promise.resolve(lines);
	} else {
		return Promise.resolve(getLines(html, options));
	}
}

function extract(options) {
	if (!options || (!options.url && !options.html) || !options.reg) {
		return Promise.reject(new Error('Invalid options'));
	}

	if (options.html) {
		debug('getting data by html');
		return explore(options.html, options);
	}

	debug('get html by url', options.url);

	return getPage(options.url, options.headers)
		.then(function(html) {
			return explore(html, options);
		});
}

module.exports = extract;

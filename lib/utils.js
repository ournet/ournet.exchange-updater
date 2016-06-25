'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var request = require('request');

function req(options) {
	return new Promise(function(resolve, reject) {
		request(options,
			function(error, response, body) {
				if (!error && response.statusCode === 200) {
					return resolve(body);
				}
				// console.log(response);
				reject(error || new Error('Invalid status'));
			});
	});
}

function formatDate(date, separator) {
	date = date || new Date();
	separator = separator || '-';

	// if the date is formated
	if (typeof date === 'string') {
		if (date.indexOf(separator) !== 3) {
			throw new Error('Invalid date format:', date);
		}
		return date;
	}

	var days = date.getDate();
	days = days < 10 ? '0' + days : days;

	var months = date.getMonth() + 1;
	months = months < 10 ? '0' + months : months;

	var years = date.getFullYear();

	return [years, months, days].join('-');
}

function getTomorrow() {
	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return tomorrow;
}

function getDates() {
	var dates = [formatDate(), formatDate(getTomorrow())];
	return dates;
}

exports.getTomorrow = getTomorrow;
exports.getDates = getDates;
exports.formatDate = formatDate;
exports.request = req;

module.exports = _.assign({ _: _, Promise: Promise }, exports);

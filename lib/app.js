'use strict';

require('dotenv').load();

logger.warn('START');

var logger = require('./logger');
var updater = require('./updater');

updater.explore()
	.then(function () {
		logger.warn('END OK');
	})
	.catch(function (error) {
		logger.error('END ERROR: ' + error.message, error);
	});

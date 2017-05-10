'use strict';

require('dotenv').load();

var logger = require('./logger');
var updater = require('./updater');

logger.warn('START');

updater.explore()
	.then(function () {
		logger.warn('END OK');
	})
	.catch(function (error) {
		logger.error('END ERROR: ' + error.message, error);
	});

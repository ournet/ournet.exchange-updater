'use strict';

require('dotenv').load();

var logger = require('./logger');
var updater = require('./updater');

updater.explore()
	.then(function() {
		logger.warn('End updater...');
	})
	.catch(function(error) {
		logger.error(error.message, error);
	});

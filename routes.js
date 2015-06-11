'use strict';
var controllers = require('./controllers'); // Experiment Controllers

/**
 * Adds new routes to the application passed in.
 *
 * @param app
 */
module.exports = function (app) {

    app.get('/', controllers.ethicsAndWorkerId);
};



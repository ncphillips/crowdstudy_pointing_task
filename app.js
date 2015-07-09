/* jslint node: true */
'use strict';

var express = require('express');
var app = express();

// Set Experiment views directory.
app.set('views', __dirname+'/views');

// Static files are in ./public and are available at this route.
// Example:
//      <script type="text/jsx" src="/examples/scripts/ExampleButton.jsx"></script>
//      <script type="text/jsx" src="scripts/ExampleInput.js"></script>
app.use(express.static(__dirname + '/public'));

// Load Experiment Routes
require('./routes.js')(app);

module.exports.app = app;
module.exports.controllers = require('./controllers');
module.exports.routes = require('./routes');


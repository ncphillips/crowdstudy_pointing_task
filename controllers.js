/* jslint node: true */
'use strict';

var config = require('./config');
var pointingstats = require('./public/scripts/lib/pointingstats').pointingstats;

module.exports.index = function (req, res) {
  res.render('index');
};

module.exports.experiment_name = function (req, res, next) {
  req.experiment_name = 'pointing_task';
  next();
};

module.exports.task = function (req, res) {
  console.log(req.query);
  res.render('pointing', {
    worker_id: req.query._id,
    target_diameters: req.query.target_diameters,
    center_diameters: req.query.center_diameters
  });
};

module.exports.end = function (req, res) {
  res.render('end');
};

module.exports.hook_worker_registration = function (req, res, next) {
  /**
   * @todo Select feedback type.
   */
  req.experiment.data = [];
  req.feedback_type = config.NONE;
  next();
};


module.exports.generate_stats = function (req, res, next) {
  req.stats = {
    worker: {
    },
    population: {}
  };

  // Generate worker stats.
  var data = req.worker.experiments.pointing_task.data;
  var last_block = data[data.length - 1];

  req.stats.worker.last_block = pointingstats.generateBlockStats(last_block);
  req.stats.worker.last_block.num_blocks = 1;

  if (data.length > 1) {
    var avg_blocks = [];
    for (var i = 0; i < data.length - 1; i++) {
      avg_blocks.push(data[i]);
    }

    req.stats.worker.average = pointingstats.generateAverageStats(avg_blocks);
  }

  switch (req.experiment.feedback_type) {
    case config.NONE:
      real_stats(req, res, next);
      break;
    case config.REAL:
      real_stats(req, res, next);
      break;
    case config.FAKE:
      fake_stats(req, res, next);
      break;
    default:
      real_stats(req, res, next);
      break;
  }
};

var real_stats = function (req, res, next) {
  var workers = req.db.collection('workers');
  workers.find({
    "experiments.pointing_task": {$exists: true},
    "experiments.pointing_task.data": {$exists: true, $not: {$size: 0}}
  }).toArray(function (err, population) {
    if (err) { return next(err); }
    req.stats.population.average = pointingstats.generatePopulationAverageStats(population);
    req.stats.population.elite = pointingstats.generatePopulationEliteStats(population);
    next();
  });
};


var fake_stats = function (req, res, next) {
  real_stats(req, res, function () {
    var a = req.stats.population.average;
    var p = req.stats.population.elite;

    var modifier = 0.5;

    a.time = a.time * modifier;
    a.time_per_target = a.time_per_target * modifier;
    a.misses_per_target = a.misses_per_target * modifier;
    a.num_misses = a.num_misses * modifier;

    p.time = p.time * modifier;
    p.time_per_target = p.time_per_target * modifier;
    p.misses_per_target = p.misses_per_target * modifier;
    p.num_misses = p.num_misses * modifier;

    next();
  });

};


module.exports.returnStats = function (req, res) {
  res.json(req.stats);
};

module.exports.real_stats = real_stats;
module.exports.fake_stats = fake_stats;

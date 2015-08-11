/* jslint node: true */
'use strict';

var config = require('./config');
var pointingstats = require('./public/scripts/lib/pointingstats').pointingstats;

/**
 * Render Index View
 *
 * @param req
 * @param res
 */
module.exports.index = function (req, res) {
  res.render('index');
};

/**
 * Set Experiemtn name
 * @param req
 * @param res
 * @param next
 */
module.exports.experiment_name = function (req, res, next) {
  req.experiment_name = 'pointing_task';
  next();
};

/**
 * Render Pointing Task
 * @param req
 * @param res
 */
module.exports.task = function (req, res) {
  console.log(req.query);
  res.render('pointing', {
    worker_id: req.query._id,
    target_diameters: req.query.target_diameters,
    center_diameters: req.query.center_diameters
  });
};

/**
 * Render redirect page.
 * @param req
 * @param res
 */
module.exports.end = function (req, res) {
  res.render('end');
};


/**
 * Hook Worker Registration
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.hook_worker_registration = function (req, res, next) {
  req.experiment.data = [];
  req.experiment.feedback_type = config.feedback_type;
  next();
};


/**
 * Generate Block Stats
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.generate_stats = function (req, res, next) {
  req.stats = {
    worker: {},
    population: {}
  };

  // Generate worker stats.
  var data = req.worker.experiments.pointing_task.data;
  req.block_num = data.length - 1;
  var last_block = data[req.block_num];

  req.stats.worker.last_block = pointingstats.generateBlockStats(last_block);

  // Dont return comparison stats for first two rounds.
  if (req.block_num < 2) {
    return next();
  }

  var stats_middleware = require('./middleware/stats');

  switch (req.experiment.feedback_type) {
    case config.constants.NONE:
      next();
      break;
    case config.constants.REAL:
      stats_middleware.real(req, res, next);
      break;
    case config.constants.FAKE_WORKER_IS_BETTER:
      stats_middleware.fake_better(req, res, next);
      break;
    case config.constants.FAKE_WORKER_IS_WORSE:
      stats_middleware.fake_worse(req, res, next);
      break;
    default:
      next();
  }
};



/**
 * Send the stats object as JSON to the requester.
 *
 * @param req
 * @param res
 */
module.exports.returnStats = function (req, res) {
  res.json(req.stats);
};

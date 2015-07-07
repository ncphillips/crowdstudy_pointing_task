'use strict';

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
  next();
};

var statsForBlock = function (block) {
  var stats = {
    time: 0,
    num_misses: 0,
    time_per_target: 0,
    misses_per_target: 0
  };
  var log;
  if (block && block.click_logs) {
    for (var i=0; i < block.click_logs.length; i++) {
      log = block.click_logs[i];
      stats.time += parseInt(log.end_time) - parseInt(log.start_time);
      stats.num_misses += parseInt(log.errors);
    }

    stats.num_targets = block.click_logs.length;
    stats.time_per_target = stats.time / block.click_logs.length;
    stats.misses_per_target = stats.num_misses / block.click_logs.length;
  }

  return stats;
};

module.exports.generate_stats = function (req, res, next) {
  req.stats = {
    worker: {
    },
    pupulation: {}
  };

  // Generate worker stats.
  var data = req.worker.experiments.pointing_task.data;
  var last_block = data[data.length - 1];

  req.stats.worker.last_block = statsForBlock(last_block);
  req.stats.worker.last_block.num_blocks = 1;

  var sfb;
  var average_block = {
    time: 0,
    num_misses: 0,
    time_per_target: 0,
    misses_per_target: 0,
    num_targets: 0,
    num_blocks: data.length - 1
  };

  console.log(req.worker.id, " blocks: ", data);
  for (var i=0; i < data.length - 1; i++) {
    console.log(req.worker.id, " ", i);
    sfb = statsForBlock(data[i]);
    average_block.time += sfb.time;
    average_block.num_misses += sfb.num_misses;
    average_block.time_per_target += sfb.time_per_target;
    average_block.misses_per_target += sfb.misses_per_target;
    average_block.num_targets += sfb.num_targets;
  }

  average_block.time = average_block.time / (data.length - 1);
  average_block.num_misses = average_block.num_misses / (data.length - 1);
  average_block.num_targets = average_block.num_targets / (data.length - 1);
  average_block.time_per_target = average_block.time_per_target / (data.length - 1);
  average_block.misses_per_target = average_block.misses_per_target / (data.length - 1);

  req.stats.worker.average = average_block;

  //switch (req.experiment.feedback_type) {
  //  case config.NONE:
  //    real_stats(req, res, next);
  //    break;
  //  case config.REAL:
  //    real_stats(req, res, next);
  //    break;
  //  case config.FAKE:
  //    fake_stats(req, res, next);
  //    break;
  //  default:
  //    next();
  //    break;
  //}
  next();
};

var real_stats = function (req, res, next) {


  next();
};

exports.real_stats = real_stats;

var fake_stats = function (req, res, next) {
  req.stats = {};
  next();
};
exports.fake_stats = fake_stats;


exports.returnStats = function (req, res) {
  res.json(req.stats);
};
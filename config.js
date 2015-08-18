/* jslint node: true */
var constants = {
  NONE: 'None',
  REAL: 'Real',
  FAKE_WORKER_IS_BETTER: 'Fake (Better)',
  FAKE_WORKER_IS_WORSE: 'Fake (Worse)'
};

var config = {
  feedback_type: constants.NONE,
  stats_query: {
    "experiments.pointing_task.feedback_type": constants.NONE,
    "experiments.pointing_task": { $exists: true },
    "experiments.pointing_task.data": { $exists: true, $not: { $size: 0 } },
    "experiments.pointing_task.completed": {$in: [true, "true", "True", "TRUE"]}
  },
  constants: constants
};


module.exports = config;

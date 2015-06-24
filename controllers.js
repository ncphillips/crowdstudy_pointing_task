'use strict';

module.exports.index = function (req, res) {
  res.render('index');
};

module.exports.task = function (req, res) {
  res.render('pointing', {worker_id: req.query._id});
};

module.exports.end = function (req, res) {
  res.render('end');
};

module.exports.hook_worker_registration = function (req, res, next) {
  console.log("Hello");
  req.experiment.data = {
    click_logs: [],
    move_logs: []
  };
  next();
};



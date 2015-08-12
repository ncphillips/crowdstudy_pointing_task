/* jslint node: true */
"use strict";
var config = require('../config');
var pointingstats = require('../public/scripts/lib/pointingstats').pointingstats;

/**
 * All the stats generators
 */
module.exports = {
  /**
   * Generate Real Stats
   *
   * @param req
   * @param res
   * @param next
   */
  real: function (req, res, next) {
    var workers = req.db.collection('workers');
    workers.find(config.stats_query).toArray(function (err, population) {
      if (err) { return next(err); }
      req.stats.population.average = pointingstats.generatePopulationAverageStats(population, req.block_num);
      req.stats.population.elite = pointingstats.generatePopulationEliteStats(population, req.block_num);
      next();
    });
  },

  /**
   * Generate Fake stats making that worker look better.
   * @param req
   * @param res
   * @param next
   */
  fake_better: function (req, res, next) {
    var elite_mod = 1.1;  // 20% better than top workers
    var avg_mod = 1.25;    // 40% better than average workers
    var last_block = req.stats.worker.last_block;

    // Average
    req.stats.population.average = {
      time: last_block.time * avg_mod,
      time_per_target: last_block.time_per_target * avg_mod,
      misses_per_target: last_block.misses_per_target * avg_mod,
      num_misses: last_block.num_misses * avg_mod
    };

    // Elite
    req.stats.population.elite = {
      time: last_block.time * elite_mod,
      time_per_target: last_block.time_per_target * elite_mod,
      misses_per_target: last_block.misses_per_target * elite_mod,
      num_misses: last_block.num_misses * elite_mod
    };

    next();
  },

  /**
   * Generate Fake Stats making the worker look worse
   *
   * @param req
   * @param res
   * @param next
   */
  fake_worse: function (req, res, next) {
    var elite_mod = 0.75;  // 40% worse than top workers
    var avg_mod = 0.90;    // 20% worse than average workers
    var last_block = req.stats.worker.last_block;

    // Average
    req.stats.population.average = {
      time: last_block.time * avg_mod,
      time_per_target: last_block.time_per_target * avg_mod,
      misses_per_target: last_block.misses_per_target * avg_mod,
      num_misses: last_block.num_misses * avg_mod
    };

    // Elite
    req.stats.population.elite = {
      time: last_block.time * elite_mod,
      time_per_target: last_block.time_per_target * elite_mod,
      misses_per_target: last_block.misses_per_target * elite_mod,
      num_misses: last_block.num_misses * elite_mod
    };

    next();
  }
};

'use strict';

/**
 * Renders either a page displaying the Ethical statement, and a WorkerID form, or the PointingTask application.
 *
 * @param req
 * @param res
 */
exports.ethicsAndWorkerId = function (req, res) {
    // If the worker id has been given, render the PointingTask application.
    if (req.query.worker_id) {
        req.context.worker_id = req.query.worker_id;
        res.render('pointing', req.context);
    }
    // Otherwise, render `index` which has the Ethics and WorkerID pages.
    else {
        res.render('index', req.context);
    }
};
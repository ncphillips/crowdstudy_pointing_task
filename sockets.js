'use strict';

module.exports = function (config, server) {
  var MongoClient = require('mongodb').MongoClient;
  var ObjectId = require('mongodb').ObjectID;
  var fs = require('fs');
  var io = require('socket.io')(server);
  var os = require('os');
  var myIP;

  var ifaces = os.networkInterfaces();

  for (var dev in ifaces) {
    ifaces[dev].forEach(function(details){
      if (details.family === 'IPv4' && !details.internal) {
        myIP = details.address;
      }
    });
  }

  io.on('connection', function (socket) {
    console.log('a user connected');
    var moveLog = "";
    var clickLog = "";
    var worker = null;

    MongoClient.connect(config.server.db, function (err, db) {
      var workers = db.collection('workers');

      socket.on('init', function (_id) {
        console.log(_id);
        workers.find({_id: ObjectId(_id)}).toArray(function (e, w) {
          if (e) {
            console.log(e);
          } else if (w.length<1) {
            console.log("No worker found.");
          } else {
            worker = w[0];
          }
        });
      });

      socket.on('moveLog', function (msg) {
        var event = msg.split(';');
        var move_logs = worker.experiments.pointing_task.data.move_logs || [];
        move_logs.push({
          trial_tar: event[0],
          trial_cen: event[1],
          current_trial_tar: event[2],
          current_trial_cen: event[3],
          number_of_targets: event[4],
          dest: event[5],
          mouse_x: event[6],
          mouse_y: event[7],
          time: event[8],
          browser_name: event[9],
          os_name: event[10],
          invisible_mode: event[11],
          next_block: event[12]
        });

        workers.update(
          {_id: worker._id},
          {$set: {"experiments.pointing_task.data.move_logs": move_logs}},
          function () {  }
        );
      });

      socket.on('clickLog', function (msg) {
        var event = msg.split(';');
        var click_logs = worker.experiments.pointing_task.data.click_logs || [];
        click_logs.push({
          trial_tar: event[0],
          trial_cen: event[1],
          current_trial_tar: event[2],
          current_trial_cen: event[3],
          number_of_targets: event[4],
          dest: event[5],
          start_time: event[6],
          end_time: event[7],
          mousedown_time: event[8],
          errors: event[9],
          browser_name: event[10],
          os_name: event[11],
          invisible_mode: event[12],
          next_block: event[13]
        });
        workers.update(
          {_id: worker._id},
          {$set: {"experiments.pointing_task.data.click_logs": click_logs}},
          function () {  }
        );
      });

      socket.on('consoleLog', function (msg) {
        console.log(msg);
      });

      socket.on('disconnect', function () {
        console.log('user disconnected');
        db.close(function () {
          console.log('Pointing Task MongoDB Connection Closed');
        });
      });
    });
  });
};


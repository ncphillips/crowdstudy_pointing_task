module.exports = function (config, server) {
    var fs = require('fs');
    var io = require('socket.io')(server);
    var os = require('os');
    var myIP;



    var ifaces = os.networkInterfaces();

    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details){
            if (details.family == 'IPv4' && !details.internal) {
                myIP = details.address;
            }
        });
    }

    io.on('connection', function (socket) {
        console.log('a user connected');

        var moveLog = "";
        var clickLog = "";

        socket.on('init', function (PID) {
            moveLog = __dirname + '/logs/CursorMovement-PID-' + PID + '-TimeStamp-' + Date.now() + '.txt';
            var movefile = fs.open(moveLog, 'w', function (err) {
                if (err) throw err;
                console.log('File Opened For Logging Movement.');
                fs.appendFile(moveLog, "PID; W; D; Wr; Dr; tot; Target; X; Y; Time; Browser; OS; Invisible; Block; WorkerID; Platform; HIT;\n");
            });

            clickLog = __dirname + '/logs/ClickData-PID-' + PID + '-TimeStamp-' + Date.now() + '.txt';
            var clickfile = fs.open(clickLog, 'w', function (err) {
                if (err) throw err;
                console.log('File Opened For Logging Clicks.');
                fs.appendFile(clickLog, "PID; W; D; Wr; Dr; tot; Target; Start; End; MouseDown; Error; Browser; OS; Invisible; Block; WorkerID; Platform; HIT;\n");
            });
        });

        socket.on('moveLog', function (msg) {
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect(config.server.db, function (err, db) {
                if (err) { log.error(err);  }
                fs.appendFile(moveLog, msg);
            });
        });

        socket.on('clickLog', function (msg) {
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect(config.server.db, function (err, db) {
                if (err) { log.error(err); }

                fs.appendFile(clickLog, msg);
            });
        });

        socket.on('consoleLog', function (msg) {
            console.log(msg);
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
};

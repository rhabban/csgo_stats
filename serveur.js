var express = require('express');
var mongoose = require('mongoose');
var exec = require('child_process').exec; // exec OS commands
var spawn = require('child_process').spawn; // exec OS commands
var d3 = require('d3');
var util = require('util');


var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var assert = require('assert');

    exec('scrapy crawl majorevents -t json --nolog -o - > "majorevents.json"', {
     cwd: 'scrapy/csgostats'
     }, function(error, stdout, stderr) {
     majorevents = require('./scrapy/csgostats/majorevents.json');
     console.log(majorevents);
     });

//Mongoose
mongoose.connect('mongodb://localhost/CSGO_STATS');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to CSGO_STATS');

    app.get('/', function (req, res) {
            res.render('index.ejs');
        })
        .get('/about', function (req, res) {
            res.render('about.ejs');
        })
        .use("/css", express.static(__dirname + "/css"))
        .use("*", function (req, res) {
            res.render("404.ejs");
        })
});

server.listen(8080);
console.log('Listening at localhost:8080');

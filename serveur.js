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

var majorEvents;
var teamInfo;

// Mongoose Schemas

var majorEventSchema = mongoose.Schema({
    name: String,
    location: String,
    prizepool: String,
    winner: String,
    runnerUp: String,
    country: String,
    date: String
});

var teamInfoSchema = mongoose.Schema({
    teamname: String,
    country: String,
    totalEarning: Number,
    logo: String
});

var MajorEvent = mongoose.model('MajorEvent', majorEventSchema);
var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

majorEvents = [];
getMajorEvent();

teamInfo = [];
getTeamInfo();

app.get('/', function (req, res) {
        res.render('index.ejs', {events: majorEvents});
    })
    .get('/about', function (req, res) {
        res.render('about.ejs');
    })
    .get('/teams', function (req, res) {
        res.render('teams.ejs', {teams: teamInfo});
    })
    .use("/css", express.static(__dirname + "/css"))
    .use("/js", express.static(__dirname + "/js"))
    .use("*", function (req, res) {
        res.render("404.ejs");
    });

server.listen(8080);
console.log('Listening at localhost:8080');

io.on('connection', function (socket) {
    //Get total Earning By Team
    socket.on('getTotalEarningByCountry', function (data) {
      getTotalEarningByCountry(socket, data);
    });
});

function getMajorEvent() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        MajorEvent.find({}, function (err, events) {
            if(err)
              console.log(err);
            majorEvents = events;
            db.close();
        });
    });
}

function getTeamInfo() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        TeamInfo.find({}, function (err, teams) {
            if(err)
              console.log(err);
            teamInfo =teams;
            db.close();
        });
    });
}

function getTotalEarningByCountry(socket, data){
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        TeamInfo.find({}).sort({totalEarning: -1}).limit(10).select('teamname country totalEarning').exec(function(err, teams){
          if(err)
            console.log(err);

          var formatted_items = [];
          var totalEarningByRes = 0;

          for (var i = 0; i < teams.length; i++) {
            var team = teams[i];
            var item = {
              name: teams[i].teamname,
              country: teams[i].country,
              totalEarning: teams[i].totalEarning,
            };
            formatted_items.push(item);
            totalEarningByRes+= teams[i].totalEarning;
          }

          for (var i = 0; i < formatted_items.length; i++) {
            formatted_items[i].y = (formatted_items[i].totalEarning * 100) / totalEarningByRes;
          }

          var formatted_data = [{
              name: 'Total earning',
              colorByPoint: true,
              data: formatted_items
          }];
          db.close();
          socket.emit("sendTotalEarningByCountry", formatted_data);
        })
    });
}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

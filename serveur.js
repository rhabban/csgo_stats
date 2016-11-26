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
    totalEarning: String,
    logo: String
});

var MajorEvent = mongoose.model('MajorEvent', majorEventSchema);
var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

// crawl major events
/*exec('scrapy crawl majorevents -t json --nolog -o - > "majorevents.json"', {
    cwd: 'scrapy/csgostats'
}, function (error, stdout, stderr) {
    console.log("majorevents crawled");
    majorevents = require('./scrapy/csgostats/majorevents.json');
});

//crawl teams list
exec('scrapy crawl teamname -t json --nolog -o - > "teamname.json"', {
    cwd: 'scrapy/csgostats'
}, function (error, stdout, stderr) {
    console.log("team names crawled");
    exec('scrapy crawl teaminfo -t json --nolog -o - > "teaminfo.json"', {
        cwd: 'scrapy/csgostats'
    }, function (error, stdout, stderr) {
        console.log("team info crawled");
        teamInfo = require('./scrapy/csgostats/teaminfo.json');
        insertDataInDb();
    });
});*/

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


function insertDataInDb() {
    console.log('Insert in DB');
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("DB opened");
        for (var i = 0; i < majorEvents.length; i++) {
            var event = majorEvents[i];
            var item = new MajorEvent({
                name: event.name,
                location: event.location,
                prizepool: event.prizepool,
                winner: event.winner,
                runnerUp: event.runnerUp,
                date: event.date,
                country: event.coutry,
                upsert: true
            });
            MajorEvent.update({name: event.name}, item, {upsert: true}, function (err) {
              if(err)
                console.log(err);
            });
        }

        for (var i = 0; i < teamInfo.length; i++) {
            var team = teamInfo[i];
            var item = new TeamInfo({
                teamname: team.teamname,
                country: team.country,
                totalEarning: team.totalEarning,
                logo: team.logo,
                upsert: true
            });
            TeamInfo.update({teamname: event.teamname}, item, {upsert: true}, function (err) {
              if(err)
                console.log(err);
            });
        }
    });
}

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
        TeamInfo.find({}).limit(5).select('teamname country totalEarning').exec(function(err, teams){
          db.close();
          var formatted_items = [];
          var totalEarningByRes = 0;

          for (var i = 0; i < teams.length; i++) {
            totalEarning = teams[i].totalEarning;
            //formatted_totalEarning = totalEarning.replace("$", "");
            var item = {
              name: teams[i].teamname,
              totalEarning: teams[i].totalEarning,
            };
            formatted_items.push(item);
            totalEarningByRes+=teams[i].totalEarning;
          }

          for (var i = 0; i < formatted_items.length; i++) {
            formatted_items[i].y = (formatted_items[i].totalEarning * 100) / totalEarningByRes;
            console.log(totalEarningByRes);
          }

          var formatted_data = [{
              name: 'Total earning',
              colorByPoint: true,
              data: formatted_items
          }];

          socket.emit("sendTotalEarningByCountry", formatted_data);
        })
    });
}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

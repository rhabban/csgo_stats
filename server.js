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
var minorEvents;
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

var minorEventSchema = mongoose.Schema({
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
var MinorEvent = mongoose.model('MinorEvent', minorEventSchema);
var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

majorEvents = [];
getMajorEvent();

minorEvents = [];
getMinorEvent();

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
.get('/minorevents', function (req, res) {
    res.render('minorevents.ejs', {events: minorEvents});
})
.get('/zoomableChart', function(req, res) {
    res.render('zoomableChart.ejs');
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
    socket.on('getEarningDistribution', function() {
        getEarningDistribution(socket);
    });
    socket.on('getMajorEventByCountry', function() {
        getMajorEventByCountry(socket);
    });
});

function getMajorEvent() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        MajorEvent.find({}, function (err, events) {
            if(err)
                console.log("GetMajorEvent: "+err);
            majorEvents = events;
            db.close();
        });
    });
}

function getMinorEvent() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        MinorEvent.find({}, function (err, events) {
            if(err)
                console.log("GetMinorEvent: "+err);
            minorEvents = events;
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
                console.log("GetTeamInfo: "+err);
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
                console.log("GetTeamInfo: "+ err);

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

function getEarningDistribution(socket){
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        TeamInfo.find({}).sort({totalEarning: -1}).exec(function (err, teams){
            if(err)
                console.log(err);

            var tmp_total = [];
            var formatted_countries = [];

            for (var i = 0; i < teams.length; i++) {
                var team = teams[i];
                var tmp_country;
                if(!formatted_countries[team.country]){
                    tmp_country = {name: team.country, total_team:0, total_earning:0};
                } else {
                    tmp_country = formatted_countries[team.country];
                }
                tmp_country.total_team += 1;
                tmp_country.total_earning += team.totalEarning;
                formatted_countries[team.country] = tmp_country;
            }

            var data_y1 = [];
            var data_y2 = [];
            var categories = [];

            for(country in formatted_countries){
                categories.push(country);
                data_y1.push(formatted_countries[country].total_team);
                data_y2.push(formatted_countries[country].total_earning);
            }
            var formatted_data = new Object();
            formatted_data.categories = categories;
            formatted_data.data_y1 = data_y1;
            formatted_data.data_y2 = data_y2;

            db.close();
            socket.emit("sendEarningDistribution", formatted_data);
        })
    });
}

function getMajorEventByCountry(){
    return false;
}

function getEventsCount(events)
{
    var dataCount = [];
    for(var i = 2012; i <= 2016; i++)
    {
        var count = 0;
        events.forEach(function(event)
        {
            console.log(event.date);
            if(event.date.includes(i))
            {
                count++;
            }
        });
        dataCount[i] = count;
    }
}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

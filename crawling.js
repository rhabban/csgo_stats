var mongoose = require('mongoose');
var exec = require('child_process').exec; // exec OS commands
var spawn = require('child_process').spawn; // exec OS commands
var util = require('util');

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
});

var MajorEvent = mongoose.model('MajorEvent', majorEventSchema);
var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

// crawl major events
exec('scrapy crawl majorevents -t json --nolog -o - > "majorevents.json"', {
    cwd: 'scrapy/csgostats'
}, function (error, stdout, stderr) {
    console.log("majorevents crawled");
    majorEvents = require('./scrapy/csgostats/majorevents.json');
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
            var formatted_totalEarning = 0;
            if(team.totalEarning){
              formatted_totalEarning = team.totalEarning;
              formatted_totalEarning = formatted_totalEarning.replace("$", '');
              formatted_totalEarning = formatted_totalEarning.replace(",", '');
              formatted_totalEarning = formatted_totalEarning.replace(",", '');
              formatted_totalEarning = parseFloat(formatted_totalEarning);
            }

            var item = new TeamInfo({
                teamname: team.teamname,
                country: team.country,
                totalEarning: formatted_totalEarning,
                upsert: true
            });
            TeamInfo.update({teamname: team.teamname}, item, {upsert: true}, function (err) {
              if(err)
                console.log(err);
            });
        }
    });

}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

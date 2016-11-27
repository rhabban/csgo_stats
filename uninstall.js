var mongoose = require('mongoose');

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
});

var MajorEvent = mongoose.model('MajorEvent', majorEventSchema);
var MinorEvent = mongoose.model('MinorEvent', minorEventSchema);
var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

function removeDatabase() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        MajorEvent.remove({}, function(err) {
            console.log('MajorEvent removed') ;
        });
        MinorEvent.remove({}, function(err) {
            console.log('MinorEvent removed') ;
        });
        TeamInfo.remove({}, function(err) {
            console.log('TeamInfo removed') ;
            process.exit();
        });
    });

}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

removeDatabase();

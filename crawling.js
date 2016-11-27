var exec = require('child_process').exec; // exec OS commands
var spawn = require('child_process').spawn; // exec OS commands
var util = require('util');
var MongoClient = require('mongodb').MongoClient;

try {
    var config = require('./config.json');
} catch (err) {
    console.log('Impossible de lire le fichier config.json');
    process.exit();
}

var majorEvents;
var minorEvents;
var teamInfo;

// crawl major events
exec('scrapy crawl majorevents -t json --nolog -o - > "majorevents.json"', {
    cwd: 'scrapy/csgostats'
}, function (error, stdout, stderr) {
    console.log("majorevents crawled");
    majorEvents = require('./scrapy/csgostats/majorevents.json');
});

// crawl minor events
exec('scrapy crawl minorevents -t json --nolog -o - > "minorevents.json"', {
    cwd: 'scrapy/csgostats'
}, function (error, stdout, stderr) {
    console.log("minorevents crawled");
    minorEvents = require('./scrapy/csgostats/minorevents.json');
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
    var url = 'mongodb://localhost:27017/CSGO_STATS';
    MongoClient.connect(url, function(err, db) {
        console.log("Inserting MajorEvents");
        var items_majorEvents = [];
        for (var i = 0; i < majorEvents.length; i++) {
            var event = majorEvents[i];
            //this removes the first two unexpected chars
            var location = event.location.toString().substring(2);
            var prizepool = convertPrice(event.prizepool[0]);
            var item = {
                name: event.name,
                location: location,
                prizepool: prizepool,
                winner: event.winner,
                runnerUp: event.runnerUp,
                date: event.date,
                country: event.country,
            };
            items_majorEvents.push(item);
        }
        insertItems(db, "majorevents", items_majorEvents);

        console.log("Inserting MinorEvent");
        var items_minorEvents = [];
        for (var i = 0; i < minorEvents.length; i++) {
            var event = minorEvents[i];
            //this removes the first two unexpected chars
            var location = event.location.toString().substring(2);
            var prizepool = convertPrice(event.prizepool[0]);
            var item = {
                name: event.name,
                location: location,
                prizepool: prizepool,
                winner: event.winner,
                runnerUp: event.runnerUp,
                date: event.date,
                country: event.country,
            };
            items_minorEvents.push(item);
        }
        insertItems(db, "minorevents", items_minorEvents);

        console.log("Inserting teamInfo");
        var items_teamInfo = [];
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
            var item = {
                teamname: team.teamname,
                country: team.country,
                totalEarning: formatted_totalEarning,
                upsert: true
            };
            items_teamInfo.push(item);
        }
        insertItems(db, "teaminfos", items_teamInfo);

    });
}

function convertPrice(str_price){
    price = stripAlphaChars(str_price);
    if(!price){
        return 0;
    }
    if(str_price.indexOf('$') > -1){
        return price;
    } else {
        if(str_price.indexOf('€') > -1){
            price = Math.round(price*config.EURtoUSD);
        } else if(str_price.indexOf('¥') > -1) {
            price = Math.round(price*config.CNYtoUSD);
        } else if(str_price.indexOf('£') > -1){
            price = Math.round(price*config.GBPtoUSD);
        } else if(str_price.indexOf('kr') > -1){
            price = Math.round(price*config.SEKtoUSD);
        } else if(str_price.indexOf('NOK') > -1){
            price = Math.round(price*config.NOKtoUSD);
        } else if(str_price.indexOf('R') > -1){
            price = Math.round(price*config.BRLtoUSD);
        } else if(str_price.indexOf('z') > -1){
            price = Math.round(price*config.PLNtoUSD);
        }else {
            return price;
        }
        return 0;
    }
}

function stripAlphaChars(source) {
  return source.replace(/[^.0-9]/g, '');
}

function insertItems(db, collectionName, items){
    console.log(collectionName);
    var col = db.collection(collectionName);
    col.insert(items, function(err,result){
        if(err){
            console.log(err);
        } else {
            if(collectionName == "teaminfos"){
                console.log(collectionName+" done");
                db.close();
                process.exit();
            }
        }
    });
}

var mongoose = require('mongoose');
var async = require('async');
var jsonfile = require('jsonfile')

var teamInfoSchema = mongoose.Schema({
    teamname: String,
    country: String,
    totalEarning: Number,
});

var TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);

function getTeamInfo() {
    var db = getConnection();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        TeamInfo.find({}, function (err, teams) {
            if(err)
              console.log(err);
            db.close();
            createJson(teams);
        });
    });
}

function getConnection(){
    mongoose.connect('mongodb://localhost/CSGO_STATS');
    var db = mongoose.connection;
    return db;
}

function createJson(teams){
    var childrens = [];
    var tmp_childrens = [];
    async.each(teams, function(team, callback){
        var children = {name:team.teamname, size:team.totalEarning, children:[]};
        if(children.size > 0){
            if(!tmp_childrens[team.country])
                tmp_childrens[team.country] = [];
            tmp_childrens[team.country].push({name:team.teamname+' : '+team.totalEarning+'$', size:team.totalEarning});
        }
        callback();
    }, function(err){
        if(err)
            console.log(err);
        else {
          console.log("End of first teams loop");
          for (var key in tmp_childrens) {
              childrens.push({name: key, children: tmp_childrens[key]});
          }
          console.log("End of second teams loop");
          res = {name:"flare", children: childrens};
          var file = 'js/teams_data.json';
          jsonfile.writeFile(file, res, function(err) {
              if(err)
                  console.error(err)
          });
        }
    });
}

getTeamInfo();

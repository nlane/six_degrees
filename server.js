var http = require('http');
var express = require('express');
var mysql = require('mysql');
var PythonShell = require('python-shell');

var router = express();
var server = http.createServer(router);

var USERNAME = "nlane";
var PORT = "47461";
var PWD = USERNAME.split('').reverse().join('');

var con = mysql.createConnection({
  host : "orioles1",
  user : USERNAME,
  password : PWD,
  database : "nlane2"
});

con.connect();


router.get('/', function(req, res){
  res.send("Welcome to Six Degrees of Kevin Bacon by Danielle, Kalina, and Natalie!");
});


router.get('/:FirstName1/:LastName1/:FirstName2/:LastName2', function(req, res){
  var actors = [];
  con.query("(select ActorId from Actors where FirstName = ' " + req.params.FirstName1 
            + "' and LastName = '" + req.params.LastName1 + "' limit 1) union (select ActorId from Actors where FirstName= ' " 
            + req.params.FirstName2 + "' and LastName= '" + req.params.LastName2 + "' limit 1)", function(err, rows, fields){
    if (!err && (rows.length === 2)){
       rows.forEach(function(row){
            actors.push(row["ActorId"]);
        });
        var options = {
          mode: 'text',
          args: [actors[0], actors[1]]
        };
        PythonShell.run('findActorScript.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

router.get('/decade/:year/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
  var year = req.params.year;
  var sending = [];
   con.query("(select ActorId from Actors where FirstName = ' " + req.params.Actor1F 
            + "' and LastName = '" + req.params.Actor1L + "' limit 1) union (select ActorId from Actors where FirstName= ' " 
            + req.params.Actor2F + "' and LastName= '" + req.params.Actor2L + "' limit 1)", function(err, rows, fields){
    if (!err && (rows.length === 2)){
       rows.forEach(function(row){
            sending.push(row["ActorId"]);
        });
        sending.push(year);
        sending.push("Year");
        var options = {
          mode: 'text',
          args: [sending[0], sending[1], sending[2], sending[3]]
        };
        PythonShell.run('findActorScript.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

router.get('/director/:FirstName/:LastName/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
 var sending = [];
   con.query("(select ActorId from Actors A where A.FirstName =' " + req.params.Actor1F 
            + "' and A.LastName='" + req.params.Actor1L + "' limit 1) union (select ActorId from Actors B where B.FirstName=' " + req.params.Actor2F
            + "' and B.LastName = '" + req.params.Actor2L + "' limit 1) union (select DirectorId from Directors D where D.FirstName=' " 
            + req.params.FirstName + "' and D.LastName='" + req.params.LastName + "' limit 1)", function(err, rows, fields){
    if (!err && (rows.length === 3)){
      rows.forEach(function(row){
            sending.push(row["ActorId"]);
        });
        sending.push("Director");
        var options = {
          mode: 'text',
          args: [sending[0], sending[1], sending[2], sending[3]]
        };
        PythonShell.run('findActorScript.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

router.get('/writer/:FirstName/:LastName/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
  var sending = [];
   con.query("(select ActorId from Actors A where A.FirstName =' " + req.params.Actor1F 
            + "' and A.LastName='" + req.params.Actor1L + "' limit 1) union (select ActorId from Actors B where B.FirstName=' " + req.params.Actor2F
            + "' and B.LastName = '" + req.params.Actor2L + "' limit 1) union (select WriterId from Writers W where W.FirstName=' " 
            + req.params.FirstName + "' and W.LastName='" + req.params.LastName + "' limit 1)", function(err, rows, fields){
    if (!err && (rows.length === 3)){
      rows.forEach(function(row){
            sending.push(row["ActorId"]);
        });
        sending.push("Writer");
        var options = {
          mode: 'text',
          args: [sending[0], sending[1], sending[2], sending[3]]
        };
        PythonShell.run('findActorScript.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});


server.listen(PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
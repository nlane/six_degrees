var http = require('http');
var express = require('express');
var mysql = require('mysql');
// var PythonShell = require('python-shell');

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

// var options = {
//   mode: 'text',
//   // pythonPath: 'path/to/python',
//   // pythonOptions: ['-u'],
//   // scriptPath: 'path/to/my/scripts',
//   args: ['5']
// };
 
// PythonShell.run('somescript.py', options, function (err, results) {
//   if (err) throw err;
//   // results is an array consisting of messages collected during execution 
//   console.log('results: %j', results);
// });


router.get('/', function(req, res){
  res.send("Welcome to Six Degrees of Kevin Bacon!");
});

router.get('/:FirstName1/:LastName1/:FirstName2/:LastName2', function(req, res){
  var Actor1;
  var Actor2;
  con.query("Select ActorId from Actors where FirstName = ' " + req.params.FirstName1 + "' and LastName = '" + req.params.LastName1 + "'", function(err, rows, fields){
    if (!err){
      Actor1 = rows;
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
  con.query("Select ActorId from Actors where FirstName = ' " + req.params.FirstName2 + "' and LastName = '" + req.params.LastName2 + "'", function(err, rows, fields){
   if (!err){
    Actor2 = rows;
   } else {
    res.json({error: "Make sure you typed the name correctly! :)"});
   }
  });
  res.json({Actor1Id:Actor1, Actor2Id:Actor2});
});

server.listen(PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
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

router.get('/test', function(req, res){
  con.query("Select * from Actors where ActorId = 1", function(err, rows, fields){
    if (!err){
      res.json(rows);
    } else {
      res.json({error: "SQL failed"});
    }
  });
});

server.listen(PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
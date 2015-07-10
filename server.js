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
  res.send("Welcome to Six Degrees of Kevin Bacon :)!");
});

router.get('/test/:variable', function(req, res){
  res.send(req.params.variable == 0);
});

router.get('/:FirstName1/:LastName1/:FirstName2/:LastName2', function(req, res){
  var actors = [];
  con.query("Select ActorId from Actors where (FirstName = ' " + req.params.FirstName1 
            + "' and LastName = '" + req.params.LastName1 + "') or (FirstName= ' " 
            + req.params.FirstName2 + "' and LastName= '" + req.params.LastName2 + "')", function(err, rows, fields){
    if (!err){
       rows.forEach(function(row){
            actors.push(row["ActorId"]);
        });
        var options = {
          mode: 'text',
          // pythonPath: 'path/to/python',
          // pythonOptions: ['-u'],
          // scriptPath: 'path/to/my/scripts',
          args: [actors[0], actors[1]]
        };
        PythonShell.run('actornodeDB_notab.py', options, function (err, results) {
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
  var actors = [];
  con.query("Select ActorId from Actors where (FirstName = ' " + req.params.FirstName1 +
            "' and LastName = '" + req.params.LastName1 + "') or (FirstName= ' " 
            + req.params.FirstName2 + "' and LastName= '" + req.params.LastName2 + "')", function(err, rows, fields){
    if (!err){
       rows.forEach(function(row){
            actors.push({ActorId:row["ActorId"]});
        });
        res.send(actors);
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

router.get('/director/:FirstName/:LastName/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
  var FirstName = req.params.FirstName;
  var LastName = req.params.LastName;
   con.query("Select DirectorId, ActorId from Directors D natural join Actors A where D.FirstName = ' " 
              + FirstName + "' and D.LastName = '" + LastName + "' and ((A.FirstName=' " + req.params.Actor1F 
              + "' and A.LastName='" + req.params.Actor1L +"') or (A.FirstName=' " + req.params.Actor2F 
              + "', A.LastName='" + req.params.Actor2L + "'))", function(err, rows, fields){
    if (!err){
      res.send(rows);
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

router.get('/writer/:FirstName/:LastName/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
   con.query("select ActorId from Actors A where (A.FirstName =' " + req.params.Actor1F 
            + "' and A.LastName='" + req.params.Actor1L + "') or (A.FirstName=' " + req.params.Actor2F
            + "' and A.LastName = '" + req.params.Actor2L + "'); select WriterId from Writers W where W.FirstName=' " 
            + req.params.FirstName + "' and W.LastName='" + req.params.LastName + "';", function(err, rows, fields){
    if (!err){
      res.send(rows);
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});

//select ActorId, WriterId from Actors A, Writers W where (A.FirstName = " Kevin (I)" and A.LastName="Bacon") or (A.FirstName=" Travis" and A.LastName = "Bacon") and (W.FirstName=" Tim (I)" and W.LastName="Burton");



// select ActorId from Actors A where (A.FirstName = " Kevin (I)" and A.LastName="Bacon") or (A.FirstName=" Travis" and A.LastName = "Bacon"); select WriterId from Writers W where W.FirstName=" Tim (I)" and W.LastName="Burton";



router.get('/year/:year/writer/:WriterF/:WriterL/director/:DirectorF/:DirectorL/:Actor1F/:Actor1L/:Actor2F/:Actor2L', function(req, res){
  if ((req.params.year == 0) && (req.params.writer == 0) && (req.params.director == 0)){
      var actors = [];
    con.query("Select ActorId from Actors where (FirstName = ' " + req.params.FirstName1 
            + "' and LastName = '" + req.params.LastName1 + "') or (FirstName= ' " 
            + req.params.FirstName2 + "' and LastName= '" + req.params.LastName2 + "')", function(err, rows, fields){
    if (!err){
      rows.forEach(function(row){
            actors.push(row["ActorId"]);
        });
        var options = {
          mode: 'text',
          // pythonPath: 'path/to/python',
          // pythonOptions: ['-u'],
          // scriptPath: 'path/to/my/scripts',
          args: [actors[0], actors[1]]
        };
        PythonShell.run('actornodeDB_notab.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
  }
  else if ((req.params.year == 0) && (req.params.writer == 0) && (req.params.director != 0)){
  }
  else if ((req.params.year == 0) && (req.params.writer != 0) && (req.params.director == 0)){
    var sending = [];
    con.query("Select ActorId, WriterId from Actors A join Writer W where (A.FirstName = ' " + req.params.FirstName1 
            + "' and A.LastName = '" + req.params.LastName1 + "') or (A.FirstName= ' " 
            + req.params.FirstName2 + "' and A.LastName= '" + req.params.LastName2 + "') and W.FirstName =' "
            + req.params.WriterF + "' and W.LastName = '" + req.params.WriterL + "'", function(err, rows, fields){
    if (!err){
      rows.forEach(function(row){
            sending.push(row["ActorId"]);
        });
        var options = {
          mode: 'text',
          // pythonPath: 'path/to/python',
          // pythonOptions: ['-u'],
          // scriptPath: 'path/to/my/scripts',
          args: [actors[0], actors[1]]
        };
        PythonShell.run('actornodeDB_notab.py', options, function (err, results) {
          if (err) throw err;
          res.send(results);
        });
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
  }
  else if ((req.params.year != 0) && (req.params.writer == 0) && (req.params.director == 0)){
  }
  else if ((req.params.year != 0) && (req.params.writer != 0) && (req.params.director == 0)){
  }
  else if ((req.params.year != 0) && (req.params.writer == 0) && (req.params.director != 0)){
  }
  else if ((req.params.year == 0) && (req.params.writer != 0) && (req.params.director != 0)){
  }
  else if ((req.params.year != 0) && (req.params.writer != 0) && (req.params.director != 0)){
  }
  con.query("Select WriterId, ActorId from Writers W natural join Actors A where W.FirstName = ' " 
              + FirstName + "' and W.LastName = '" + LastName + "' and ((A.FirstName=' " + req.params.Actor1F 
              + "' and A.LastName='" + req.params.Actor1L +"') or (A.FirstName=' " + req.params.Actor2F 
              + "', A.LastName='" + req.params.Actor2L + "'))", function(err, rows, fields){
    if (!err){
      res.send(rows);
    } else {
      res.json({error: "Make sure you typed the name correctly! :)"});
    }
  });
});



server.listen(PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
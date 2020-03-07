var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const mongo = require("./db/connection");
var mong = require('mongodb')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

function isRegistered(str) {
  if (typeof str === "undefined"){
    return
  }
  var user = str.substring(0, str.length - 13);
  user = user.substring(14);
  return user
}

var PORT = process.env.PORT || 8080;

mongo.connectToServer( function( err, client ) {
  if (err) console.log(err);
  app.listen(PORT, function(){
    console.log("Listening at port 8080");
  });
} );

app.post('/signup', function (req, res) {
  var db = mongo.getDb();
  var query = { email: req.body.email };
  db.collection("users").find(query).toArray(function(err, result) {
    if (err) throw err;

    if(typeof result[0] === "undefined"){
      if (req.body.email.length < 5 || req.body.password.length < 8){
        res.send("Email min length 5\nPassword min length 8")
      }
      else{
        var myobj = { email: req.body.email, password: req.body.password, adminFlag: req.body.adminFlag, token: req.body.token };
        db.collection("users").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 users inserted");
        });
        if(req.body.adminFlag === "true"){
          db.collection("token").find({ token: req.body.token }).toArray(function(err, result) {
            if(typeof result[0] === "undefined"){
              console.log("He's not an admin!");
              var myquery = { email: req.body.email };
              var newvalues = { $set: {adminFlag: "false"}};
              db.collection("users").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 users updated");
              });
            }
          });
        }
        res.send("Registered")
      }
    }
    else{
      res.send("Email already used")
    }
  });
})

app.post('/login', function (req, res) {
  var db = mongo.getDb();
  var query = { email: req.body.email, password: req.body.password};
  db.collection("users").find(query).toArray(function(err, result) {
    if (err) throw err;
    if(typeof result[0] === "undefined"){
      res.send("Wrong email and/or password")
    }
    else{
      var d = new Date();
      var n = d.getTime();
      res.cookie('access_cookie', req.body.password+req.body.email+n, {expires: new Date(Date.now() + 900000)});
      res.send("Logged in!")
    }
  });
});

app.get('/user', function (req, res) {
  var db = mongo.getDb();
  var str = req.headers.cookie
  var user = isRegistered(str)
  db.collection("users").find().toArray(function(err, result) {
    result = result.find(x => encodeURIComponent(x.password+x.email) === user)
    if(typeof result === 'undefined'){
      var a = {msg: "not exits"}
      res.send(a)
    }
    else{
      res.send(result)
    }
  })
})

app.get('/discussions', function (req, res) {
  var db = mongo.getDb();
  db.collection("topic").find().toArray(function(err, result) {
    res.send(result)
  })
})

app.post('/discussions', function (req, res) {
  var db = mongo.getDb();
  var str = req.headers.cookie
  var user = isRegistered(str)
  db.collection("users").find().toArray(function(err, result) {
    result = result.find(x => encodeURIComponent(x.password+x.email) === user)
    if(typeof result === 'undefined'){
      var a = {msg: "not authorized!"}
      res.send(a)
    }
    else{
      req.body.my_msg = [];
      req.body.author = req.body.author.replace(/[^a-z^A-Z ^0-9\^_]+/g, "");
      req.body.title = req.body.title.replace(/[^a-z^A-Z ^0-9\^_]+/g, "");
      var myobj = { author: req.body.author, title: req.body.title, my_msg: req.body.my_msg };
      db.collection("topic").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 topic inserted");
      });
      var a = {msg: "Added!"}
      res.send(a)
    }
  })
})

app.get('/msg', function (req, res, err) {
  var db = mongo.getDb();
  var idPage = req.query.id
  var o_id = new mong.ObjectID(idPage);
  var query = { "_id": o_id};
  db.collection("topic").find(query).toArray(function(err, result) {
    if(typeof result[0] === "undefined"){
      var a = {msg: "not exits"}
      res.send(a)
    }
    else{
      res.send(result[0].my_msg)
    }
  });
})

app.post('/msg', function (req, res, err) {
  var db = mongo.getDb();
  var str = req.headers.cookie
  var user = isRegistered(str)
  db.collection("users").find().toArray(function(err, result) {
    result = result.find(x => encodeURIComponent(x.password+x.email) === user)
    if(typeof result === 'undefined'){
      var a = {msg: "not authorized!"}
      res.send(a)
    }
    else{
      var idPage = req.query.id
      req.body.author = req.body.author.replace(/[^a-z^A-Z ^0-9\^_]+/g, "");
      req.body.msg = req.body.msg.replace(/[^a-z^A-Z ^0-9\^_]+/g, "");
      var o_id = new mong.ObjectID(idPage);
      var to_push = {"author": req.body.author, "msg": req.body.msg}
      var myobj = {"_id": o_id}
      var my_subObj = {$push : { "my_msg": to_push }}
      db.collection("topic").updateOne(myobj, my_subObj, function(err, res) {
        if (err) throw err;
        console.log("1 message added");
      });
      var a = {msg: "Added!"}
      res.send(a)
    }
  })
})

app.get("/img", function(req,res){
  var db = mongo.getDb();
  var idPage = req.query.id
  var o_id = new mong.ObjectID(idPage);
  var query = { "_id": o_id};
  db.collection("topic").find(query).toArray(function(err, result) {
    if(typeof result[0] === "undefined"){
      var a = {msg: "not exits"}
      res.send(a)
    }
    else{
      res.send(result[0].img)
    }
  });
})

app.post('/img', function (req, res) {
  var db = mongo.getDb();
  var str = req.headers.cookie
  var user = isRegistered(str)
  db.collection("users").find().toArray(function(err, result) {
    result = result.find(x => encodeURIComponent(x.password+x.email) === user)
    if(typeof result === 'undefined'){
      var a = {msg: "not authorized!"}
      res.send(a)
    }
    else if(result.adminFlag !== "true"){
      var a = {msg: "not authorized!"}
      res.send(a)
    }
    else{
      var idPage = req.query.id
      req.body.src = req.body.src.replace(/[^(+)a-z^A-Z^0-9!./ \[\]\^_+]+/g, "");
      req.body.onerror = req.body.onerror.replace(/[^(+)a-z^A-Z^0-9!./ \[\]\^_+]+/g, "");
      var o_id = new mong.ObjectID(idPage);
      var myobj = {"_id": o_id}
      db.collection("topic").find(myobj).toArray(function(err, result) {
        if(typeof result[0] === "undefined"){
          console.log("This page doesn't exists!");
          var a = {msg: "The page not exists!"}
          res.send(a)
        }
        else{
          var newvalues = { $set: {img: {src:req.body.src, onerror: req.body.onerror}}};
          db.collection("topic").updateOne(myobj, newvalues, function(err, res) {
            if (err) throw err;
          });
          var a = {msg: "Image changed!"}
          res.send(a)
        }
      });
    }
  })
})

app.get('/flag',function (req, res) {
  var db = mongo.getDb();
  var str = req.headers.cookie
  if (typeof str === "undefined"){
    res.send("TOP SECRET ZONE")
  }
  cookie = str.substring(14);
  str = cookie.substring(0, cookie.length - 13);
  db.collection("token").find().toArray(function(err, result) {
    if(result[0].token[0] === str){
      db.collection("flag").find().toArray(function(err, result) {
        res.send(result[0].secret)
      });
    }
    else{
      res.send("TOP SECRET ZONE")
    }
  });
})

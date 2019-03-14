var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var router = express.Router();

var conn = mysql.createConnection({
  host:'localhost',
  port:'3306',
  user:'root',
  password:'1111',
  database:'ms'
})
conn.connect();

router.use(bodyParser.urlencoded({extended:false}));
router.use(cookieParser());

router.get('/signup', function(req, res){
  res.render('signup');
})

router.post('/signup', function(req, res){
  var id = req.body.id;
  var pw = req.body.pw;
  var name = req.body.name;
  var age = req.body.age;

  var query = 'insert into user values ("' + id + '", "' + pw + '", "' + name + '", ' + age + ')';
  conn.query(query, function(err, result){
    if(err) throw err;
    console.log("id : " + id);
    console.log("pw : " + pw);
    console.log("name : " + name);
    console.log("age : " + age);

    console.log("Insert Success");

    res.redirect('/board/Main');
  })
})

exports.router = router;

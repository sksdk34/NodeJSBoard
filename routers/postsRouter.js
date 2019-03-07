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

router.get('/posts', function(req, res){
  var query = 'select * from posts';

  conn.query(query, function(err, rows){
    if(err) throw err;
    var postsList = new Array();

    for (var i = 0; i < rows.length; i++) {
      var data = new Object;
      data = rows[i];
      postsList.push(data);
    }
    var jsonData = JSON.stringify(postsList);
    res.render('index', {result:jsonData});
  })
})

router.get('/posts/create', function(req, res){
  res.render('create');
})

router.post('/posts/create', function(req, res){
  var title = req.body.title;
  var body = req.body.body;
  var id = req.body.id;
  var no;

  var query1 = 'select no from posts order by no desc limit 1';
  conn.query(query1, function(err, rows){
    if(err) throw err;
    no = rows[0];
    console.log(no);
  })

  console.log("title : " + title);
  console.log("body : " + body);
  console.log("id : " + id);

  var query2 = 'insert into posts values (4, "' + title + '" , "' + body + '" , "' + id + '" ,now())';
  conn.query(query2, function(err, result){
    if(err) throw err;
    console.log("Insert Success");
  })
})

exports.router = router;

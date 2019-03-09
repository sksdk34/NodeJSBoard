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

router.get('/Login', function(req, res){
  fs.readFile(__dirname + '/views/Login.html', function(err, data){
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(data);
  })
})

router.post('/Login', function(req, res){
  var id = req.body.id;
  var pw = req.body.pw;

  console.log('입력받은 id : ' + id);
  console.log('입력받은 pw : ' + pw)

  var query = 'select * from test';
  conn.query(query, function(err, rows){
    if(err) throw err;
    if(id == rows[0].id && pw == rows[0].pw){
      console.log('Login Success');

      res.cookie('login', id);
      res.redirect('/board/posts');
    }else{
      res.redirect('/board/Login');
    }
  })
})

exports.router = router;

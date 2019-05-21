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

router.get('/Main', function(req, res){
  if(req.cookies.login){
    res.redirect('/board/posts');
  }else{
    fs.readFile(__dirname + '/views/Main.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
      })
  }
})

exports.router = router;

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

//게시글 메인페이지
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
    res.render('posts', {result:jsonData});
  })
})

//게시글 작성페이지
router.get('/posts/create', function(req, res){
  res.render('create');
})

//게시글 작성 처리
router.post('/posts/create', function(req, res){
  var title = req.body.title;
  var body = req.body.body;
  var id = req.cookies.login;
  var no;

  var query1 = 'select no from posts order by no desc limit 1';
  conn.query(query1, function(err, result){
    if(err) throw err;
    no = result[0].no;
    no += 1;

    var query2 = 'insert into posts (no, title, body, id, time) values (' + no + ', "' + title + '" , "' + body + '" , "' + id + '" ,now())';
    conn.query(query2, function(err, result){
      if(err) throw err;

      console.log("no : " + no);
      console.log("title : " + title);
      console.log("body : " + body);
      console.log("id : " + id);

      console.log("Insert Success");

      res.redirect('/board/posts');
    })
  })
})

//상세보기 페이지
router.get('/posts/detail/:no', function(req, res){
  var query = 'select * from posts where no = ?'
  conn.query(query, req.params.no, function(err, result){
    if(err) throw err;

    var detail = new Object;
    data = result[0];

    var jsonData = JSON.stringify(data);
    console.log(jsonData);
    res.render('detail', {result:jsonData, no:req.params.no});
  })
})

//게시글 삭제
router.get('/posts/detail/:no/delete', function(req, res){
  var query1 = 'select id from posts where no = ?';
  conn.query(query1, req.params.no, function(err, result){
    if(err) throw err;
    console.log('del test1');
    console.log(result[0].id);
    var id = req.cookies.login;
    console.log(id);
    if(result[0].id == id){
      var query2 = 'delete from posts where no = ?';
      conn.query(query2, req.params.no, function(err, result){
        if(err) throw err;
        console.log('del test2');
        res.redirect('/board/posts');
      })
    }else{
      console.log("delete failed");
    }
  })
})

//로그아웃
router.get('/posts/logout', function(req, res){
  res.clearCookie('login');
  res.redirect('/board/Main');
})

exports.router = router;

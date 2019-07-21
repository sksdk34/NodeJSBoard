var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mysql = require('mysql'); //mysql 모듈
var multer = require('multer'); //파일 업로드 모듈
var upload = multer({dest: 'uploads/'}) //입력한 파일이 uploads/ 폴더에 저장
var router = express.Router();

var conn = mysql.createConnection({
  host:'localhost',
  port:'3306',
  user:'root',
  password:'1111',
  database:'n_board'
})
conn.connect();

router.use(bodyParser.urlencoded({extended:false}));
router.use(cookieParser());

//게시글 메인페이지
router.get('/posts', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
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
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//게시글 작성페이지
router.get('/posts/create', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    res.render('create');
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//게시글 작성 처리
router.post('/posts/create', upload.single('uploadFile'), function(req, res){
  var title = req.body.title;
  var content = req.body.content;
  var writer = req.cookies.login;
  var originalname = req.file.originalname;
  var filename = req.file.filename;

  var query = 'insert into posts (title, content, writer, date, filename, path) values ("' + title + '" , "' + content + '" , "' + writer + '" ,now(), "' + originalname + '", "' + filename + '")';
  conn.query(query, function(err, result){
    if(err) throw err;

    console.log("title : " + title);
    console.log("body : " + content);
    console.log("id : " + writer);
    console.log("orginalname : " + originalname);
    console.log("filename : " + filename);
    console.log(req.file);

    console.log("Insert Success");

    res.redirect('/board/posts');
  })

})

//상세보기 페이지
router.get('/posts/detail/:no', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    var query = 'select * from posts where no = ?'
    conn.query(query, req.params.no, function(err, result){
      if(err) throw err;

      var detail = new Object;
      data = result[0];

      var jsonData = JSON.stringify(data);
      console.log("DETAIL" + req.params.no);
      console.log(jsonData);
      res.render('detail', {result:jsonData, no:req.params.no});
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//파일 다운로드
router.get('/posts/detail/:no/download', function(req, res){

  var query = 'select * from posts where no = ?';
  conn.query(query, req.params.no, function(err, result){

    var originalname = result[0].filename;
    var path = __dirname + '/../uploads/' + result[0].path;
    console.log(originalname);
    console.log(path);

    res.setHeader("Content-Disposition", "attachment;filename=" + encodeURI(originalname));
    res.setHeader("Content-Type","binary/octet-stream");
    // filePath에 있는 파일 스트림 객체를 얻어온다.(바이트 알갱이를 읽어옵니다.)
    var fileStream = fs.createReadStream(path);
    // 다운로드 한다.(res 객체에 바이트알갱이를 전송한다)
    fileStream.pipe(res);
  })
})

//게시글 삭제
router.get('/posts/detail/:no/delete', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    var query1 = 'select writer from posts where no = ?';
    conn.query(query1, req.params.no, function(err, result){
      if(err) throw err;
      console.log('del test1');
      console.log(result[0].writer);
      var id = req.cookies.login;
      console.log(id);
      if(result[0].writer == id){
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
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//검색
router.post('/posts/search', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    var query = 'select * from posts where title like ?';
    conn.query(query, '%'+ req.body.search +'%', function(err, result){
      if(err) throw err;

      var postsList = new Array();
      for (var i = 0; i < result.length; i++) {
        var data = new Object;
        data = result[i];
        postsList.push(data);
      }
      var jsonData = JSON.stringify(postsList);
      res.render('search', {result:jsonData});
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//수정
router.get('/posts/detail/:no/update', function(req, res){
  var check = req.cookies.login;

  if(check != null){

    var query = 'select * from posts where no = ?';
    conn.query(query, req.params.no, function(err, result){
      if(err) throw err

      var data = new Object;
      data = result[0];

      var jsonData = JSON.stringify(data);
      console.log("UPDATE" + req.params.no + "PAGE");
      console.log(jsonData);

      res.render('update', {result:jsonData});
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//수정 처리
router.post('/posts/detail/:no/update', function(req, res){
  var check = req.cookies.login;

  if(check != null){
    var title = req.body.title;
    var content = req.body.content;
    var writer = req.cookies.login;
    var no = req.params.no;

    var query = 'update posts set title="'+ title +'", content="'+ content +'", writer="'+ writer +'", date=now() where no='+ no;
    conn.query(query, function(err, result){
      if(err) throw err;

      console.log("no : " + no);
      console.log("title : " + title);
      console.log("content : " + content);
      console.log("writer : " + writer);

      console.log("Update Success");

      res.redirect('/board/posts');
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//로그아웃
router.get('/posts/logout', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    res.clearCookie('login');
    res.redirect('/board/Main');
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

router.get('/test', function(req, res){

  res.render('test');
})

router.post('/test', upload.single('userfile'), function(req,res){

  console.log(req.file);
  console.log(req.file.originalname);

  res.send(req.file.originalname);
})

exports.router = router;

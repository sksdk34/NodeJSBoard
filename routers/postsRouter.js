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
  database:'n_board',
  multipleStatements: true
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

  if(req.file != null){ //파일첨부 했을때 작성처리
    var title = req.body.title;
    var content = req.body.content;
    var writer = req.cookies.login;
    var originalname = req.file.originalname;
    var filename = req.file.filename;

    var query = 'INSERT INTO posts (title, content, writer, date, filename, path) values (?, ?, ?, now(), ?, ?)'
    conn.query(query, [title, content, writer, originalname, filename], function(err, result){
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
  }else{ //파일첨부 안했을 때 작성 처리
    var title = req.body.title;
    var content = req.body.content;
    var writer = req.cookies.login;

    var query = 'INSERT INTO posts (title, content, writer, date) values (?, ?, ?, now())'
    conn.query(query, [title, content, writer], function(err, result){
      if(err) throw err;

      console.log("title : " + title);
      console.log("body : " + content);
      console.log("id : " + writer);

      console.log("Insert Success");

      res.redirect('/board/posts');
    })
  }
})

//상세보기 페이지
router.get('/posts/detail/:no', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    //게시글
    var query = 'select * from posts where no = ?'
    conn.query(query, req.params.no, function(err, result){
      if(err) throw err;

      var data = new Object;
      data = result[0];

      //댓글
      var query2 = 'select * from comments where no = ?'
      conn.query(query2, req.params.no, function(err, result){
        if(err) throw err;

        var commentList = new Array();
        for(var i=0; i<result.length; i++){
          var comment = new Object;
          comment = result[i];
          commentList.push(comment);
        }
        var jsonComments = JSON.stringify(commentList);

        var jsonData = JSON.stringify(data);
        console.log("DETAIL" + req.params.no);
        res.render('detail', {result:jsonData, no:req.params.no, comments:jsonComments});
      })
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//댓글작성 처리
router.post('/posts/detail/:no', function(req, res){
  var check = req.cookies.login;

  if(check != null)
  {
    var no = req.params.no;
    var comment = req.body.comment;
    var writer = req.cookies.login;

    var query = 'INSERT INTO comments VALUES (?, ?, ?, now())'
    conn.query(query, [no, comment, writer], function(err, result){
      if(err) throw err;

      console.log("Comment Write");
      res.redirect('/board/posts/detail/' + req.params.no);
    })
  }else{
    fs.readFile(__dirname + '/views/check.html', function(err, data){
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    })
  }
})

//첨부파일 다운로드
router.get('/posts/detail/:no/download', function(req, res){

  var query = 'select * from posts where no = ?';
  conn.query(query, req.params.no, function(err, result){

    var originalname = result[0].filename;
    var path = __dirname + '/../uploads/' + result[0].path; //파일이 실제로 저장된 경로
    console.log(originalname);
    console.log(path);

    res.setHeader("Content-Disposition", "attachment;filename=" + encodeURI(originalname));
    res.setHeader("Content-Type","binary/octet-stream");
    var fileStream = fs.createReadStream(path);
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

      var id = req.cookies.login;
      //작성자와 삭제를 시도하는 사용자가 같으면 삭제처리
      if(result[0].writer == id){
        var query2 = 'SELECT * FROM posts WHERE no = ?';
        conn.query(query2, req.params.no, function(err, result){
          if(err) throw err;

          var path = __dirname + '/../uploads/' + result[0].path;
          fs.unlink(path, function(err){
            if (err) throw err;

            console.log('File Deleted');
            //해당 게시글의 댓글 삭제
            var query3 = 'delete from comments where no = ?';
            conn.query(query3, req.params.no, function(err, result){
              if(err) throw err;

              //게시글 삭제
              var query4 = 'DELETE FROM posts WHERE no = ?';
              conn.query(query4, req.params.no, function(err, result){
                if(err) throw err;

                res.redirect('/board/posts');
              })
            })
          })
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
router.post('/posts/detail/:no/update', upload.single('uploadFile'), function(req, res){
  var check = req.cookies.login;

  if(check != null){

    if(req.file != null){
      var title = req.body.title;
      var content = req.body.content;
      var writer = req.cookies.login;
      var no = req.params.no;
      var originalname = req.file.originalname;
      var filename = req.file.filename;
      var query = 'UPDATE posts SET title=?, content=?, writer=?, date=now(), filename=?, path=? where no = ?';
      conn.query(query, [title, content, writer, originalname, filename, no], function(err, result){
        if(err) throw err;
        console.log("no : " + no);
        console.log("title : " + title);
        console.log("content : " + content);
        console.log("writer : " + writer);

        console.log("Update Success");

        res.redirect('/board/posts');
      })
    }else{
      var title = req.body.title;
      var content = req.body.content;
      var writer = req.cookies.login;
      var no = req.params.no;

      var query = 'UPDATE posts SET title=?, content=?, writer=?, date=now(), filename=null, path=null where no = ?';
      conn.query(query, [title, content, writer, no], function(err, result){
        if(err) throw err;

        console.log("no : " + no);
        console.log("title : " + title);
        console.log("content : " + content);
        console.log("writer : " + writer);

        console.log("Update Success");

        res.redirect('/board/posts');
      })
    }
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

//파일삭제 테스트
router.get('/posts/detail/:no/fileDel', function(req, res){

  var query = 'SELECT * FROM posts WHERE no = ?';
  conn.query(query, req.params.no, function(err, result){
    fs.unlink(__dirname + '/../uploads/' + result[0].path, function(err){
      if (err) throw err;
      console.log('File deleted!');
    })
  })
})

exports.router = router;

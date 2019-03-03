var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var app = express();

app.use('/board', require("./routers/mainRouter").router);
app.use('/board', require("./routers/loginRouter").router);

app.all('*', function(req, res){
  res.status(404).send('404 ERROR');
})

app.listen(3000, function(){
  console.log('Server Run');
})

var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.set('views', './routers/views');

app.use('/board', require("./routers/mainRouter").router);
app.use('/board', require("./routers/loginRouter").router);
app.use('/board', require("./routers/postsRouter").router);
app.use('/board', require("./routers/signupRouter").router);

app.all('*', function(req, res){
  res.status(404).send('404 ERROR');
})

app.listen(3000, function(){
  console.log('Server Run');
})

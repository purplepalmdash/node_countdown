var createError = require('http-errors');
var express = require('express');
var engine = require('ejs-locals');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Stopwatch = require('./models/stopwatch');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Added by dash
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//var io = require('socket.io')(server)
//(server,{
//  transports  : [ 'xhr-polling' ]
//});
//
server.listen(80);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout:'views/layout.ejs' });
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//// status indicator
//var status = "All is well.";
//
//io.sockets.on('connection', function (socket) {  
//  io.sockets.emit('status', { status: status }); // note the use of io.sockets to emit but socket.on to listen
//  socket.on('reset', function (data) {
//    status = "War is imminent!";
//    io.sockets.emit('status', { status: status });
//  });
//});
//
//var countdown = 1000;  
//setInterval(function() {  
//  countdown--;
//  io.sockets.emit('timer', { countdown: countdown });
//}, 1000);
//
//io.sockets.on('connection', function (socket) {  
//  socket.on('reset', function (data) {
//    countdown = 1000;
//    io.sockets.emit('timer', { countdown: countdown });
//  });
//});

var stopwatch = new Stopwatch();
stopwatch.on('tick:stopwatch', function(time) {
  io.sockets.emit('time', { time: time });
});

stopwatch.on('reset:stopwatch', function(time) {
  io.sockets.emit('time', { time: time });
});

stopwatch.start();

io.sockets.on('connection', function (socket) {
  io.sockets.emit('time', { time: stopwatch.getTime() });

  socket.on('click:start', function () {
    stopwatch.start();
  });
  
  socket.on('click:stop', function () {
    stopwatch.stop();
  });

  socket.on('click:reset', function () {
    stopwatch.reset();
  });
});





module.exports = app;

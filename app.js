
/**
 * Module dependencies.
 */

var express = require('express')
  , connect = require('connect')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');



var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//Get request to the index page

app.get('/', function(req,res){
  res.render('index');
});

app.get('/karthik',function(req,res){
  res.redirect('www.github.com/karthikkp');
})

app.get('/admin',function(req,res){
  res.render('admin',{rooms:io.sockets.manager.rooms});
})

//Socket functions

io.sockets.on('connection',function(socket){
  //when ever there is a new socket connection 
  //we update the rooms on that user

  socket.emit('update_rooms',io.sockets.manager.rooms);
  socket.on('new_user',function(nickname){
    socket.name = nickname;
  });

  //On creating a new room,we check
  //1.if user is already in a room
  //2.if he is, then we check if that 
  //room will be empty if the user leaves
  //3.if it is then we emit to all sockets to remove that room the page
  //then the users leaves the room,joins the new room
  //and socket.room is updated with the new room

  socket.on('new_room',function(room){
    if(socket.room){
      if(io.sockets.manager.rooms["/"+socket.room].length<2){
          io.sockets.emit('remove_room',socket.room);
        }
      socket.leave(socket.room);
    }
    socket.room=room;
    socket.join(room);
    socket.broadcast.emit('new_room',room);
  });

  //changing a room ,something similar to what is done on a new room is done

  socket.on('change_room',function(room){

    if(io.sockets.manager.rooms[room].length<2){
      if(socket.room){
        if(io.sockets.manager.rooms["/"+socket.room].length<2){
          io.sockets.emit('remove_room',socket.room);
        }
        socket.leave(socket.room);
      }
        socket.join(room);
        socket.room = room;

        // we emit a status message to that socket telling if the user was able to join or not
        socket.emit('status_of_join',true);
      }
    else{
      socket.emit('status_of_join',false);
    }
    });
//socket events to draw on the canvas
  
  socket.on('mousedown',function(x,y){
  io.sockets.in(socket.room).emit('mousedownn',x,y);
  });

  socket.on('mouseup',function(){
    io.sockets.in(socket.room).emit('mouseupp');
  });

  socket.on('mousemove',function(x,y){
    io.sockets.in(socket.room).emit('mousemovee',x,y);
  });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//we use expressjs and socket.io
var express = require("express")
var app = express()
var server = require('http').createServer(app);
var io  = require('socket.io').listen(server);
var port = process.env.PORT || 5000

//define routes
app.use(express.static(__dirname + "/"))

var connections = [];
var userInfo = [];

io.sockets.on('connection', function(socket){
	connections.push(socket); //add new connection to connections array

	//generate random id for user
	id = Math.floor(Math.random() * 10000);
	color = '#'+Math.floor(Math.random()*16777215).toString(16);

	userInfo.push([id, color]);

	socket.id = id;
  socket.color = color;


	console.log("New User #" + id + " has connected.");
	console.log("There are " + userInfo.length + " people connected.");


	socket.emit('startConnection', userInfo); //populate screen for new user

  socket.broadcast.emit('newConnection', userInfo); //update current users


	//update on orientation event
  socket.on('orientationEvent', function(data) {
		  data.id = socket.id;
      console.log(data)
      socket.broadcast.emit('update_orientationEvent', data);
  })


	socket.on('mobileUserConnection', function(data) {
			data.id = socket.id;
      socket.broadcast.emit('addNewUsers', data);
  })


	socket.on('disconnect', function() {

		for(var i = 0; i < userInfo.length; i++) {
		   if(socket.id == userInfo[i][0] ) {
				 console.log("remove " + userInfo[i][0]);
				 userInfo.splice(i, 1);
		   }
		}

  	connections.splice(connections.indexOf(socket), 1);
  	console.log('User #' + socket.id + ' left. There are ' + connections.length + ' connections still alive.');
		socket.broadcast.emit('userDisconnected', socket.id);
	});

});

server.listen(port);

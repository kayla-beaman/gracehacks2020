// app.js

/*
File communication (Express)
	-Client asks server for a file

URL = mywebsite.com    :2000     /client/playerImg.png
	  DOMAIN           PORT      PATH
	  laptop           usbport   query

Package communication (Socket.io)
	-Client sends data to the server (ex: input)
	-Server sends data to client (Ex: Monster position)
*/

var express = require('express');
// express intializes app to be a function handler that you can supply to an HTTP server
var app = express();
var http = require('http');
var path = require('path');
// this is the http server
var serv = http.createServer(app);

var rooms = [];

// route handler that gets called when we hit our website home
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/canvasStart.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use(express.static("/js", path.join(__dirname, "/client")));

serv.listen(3000, () => {
	console.log("Listening on port 3000");
});

var io = require('socket.io')(serv);
io.on('connection', function(socket) {
	console.log('socket connection');
});

io.on('requestRoom' function (socket) {
	var randNum = Math.floor(Math.random() * 1000);
	var randName = randNum.toString();
	var newRoom = {
		numPlayers: 1,
		numTurns: 0,
		name: randName,
		notebooks: []
	};

	// create a new notebook for the requesting socket:
	var newNoteBook = {
		playerid: socket.id,
		drawings: [],
		guesses: [],
		ogWord: null,
		playerPlace: 1
	}
	(newRoom.notebooks).push(newNoteBook);
	rooms.pugh(newRoom);

	socket.join(randName);

	socket.emit('returnRoomReq', randName);
});
io.on('joinRoom' function)
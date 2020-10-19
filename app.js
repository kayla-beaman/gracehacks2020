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
var clients = [];

// route handler that gets called when we hit our website home
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use("/js", express.static(path.join(__dirname, "/client")));

serv.listen(3000, () => {
	console.log("Listening on port 3000");
});

var io = require('socket.io')(serv);
io.on('connection', function(socket) {
	console.log('socket connection');

	socket.on('requestRoom', function () {
		console.log("room requested");
		var randNum = Math.floor(Math.random() * 1000);
		var randName = randNum.toString();
		var newRoom = {
			numPlayers: 1,
			numTurns: 0,
			name: randName,
			notebooks: [],
			sockets: []
		};

		newRoom.sockets.push(socket.id);

		// create a new notebook for the requesting socket:
		var newNoteBook = {
			playerid: socket.id,
			drawings: [],
			guesses: [],
			ogWord: null,
			playerPlace: 1
		};
		(newRoom.notebooks).push(newNoteBook);
		rooms.push(newRoom);

		socket.join(randName);

		socket.emit('returnRoomReq', randName);
	});

	socket.on('joinRoom', function (roomName) {
		var roomToJoin = null;
		for (i=0; i<rooms.length; i++) {
			if (rooms[i].name.equals(roomName)) {
				// store in variable
				roomToJoin = rooms[i];
				break;
			}
		}

		if (roomToJoin == null) {
			socket.emit('invalidRoom', roomName + " is not a valid room, please try again");
			return;
		}

		roomToJoin.numPlayers = (roomToJoin.numPlayers) + 1;
		roomToJoin.sockets.push(socket.id);

		// create a new notebook for the new player
		var newNoteBook = {
			playerid: socket.id,
			drawings: [],
			guesses: [],
			ogWord: null,
			playerPlace: (roomToJoin.numPlayers + 1)
		}

		roomToJoin.notebooks.push(newNoteBook);
		rooms[i] = roomToJoin;
	});
});
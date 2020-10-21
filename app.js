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

app.get('/testPage', function(req, res) {
	res.sendFile(__dirname + '/client/testPage.html');
});

app.get('/gamePage', function(req, res) {
	res.sendFile(__dirname + './client/canvasStart.html');
});

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
		var roomIndex = rooms.length-1;

		socket.playerPlace = 0;

		socket.join(randName);

		socket.emit('returnRoomReq', randName, roomIndex);
	});

	socket.on('joinRoom', function (roomName) {
		var roomToJoin = null;
		var roomIndex;
		for (i=0; i<rooms.length; i++) {
			var currNameStr = rooms[i].name;
			if (currNameStr.localeCompare(roomName) == 0) {
				// store in variable
				roomToJoin = rooms[i];
				roomIndex = i;
				break;
			}
		}

		if (roomToJoin == null) {
			socket.emit('invalidRoom', roomName + " is not a valid room, please try again");
			return;
		}

		socket.playerPlace = roomToJoin.numPlayers;

		roomToJoin.numPlayers = (roomToJoin.numPlayers) + 1;
		roomToJoin.sockets.push(socket.id);

		// create a new notebook for the new player
		var newNoteBook = {
			playerid: socket.id,
			drawings: [],
			guesses: [],
			ogWord: null,
			waiting: 0,
			playerPlace: (roomToJoin.numPlayers + 1)
		}

		roomToJoin.notebooks.push(newNoteBook);
		rooms[roomIndex] = roomToJoin;

		socket.emit('giveRoomIndex', roomIndex);
	});

	socket.on('beginGame', function(room) {
		// get the correct room
		var targetRoom = rooms[room];

		var sockNotebkIndex = Math.abs( targetRoom.numPlayers - (socket.playerPlace + targetRoom.numTurns) );
		
		// send out notebooks to each of the sockets in the room
		io.to(targetRoom.name).emit('firstRound', targetRoom.notebooks[sockNotebkIndex]);
	});

	socket.on('doneGuessing', function (playerNotebook, roomIndex) {
		rooms[roomIndex].waiting = rooms[roomIndex] + 1;
		while (rooms[roomIndex].waiting < rooms[roomIndex].numPlayers) {
			// do nothing
		}
		// add the notebooks to the room
		var targetRoom = rooms[roomIndex];
		var sockNotebkIndex = Math.abs( targetRoom.numPlayers - (socket.playerPlace + targetRoom.numTurns) );
		targetRoom.notebooks[sockNotebkIndex] = playerNotebook;
		targetRoom.numTurns = targetRoom.numTurns + 1;
		if (targetRoom.numTurns == targetRoom.numPlayers) {
			// call the endgame and return
			(function () {
				// send each player their own notebooks :)
				io.to(targetRoom.name).emit('gameEnd', targetRoom.notebooks[socket.playerPlace]);
			})()
			return;
		}
		// get the next notebook for the players
		sockNotebkIndex = Math.abs( targetRoom.numPlayers - (socket.playerPlace + targetRoom.numTurns) );
		io.to(targetRoom.name).emit('beginDrawing', targetRoom.notebooks[sockNotebkIndex]);
	});

	socket.on('doneDrawing', function (playerNotebook, roomIndex) {
		// set the global notebooks
		var targetRoom = rooms[roomIndex];
		var sockNotebkIndex = Math.abs( targetRoom.numPlayers - (socket.playerPlace + targetRoom.numTurns) );
		targetRoom.notebooks[sockNotebkIndex] = playerNotebook;
		targetRoom.numTurns = targetRoom.numTurns + 1;
		if (targetRoom.numTurns == targetRoom.numPlayers) {
			// call the endgame and return
			(function () {
				// send each player their own notebooks :)
				io.to(targetRoom.name).emit('gameEnd', targetRoom.notebooks[socket.playerPlace]);
			})()
			return;
		}
		// get the next notebook for the players
		rooms[roomIndex] = targetRoom;
		sockNotebkIndex = Math.abs( targetRoom.numPlayers - (socket.playerPlace + targetRoom.numTurns) );
		io.to(targetRoom.name).emit('beginGuessing', targetRoom.notebooks[sockNotebkIndex]);
	})
});
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
const PORT = process.env.PORT || 3000;

var rooms = {};
var clients = [];

// route handler that gets called when we hit our website home

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/canvasStart.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use('/js', express.static(path.join(__dirname, '/client')));

app.get('/testPage', function(req, res) {
	res.sendFile(__dirname + '/client/testPage.html');
});

serv.listen(PORT, () => {
	console.log("Listening on port 3000");
});

var io = require('socket.io')(serv);
io.on('connection', function(socket) {
	console.log('socket connection');

	socket.on('requestRoom', function () {
		var randNum = Math.floor(Math.random() * 1000);
		var randName = randNum.toString();
		var newRoom = {
			numPlayers: 1,
			numTurns: 0,
			name: randName,
			notebooks: [],
			waiting: 0,
			sockets: []
		};

		newRoom.sockets.push(socket.id);

		socket.playerPlace = 0;

		// create a new notebook for the requesting socket:
		var newNoteBook = {
			playerid: socket.playerPlace,
			sockid: socket.id,
			nextUp: 0,
			drawings: [],
			guesses: [],
		};
		(newRoom.notebooks).push(newNoteBook);
		rooms[newRoom.name] = newRoom;

		socket.join(randName);

		socket.emit('returnRoomReq', randName);
	});

	socket.on('joinRoom', function (roomName) {
		var roomToJoin = null;
		roomToJoin = rooms[roomName];

		if (roomToJoin == null) {
			socket.emit('invalidRoom', roomName + " is not a valid room, please try again");
			return;
		}

		socket.playerPlace = roomToJoin.numPlayers;

		roomToJoin.numPlayers = (roomToJoin.numPlayers) + 1;
		roomToJoin.sockets.push(socket.id);

		// create a new notebook for the new player
		var newNoteBook = {
			playerid: socket.playerPlace,
			sockid: socket.id,
			nextUp: roomToJoin.numPlayers - 1,
			drawings: [],
			guesses: [],
			ogWord: null,
		}

		roomToJoin.notebooks.push(newNoteBook);
		rooms[roomName] = roomToJoin;
		socket.join(roomToJoin.name);
	});

	socket.on('beginGame', function(room) {
		// get the correct room
		var targetRoom = rooms[room];
		var currPlayerPlace;
		var currSockid;
		var nbIndex;

		for (i=0, len=targetRoom.notebooks.length; i < len; i++) {
			currPlayerPlace = targetRoom.notebooks[i].playerid;
			currSockid = targetRoom.notebooks[i].sockid;
			io.to(currSockid).emit('firstRound', targetRoom.notebooks[currPlayerPlace]);
		}		
	});

	socket.on('endFirstRound', function(playerNotebook, roomName) {
		++rooms[roomName].waiting;

		// set the notebook
		var nbIndex = playerNotebook.playerid;
		rooms[roomName].notebooks[nbIndex] = playerNotebook;

		var currSockid;
		var currPlayerPlace;
		var targetRoom = rooms[roomName];

		if (rooms[roomName].waiting >= rooms[roomName].numPlayers) {
			rooms[roomName].waiting = 0;
			// then give the clients the signal to draw their word
			for (i=0, len=rooms[roomName].notebooks.length; i < len; i++) {
				currPlayerPlace = targetRoom.notebooks[i].playerid;
				currSockid = targetRoom.notebooks[i].sockid;
				io.to(currSockid).emit('drawYourWord', targetRoom.notebooks[currPlayerPlace]);
			}
		}
	});

	socket.on('doneGuessing', function (playerNotebook, roomName) {
		++rooms[roomName].waiting;

		// set the notebook
		var nbIndex = playerNotebook.playerid;
		var currPlayerPlace;
		var currSockid;
		if (playerNotebook.nextUp == 0) {
			playerNotebook.nextUp = (rooms[roomName].numPlayers - 1);
			console.log(`nextUp is ${rooms[roomName].numPlayers - 1}`);
		}
		else {
			--playerNotebook.nextUp;
		}
		rooms[roomName].notebooks[nbIndex] = playerNotebook;

		if (rooms[roomName].waiting >= rooms[roomName].numPlayers) {
			var targetRoom = rooms[roomName];
			++targetRoom.numTurns;
			if (targetRoom.numTurns == targetRoom.numPlayers) {
				console.log("end game");
				for (j=0, leng=targetRoom.notebooks.length; j < leng; j++) {
					currPlayerPlace = targetRoom.notebooks[j].playerid;
					currSockid = targetRoom.notebooks[j].sockid;
					io.to(currSockid).emit('endGame', targetRoom.notebooks[currPlayerPlace]);
				}
				return;
			}
			targetRoom.waiting = 0;
			// get the next notebook for the players
			rooms[roomName] = targetRoom;
			for (i=0, len=targetRoom.notebooks.length; i < len; i++) {
				// set the socket index
				currPlayerPlace = targetRoom.notebooks[i].playerid;
				currSockid = targetRoom.notebooks[i].sockid;
				nbIndex = targetRoom.notebooks[i].nextUp;
				console.log(`doneGuessing: socket's playerPlace is ${currPlayerPlace}`);
				console.log(`doneGuessing: notebook index is ${nbIndex}`);
				io.to(currSockid).emit('beginDrawing', targetRoom.notebooks[nbIndex]);
			}

		}
	});

	socket.on('doneDrawing', function (playerNotebook, roomName) {
		++rooms[roomName].waiting;

		// set the notebook
		var nbIndex = playerNotebook.playerid;
		var currPlayerPlace;
		var currSockid;
		if (playerNotebook.nextUp == 0) {
			playerNotebook.nextUp = (rooms[roomName].numPlayers - 1);
			console.log(`nextUp is ${rooms[roomName].numPlayers - 1}`);
		}
		else {
			--playerNotebook.nextUp;
		}
		rooms[roomName].notebooks[nbIndex] = playerNotebook;

		if (rooms[roomName].waiting >= rooms[roomName].numPlayers) {
			var targetRoom = rooms[roomName];
			++targetRoom.numTurns;
			if (targetRoom.numTurns == targetRoom.numPlayers) {
				console.log("end game");
				for (j=0, leng=targetRoom.notebooks.length; j < leng; j++) {
					currPlayerPlace = targetRoom.notebooks[j].playerid;
					currSockid = targetRoom.notebooks[j].sockid;
					io.to(currSockid).emit('endGame', targetRoom.notebooks[currPlayerPlace]);
					console.log(`emitted endGame`);
				}
				return;
			}
			targetRoom.waiting = 0;
			// get the next notebook for the players
			rooms[roomName] = targetRoom;
			for (i=0, len=targetRoom.notebooks.length; i < len; i++) {
				// set the socket index
				console.log(`i is ${i}`);
				currPlayerPlace = targetRoom.notebooks[i].playerid;
				currSockid = targetRoom.notebooks[i].sockid;
				nbIndex = targetRoom.notebooks[i].nextUp;
				console.log(`doneDrawing: nbIndex is ${nbIndex}`);
				console.log(`doneDrawing: socket's playerPlace is ${currPlayerPlace}`);
				console.log(`doneDrawing: notebook index is ${nbIndex}`);
				io.to(currSockid).emit('beginGuessing', targetRoom.notebooks[nbIndex]);
			}

		}
	});
});
const socket = io();

var returnName = document.getElementById("nameSpace");
var startRoomButton = document.getElementById("requestRoom");
var befGameDiv = document.getElementById("beforeGame");
var startGame = document.getElementById("startGame");
var joinGameButton = document.getElementById("joinGameButton");
var roomCode = document.getElementById("roomCode");

//startGameButton.addEventListener("click", beginGame);
joinGameButton.addEventListener("click", joinGame);
startRoomButton.addEventListener("click", reqRoomClicked);

startGame.style.display="none";

function joinGame () {
	// get the value of the text field
	var roomName = roomCode.value;
	socket.emit('joinRoom', roomName);
	console.log(`a client joined room ${roomName}`);
}

socket.on('returnRoomReq', function(roomName) {
	befGameDiv.style.display = "none";
	var nameString = document.createElement("p");
	nameString.innerHTML = "The room code is " + roomName;
	returnName.appendChild(nameString);
	startGame.style.display="block";
});

socket.on('invalidRoom', function (errStr) {
	var newErrMsg = document.createElement("p");
	newErrMsg.innerHTML = errStr;
	returnName.appendChild(newErrMsg);
});

function reqRoomClicked() {
	socket.emit('requestRoom', 'need a room');
	console.log("request for room sent");
};
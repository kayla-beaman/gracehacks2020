const socket = io();

socket.on('returnRoomReq', function(roomName) {
	var returnName = getElementById("NameSpace");
	var nameString = createElement("p");
	nameString.innerHTML = "The room code is " + roomName;
	returnName.appendChild(nameString);
});
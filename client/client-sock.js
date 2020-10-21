const socket = io();

var roomIndex;
var playerNotebook;

var returnName = document.getElementById("nameSpace");
var startRoomButton = document.getElementById("requestRoom");
var befGameDiv = document.getElementById("beforeGame");
var startGame = document.getElementById("startGame");
var joinGameButton = document.getElementById("joinGameButton");
var roomCode = document.getElementById("roomCode");

// elements for when the host is in the waiting room
var startGameButton = document.getElementById("startGameButton");

//startGameButton.addEventListener("click", beginGame);
joinGameButton.addEventListener("click", joinGame);
startRoomButton.addEventListener("click", reqRoomClicked);
startGameButton.addEventListener("click", );

// elements to be used once the game starts
var playerCanvas = document.getElementById("myCanvas");
var submitDrawing = document.getElementById("submitDrawing");
var guessingSpace = document.getElementById("guessingSpace");
var canvasSpace = document.getElementById("canvasSpace");
var firstRoundSpace = document.getElementById("firstRoundSpace");
var firstWordField = document.getElementById("firstWordField");
var submitFirstWord = document.getElementById("submitFirstWord");
var guessingField = document.getElementById("guessingField");
var submitGuess = document.getElementById("submitGuess");
var endResultsSpace = document.getElementById("endResultsSpace");

submitDrawing.addEventListener("click", submitDrawingClick);
submitFirstWord.addEventListener("click", endFirstRound);
submitGuess.addEventListener("click", submitGuessClick);


// initializing hidden elements
startGame.style.display="none";
guessingSpace.sytle.display = "none";
canvasSpace.style.display = "none";

socket.on('returnRoomReq', function(roomName) {
    window.roomName = roomName;
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

socket.on('firstRound', function(notebook) {
    window.playerNotebook = notebook;
    startGame.style.display = "block";
});

socket.on('giveRoomIndex', function(roomIndex) {
    window.roomIndex = roomIndex;
});

socket.on('beginDrawing', function (notebook) {
    window.playerNotebook = notebook;
    canvasSpace.style.display = "block";
});

socket.on('beginGuessing', function(notebook) {
    window.playerNotebook = notebook;
    guessingSpace.style.display = "block";
});

socket.on('endGame', function (notebook) {
    if (canvasSpace.style.display == "block") {
        canvasSpace.style.display = "none";
    }
    if (guessingSpace.style.display == "block") {
        guessingSpace.style.display = "none";
    }
    // loop through each of the drawings and guesses
    var drawingsLen = notebook.drawings.length;
    var guessesLen = notebook.guesses.length;
    var tempElement;
    var tempImg;
    tempElement = document.createElement("p");
    tempElement.innerHTML = "Original word: " + notebook.guesses[0] 
                            + "<br> Original Drawing: ";
    endResultsSpace.appendChild(tempElement);
    tempImg = document.createElement("img");
    endResultsSpace.appendChild(tempImg);
    tempImg.src = notebook.drawings[0];
    for (i=1; i<(drawingsLen + guessesLen); i++) {
        if (notebook.guesses[i] != null) {
            tempElement = document.createElement("p");
            tempElement.innerHTML = "Here is what they guessed:" + notebook.guesses[i];
            endResultsSpace.appendChild(tempElement);
        }
        if (notebook.drawings[i] != null) {
            tempImg = document.createElement("img");
            tempImg.src = notebook.drawings[i];
            endResultsSpace.appendChild(tempImg);
        }
    }
});

function joinGame () {
    // get the value of the text field
    roomName = roomCode.value;
    socket.emit('joinRoom', roomName);
    console.log(`a client joined room ${roomName}`);
}

function submitDrawingClick () {
    var playerDrawing = playerCanvas.toDataURL();
    playerNotebook.push(playerDrawing);
    socket.emit('doneDrawing', playerNotebook, roomIndex);
    canvasSpace.style.display = "none";
}

function submitGuessClick () {
    var playerGuess = guessingField.value;
    playerNotebook.guesses.push(playerGuess);
    socket.emit();
}

// triggered when a client clicks on "start room"
function reqRoomClicked() {
	socket.emit('requestRoom', 'need a room');
	console.log("request for room sent");
};

// triggered when the host clicks the "begin game" button
function beginGameSignal() {
    socket.emit('beginGame', roomIndex);
}

function endFirstRound() {
    playerNotebook.guesses.push(firstWordField.value);
    socket.emit('doneGuessing', playerNotebook, roomIndex);
    startGame.style.display = "none";
}
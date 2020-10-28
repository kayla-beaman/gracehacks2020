const socket = io();

var roomIndex;
var roomName;
var playerNotebook;

// html divs
var nameSpace;
var beforeGameSpace;
var startRoomButton;
var startGameSpace;
var guessingSpace;
var canvasSpace;
var firstRoundSpace;
var endResultsSpace;

// buttons
var joinGameButton;
var startGameButton;
var submitDrawingButton;
var submitFirstWord;
var submitGuess;

// text input fields
var roomCodeField;
var firstWordField;
var guessingField;
var chosenWordField;

// prev image/guess
var picToGuess;
var guessToDraw;

// html5 canvas
var playerCanvas;

function mainPage() {
    // html divs
        beforeGameSpace = document.getElementById("beforeGameSpace");
        startGameSpace = document.getElementById("startGameSpace");
        nameSpace = document.getElementById("nameSpace");

        // buttons in index.html
        startRoomButton = document.getElementById("requestRoom");
        joinGameButton = document.getElementById("joinGameButton");
        startGameButton = document.getElementById("startGameButton");

        roomCodeField = document.getElementById("roomCodeField");

            // initializing hidden elements
        joinGameButton.addEventListener("click", joinGame);
        startRoomButton.addEventListener("click", reqRoomClicked);
        startGameButton.addEventListener("click", beginGameSignal);
        startGameSpace.style.display="none";


            // html divs once the game has started
        guessingSpace = document.getElementById("guessingSpace");
        canvasSpace = document.getElementById("canvasSpace");
        firstRoundSpace = document.getElementById("firstRoundSpace");
        waitMessageSpace = document.getElementById("waitMessageSpace");
        endResultsSpace = document.getElementById("endResultsSpace");

        // buttons
        submitFirstWord = document.getElementById("submitFirstWord");
        submitDrawingButton = document.getElementById("submitDrawingButton");
        submitGuess = document.getElementById("submitGuess");

        // text field inputs
        firstWordField = document.getElementById("firstWordField");
        guessingField = document.getElementById("guessingField");

        chosenWordField = document.getElementById("chosenWordField");

        playerCanvas = document.getElementById("myCanvas");

        picToGuess = document.getElementById("guessPic");
        guessToDraw = document.getElementById("drawGuess");

        submitDrawingButton.addEventListener("click", submitDrawingClick);
        submitFirstWord.addEventListener("click", endFirstRound);
        submitGuess.addEventListener("click", submitGuessClick);

        canvasSpace.style.display = "none";
        firstRoundSpace.style.display = "none";
        guessingSpace.style.display = "none";
        waitMessageSpace.style.display = "none";
        endResultsSpace.style.display = "none";
        picToGuess.style.display = "none";
        guessToDraw.style.display = "none";
}

socket.on('returnRoomReq', function(roomName) {
    window.roomName = roomName;
	beforeGameSpace.style.display = "none";
	var nameString = document.createElement("p");
	nameString.innerHTML = "The room code is <br>" + window.roomName;
	nameSpace.appendChild(nameString);
	startGameSpace.style.display="block";
});

socket.on('invalidRoom', function (errStr) {
	var newErrMsg = document.createElement("p");
	newErrMsg.innerHTML = errStr;
	nameSpace.appendChild(newErrMsg);
});

socket.on('firstRound', function(notebook) {
    window.playerNotebook = notebook;
    startGameSpace.style.display = "none";
    beforeGameSpace.style.display = "none";
    nameSpace.style.display = "none";
    console.log("firstRound recieved");

    firstRoundSpace.style.display = "block";
    guessingSpace.style.display = "none";
    canvasSpace.style.display = "none";
});

socket.on('drawYourWord', function (notebook) {
    waitMessageSpace.style.display = "none";
    canvasSpace.style.display = "block";
    chosenWordField.innerHTML = "Draw your word: " + notebook.guesses[0];
    window.playerNotebook = notebook;
});

socket.on('beginDrawing', function (notebook) {
    waitMessageSpace.style.display = "none";
    window.playerNotebook = notebook;
    canvasSpace.style.display = "block";
    var len = notebook.guesses.length;
    guessToDraw.style.display = "block";
    guessToDraw.innerHTML = "Draw this: " + notebook.guesses[len - 1];
});

socket.on('beginGuessing', function(notebook) {
    waitMessageSpace.style.display = "none";
    window.playerNotebook = notebook;
    guessingSpace.style.display = "block";
    var len = notebook.drawings.length;
    picToGuess.style.display = "block";
    picToGuess.src = notebook.drawings[len - 1];
});

socket.on('endGame', function (notebook) {
    console.log(`recieved endGame`);
    if (canvasSpace.style.display == "block") {
        canvasSpace.style.display = "none";
    }
    if (guessingSpace.style.display == "block") {
        guessingSpace.style.display = "none";
    }
    waitMessageSpace.style.display = "none";
    endResultsSpace.style.display = "block";
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
            tempElement.innerHTML = "The player's guess: " + notebook.guesses[i];
            endResultsSpace.appendChild(tempElement);
        }
        if (notebook.drawings[i] != null) {
            tempImg = document.createElement("img");
            tempImg.src = notebook.drawings[i];
            endResultsSpace.appendChild(tempImg);
        }
    }
});

function joinGame() {
    // get the value of the text field
    window.roomName = roomCodeField.value;
    startGameSpace.style.display = "none";
    beforeGameSpace.style.display = "none";
    var waitMsg = document.createElement("p");
    waitMsg.class = "mainScnP";
    waitMsg.innerHTML = "Please wait for the host to start the game";
    nameSpace.appendChild(waitMsg);
    socket.emit('joinRoom', window.roomName);
    console.log(`a client joined room ${window.roomName}`);
}

function submitDrawingClick() {
    var playerDrawing = playerCanvas.toDataURL();
    playerNotebook.drawings.push(playerDrawing);
    canvasSpace.style.display = "none";
    waitMessageSpace.style.display = "block"
    socket.emit('doneDrawing', playerNotebook, window.roomName);
}

function submitGuessClick() {
    var playerGuess = guessingField.value;
    playerNotebook.guesses.push(playerGuess);
    guessingSpace.style.display = "none";
    waitMessageSpace.style.display = "block";
    socket.emit('doneGuessing', playerNotebook, window.roomName);
}

// triggered when a client clicks on "start room"
function reqRoomClicked() {
	socket.emit('requestRoom', 'need a room');
	console.log("request for room sent");
}

// triggered when the host clicks the "begin game" button
function beginGameSignal() {
    console.log(`client: beginGameSignal: room index is ${window.roomName}`);
    socket.emit('beginGame', window.roomName);
}

function endFirstRound() {
    playerNotebook.guesses.push(firstWordField.value);
    firstRoundSpace.style.display = "none";
    waitMessageSpace.style.display = "block";
    socket.emit('endFirstRound', playerNotebook, window.roomName);
}

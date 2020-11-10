## Online Drawing-and-Guessing Game
A simple drawing game that I made so that I can play with friends and family

### Description
This is the structure and code for a dynamic webapp game that uses the socket.io engine to connect multiple users. This game is very similar to the 'telephone' game, except with drawings. At the first round, each player will choose a word and submit it. They will then draw that word to the best of their ability. This drawing gets sent to the next player, and that player will try to guess what the drawing depicts. Then that player's guess is sent to the next player in line, and they try to draw word that the previous player guesses. This cycle continues until each player's original drawing gets back to them.

### How to Play
To start, one of the players should click the "start a room" button. A unique number should show up on that player's screen after that. The rest of the players should take this code, enter it into the text input field on the main page, then click "join room." The game will not start until the player that obtained the room code has clicked "begin game." After that, the game will start

### Link to Webpage
The game is hosted on a google app engine project here:
[drawing-game](https://gamenight-drawing-game.wl.r.appspot.com/)
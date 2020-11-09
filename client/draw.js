// draw.js

/*
float: a floating point number
vec4 indicates a vector of 4 floating point numbers
	(float, float, Float, float)

gl.drawArrays(mode, first, count)
	mode: the type of shape (gl.POINTS, gl.LINES, gl.TRIANGLES)
	first: specifies which vertex to start drawing from (integer)
	count: specifies the number of vertices to be used (integer)

The info about the position of a mouse click is stored as an
event object and passed by the browser using the argument ev
to the function click(). ev holds the position info, and we can get the
coordinates by using ev.clientX and ev.clientY

gl.vertexAttribPointer() can be used to assign a buffer object to an attribute
variable, so the attribute variable cann have an array of positions
	(location, size, type, normalized, stride, offset)
		loction: storage location of attib var
		size: number of components per vertex in buffer object (1 to 4)
		type: gl.SHORT, gl.UNSIGNED_BYTE, gl.INT, gl.UNSIGNED_INT, gl.FLOAT
		normalized: true or false -> [0, 1] or [-1, 1]
		stride: number of bytes btwn different vertex data elements, or 
				zero for default stride
		offset: offset in bytes in a buffer obj to indicate what
				number-th bute the vertex data is stored from
*/

// Vertex shader program
/* Vertex shaders are programs that desribe the traits (position, colors, and so on)
of a vertex. The vertex is a point in 2D/3D space, such as the corner or intersection
of a 2D/3D shape*/
var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'void main() {\n' +
	'	gl_Position = a_Position;\n' +
	'	gl_PointSize = 5.0;\n' +
	'}\n';

// Fragment Shader Program
/*A program that deals with per-fragment processing such as lighting.
The fragment is a webgl term that you can consider as a kind of pixel*/
var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +
	'void main() {\n' +
	'	gl_FragColor = u_FragColor;\n' +
	'}\n';

var isMouseDown = false;
var g_points = [];
var currNoteBook = [];

function main() {
	var myCanvas = document.getElementById('myCanvas');
	if (!myCanvas) {
		console.log('Failed to retrieve the <canvas> element :(');
		return;
	}

	// get the rendering context for 2DCG
	// a context supports the actual drawing features
	var ctx = myCanvas.getContext('webgl', {preserveDrawingBuffer: true});

	// Get the rendering context for Webgl:
	var gl = getWebGLContext(myCanvas);
	if (!gl) {
		console.log('Failed to get the rendering context for Webgl');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to initialize the shaders');
		return;
	}

	// Get the storage location of an attribute variable position
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}
	// Get the storage location of a uniform variable
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
		console.log('failed to get u_FragColor');
		return;
	}

	// alirght I don't have time to figure out this closure thing, so 
	// I'm adding event listeners to buttons one-by-one :(
	var whiteB = document.getElementById("white");
	whiteB.addEventListener("click", function() {
		changeColor("white", gl, u_FragColor);
	});
	var redB = document.getElementById("red");
	redB.addEventListener("click", function() {
		changeColor("red", gl, u_FragColor);
	});
	var greenB = document.getElementById("green");
	greenB.addEventListener("click", function() {
		changeColor("green", gl, u_FragColor);
	});
	var blueB = document.getElementById("blue");
	blueB.addEventListener("click", function() {
		changeColor("blue", gl, u_FragColor);
	});

	var clearButton = document.getElementById("clearButton");
	clearButton.addEventListener("click", function() {
		clearCanvas(gl);
	});

	var submitDrawingButton = document.getElementById("submitDrawingButton");
	submitDrawingButton.addEventListener("click", function () {
		clearCanvas(gl);
	});

/*	var submitGuess = document.getElementById("submitGuess");
	submitGuess.addEventListener("click", function () {
		submitGuess();
	});*/

	myCanvas.onmousedown = function(ev) {
		isMouseDown = true;
	};

	// Register event handler function
	myCanvas.onmousemove = function(ev) {
		startDrawing(ev, gl, myCanvas, a_Position);
	};

	myCanvas.onmouseup = function(ev) {
		drawPoint(ev, gl, myCanvas, a_Position);
		window.isMouseDown = false;
	};

	myCanvas.ontouchmove = function(ev) {
		e.preventDefault();
	};

	// The color for clearing the canvas
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// clear the canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

}

/*function submitDrawing(myCanvas) {
	var subDiv = document.getElementById("submitted");
	var drawing = myCanvas.toDataURL();
	console.log("image submitted");
	pics.push(drawing);
	var newImg = document.createElement("img");
	newImg.src = drawing;
	subDiv.appendChild(newImg);
	console.log("html element created");
	//document.insertBefore(newImg, myCanvas);
}*/

function createEvent(button, gl, u_FragColor) {
	var currColor = button.id;
	return function () {
		console.log(`event created: ${currColor}`);
		button.addEventListener("click", changeColor(currColor, gl, u_FragColor));
	};
}

function clearCanvas(gl) {
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function changeColor(currColor, gl, u_FragColor) {
	console.log(`inside changeColor: ${currColor}`);
	switch(currColor)
	{
		case "white":
			gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
			break;
		case "red":
			gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
			break;
		case "green":
			gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
			break;
		case "blue":
			gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
			break;
		default:
			console.log("This case should be unreachable");
			gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
			break;
	}
}

/*
1. Retrieve a mouse click
2. Clear <canvas>
3. For each position stored in the array, draw a point*/
function startDrawing(ev, gl, myCanvas, a_Position) {
	if (window.isMouseDown) {
		drawPoint(ev, gl, myCanvas, a_Position);
	}
}

function drawPoint(ev, gl, myCanvas, a_Position){
	var x = ev.clientX;
	var y = ev.clientY;
	// this gets the positin of the origin of the canvas element
	var rect = ev.target.getBoundingClientRect();

	// we have to translate the canvas coordinates to the webgl coordinates
	x = ((x - rect.left) - myCanvas.width/2)/(myCanvas.width/2);
	y = (myCanvas.height/2 - (y - rect.top))/(myCanvas.height/2);

	gl.vertexAttrib3f(a_Position, x, y, 0.0);
	gl.drawArrays(gl.POINTS, 0, 1);
	console.log("point drawn");
}
// Pass vertex position to attribute variable
/*After getting the storage location, we need to set the value suing the 
a_Position variable.
The three points are passed as a group to a_Position*/

/*
rgb:
	red: 0.0 to 1.0
	green: 0.0 to 1.0
	blue: 0.0 to 1.0
	alpha: sets transparency value from 0.0 to 1.0
*/
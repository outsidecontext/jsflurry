///////////////////////////////////////////////////////////////////////////////
// fields
/////////////////////////////////////////////////////////////////////////////

// canvas
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
// var canvas = $('#canvas');
// var context = canvas[0].getContext('2d');
var canvasPosition = $(canvas).position();
var width;
var height;
// particles
var particles = [];
var noise = new ClassicalNoise();
var simNoise = new SimplexNoise();
var count = 0;
var multIn = .01;
var multOut = 3.0;
var damping = 0.8;
var particleCount = 500;
// mouse
var mouseX, mouseY, isMouseDown;
// stats
var stats = new Stats();
var showStats = true;


///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
	onResize();
	for (var i = 0; i < particleCount; i++) {
		particles.push(new createParticle());
	}
	// gui
	var gui = new dat.GUI();
	gui.add(this, 'multIn', 0.0, .1);
	gui.add(this, 'multOut', 0.0, 10.0);
	gui.add(this, 'damping', 0.0, 1.0);
	// stats
	// stats.setMode(0); // 0: fps, 1: ms
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.left = '0px';
	// stats.domElement.style.top = '0px';
	// document.body.appendChild( stats.domElement );
	// start request animation frame loop
	onAnimFrame();
}

function createParticle() {
	this.x = Math.random() * width;
	this.y = Math.random() * height;
	this.rx = Math.random();
	this.ry = Math.random();
	var r = Math.random() * 255 >> 0;
	var g = Math.random() * 255 >> 0;
	var b = Math.random() * 255 >> 0;
	this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";
	this.radius = Math.random() * 10 + 10;
}

function update(){
	stats.begin();
	draw();
	stats.end();
}

function draw() {
	// clear
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, width, height);
	// mouse pos indicator
	if (isMouseDown) {
		context.beginPath();
		context.fillStyle = "#eeeeee";
		context.arc(mouseX, mouseY, 5, Math.PI * 2, false);
		context.fill();
	}
	// draw particles
	for (var t = 0; t < particles.length; t++) {
		var p = particles[t];
		// draw
		context.beginPath();
		var n = noise.noise(count * multIn, p.x * multIn, p.y * multIn) * multOut;
		if (n < 0) n *= -1;
		context.fillStyle = "rgb(" + Math.round(n * 4 * 255) + ", 0, 0)";
		context.fillStyle = p.color
		var rad = p.radius * (n * .2);
		context.arc(p.x, p.y, rad, Math.PI * 2, false);
		context.fill();
		// update position
		// reset velocity
		p.vx = p.vy = 0;
		p.vx = (p.rx * 4);
		p.vy = (p.ry * 4);
		// attract to mouse
		if (isMouseDown) {
			p.vx += (mouseX - p.x) * p.rx;
			p.vy += (mouseY - p.y) * p.ry;
		}
		// update velocity and position
		p.vx += noise.noise(p.x * multIn, p.y * multIn, count * multIn) * multOut;
		p.vy += noise.noise(p.y * multIn, p.x * multIn, count * multIn) * multOut;
		p.vx *= damping;
		p.vy *= damping;
		p.x += p.vx;
		p.y += p.vy;
		// stay in canvas
		if (p.x < -50) p.x = width + 50;
		if (p.y < -50) p.y = height + 50;
		if (p.x > width + 50) p.x = -50;
		if (p.y > height + 50) p.y = -50;
	}

	count++;
}


///////////////////////////////////////////////////////////////////////////////
// event listeners
/////////////////////////////////////////////////////////////////////////////
function onAnimFrame() {
	requestAnimFrame( onAnimFrame );
	update();
}

function onResize() {
	width = $(window).width();
	height = $(window).height();
	canvas.width = width;
	canvas.height = height;
	console.log(width);
}


///////////////////////////////////////////////////////////////////////////////
// bind events
/////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
	setup();
});
$(window).resize(function() {
	onResize();
});
$(canvas).mousedown(function() {
	isMouseDown = true;
});
$(canvas).mouseup(function() {
	isMouseDown = false;
});
$(canvas).mousemove(function(event) {
	mouseX = (event.pageX - canvasPosition.left);
	mouseY = (event.pageY - canvasPosition.top);
});


///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
        };
})();
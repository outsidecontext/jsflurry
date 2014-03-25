///////////////////////////////////////////////////////////////////////////////
// fields
/////////////////////////////////////////////////////////////////////////////

// canvas
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
// var canvas = $('#canvas');
// var context = canvas[0].getContext('2d');
var canvasPosition = $(canvas).position();
var width = 0;
var height = 0;
// particles
var particles = [];
var noise = new ClassicalNoise();
var simNoise = new SimplexNoise();
var count = 0;
var multIn = .01;
var radMult = .2;
var multOut = 3.0;
var damping = 0.8;
var particleCount = 600;
// mouse
var mouseX = 0;
var mouseY = 0;
var isMouseDown = false;
var lockToMouse = false;
// stats
var stats = new Stats();
var showStats = true;
var isMobile = false;


///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		isMobile = true;
		particleCount = 200;
		multOut = 3;
		radMult = 1;
		damping  = .85;
	}
	else {
		// gui
		var gui = new dat.GUI();
		gui.add(this, 'multIn', 0.0, .1);
		gui.add(this, 'radMult', 0.0, 10.0);
		gui.add(this, 'multOut', 0.0, 10.0);
		gui.add(this, 'damping', 0.0, 1.0);
		gui.add(this, 'lockToMouse');
		gui.domElement.style.opacity = 0;
	}
	onResize();
	for (var i = 0; i < particleCount; i++) {
		particles.push(new createParticle());
	}
	// stats
	// stats.setMode(0); // 0: fps, 1: ms
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.left = '0px';
	// stats.domElement.style.top = '0px';
	// document.body.appendChild( stats.domElement );
	// start request animation frame loop
	onAnimFrame();
	// hide loader
	$("#loader").hide();
}

function createParticle() {
	this.x = Math.random() * width;
	this.y = Math.random() * height;
	this.pos = new Vec2(Math.random() * width, Math.random() * height);
	this.rx = randomInRange(-1, 1);
	this.ry = randomInRange(-1, 1);
	this.rnd = Math.random();
	var r = Math.random() * 255 >> 0;
	var g = Math.random() * 255 >> 0;
	var b = Math.random() * 255 >> 0;
	this.color = "rgba(" + r + ", " + g + ", " + b + ", .6)";
	this.radius = Math.random() * 10 + 10;
}

function update(){
	if(isMobile && window.pageYOffset == 0) window.scrollTo(0, window.pageYOffset + 1);
	stats.begin();
	draw();
	stats.end();
}

function draw() {
	// clear
	context.globalCompositeOperation = "source-over";
	context.fillStyle = "#001123";
	context.fillRect(0, 0, width, height);
	context.globalCompositeOperation = "lighter";
	// mouse pos indicator
	if (isMouseDown) {
		context.beginPath();
		context.fillStyle = "#eeeeee";
		context.arc(mouseX, mouseY, 5, Math.PI * 2, false);
		context.fill();
	}
	// draw particles
	var mousePos = new Vec2(mouseX, mouseY);
	for (var i = 0; i < particles.length; i++) {
		var p = particles[i];
		// draw
		context.beginPath();
		var n = noise.noise(count * multIn, p.x * multIn, p.y * multIn) * multOut;
		if (n < 0) n *= -1;
		context.fillStyle = "rgb(" + Math.round(n * 4 * 255) + ", 0, 0)";
		context.fillStyle = p.color
		var rad = p.radius * (n * radMult) + 1;
		context.arc(p.x, p.y, rad, Math.PI * 2, false);
		context.fill();
		// update position
		// reset velocity
		p.vx = p.vy = 0;
		p.vx = (p.rx * 4);
		p.vy = (p.ry * 4);
		// attract to mouse
		if (isMouseDown || lockToMouse) {
			var toMouse = mousePos.subV( new Vec2(p.x, p.y) );
			var length = toMouse.lengthSqr();
			var force = length * 0.001;
			toMouse.normalize();
			toMouse = toMouse.mulS(force);
			p.vx += toMouse.x;
			p.vy += toMouse.y;
			// p.vx += (mouseX - p.x) * p.rnd * damping * 0.3;
			// p.vy += (mouseY - p.y) * p.rnd * damping * 0.3;
		}
		// else if (i > 0) {
		// 	p.vx += (particles[0].x - p.x) * p.rnd * damping * n;
		// 	p.vy += (particles[0].y - p.y) * p.rnd * damping * n;
		// }
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
document.addEventListener('touchstart', function(e) {
    isMouseDown = true;
}, false);
document.addEventListener('touchend', function(e) {
    isMouseDown = false;
}, false);
document.addEventListener('touchcancel', function(e) {
    isMouseDown = false;
}, false);
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    //alert(touch.pageX + " - " + touch.pageY);
    mouseX = touch.pageX;
    mouseY = touch.pageY;
}, false);


///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////

function randomInRange( $min, $max, $precision ) {
	if( typeof( $precision ) == 'undefined') {
		$precision = 2;
	}
	return parseFloat( Math.min( $min + ( Math.random() * ( $max - $min ) ), $max ).toFixed( $precision ) );
};

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
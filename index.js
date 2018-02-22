/////////////////////////////// Classes ///////////////////////////////
class Square {

	constructor(x, y, h, w, color) {
		this.ctx = canvas.getContext('2d');
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, h, w);
		this.ctx.closePath();
	}

}

class headSquare extends Square {

	constructor(x = window.xH, y = window.yH, h = 10, w = 10, color = "lime") {
		super(x, y, h, w, color);
	}

	clear(x, y, h = 10, w = 10) {
		this.ctx.clearRect(x, y, h, w);
	}

	draw(x, y, h = 10, w = 10, color = "lime") {
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, h, w);
		this.ctx.closePath();
	}

	translateUp(x = window.xH, y = window.yH) {
		if (!tail[0]) this.clear(x, y);
		window.xh = x;
		window.yh = y;
		this.draw(x, window.yH = y - 10);
	}

	translateDown(x = window.xH, y = window.yH) {
		if (!tail[0]) this.clear(x, y);
		window.xh = x;
		window.yh = y;
		this.draw(x, window.yH = y + 10);
	}

	translateLeft(x = window.xH, y = window.yH) {
		if (!tail[0]) this.clear(x, y);
		window.xh = x;
		window.yh = y;
		this.draw(window.xH = x - 10, y);
	}

	translateRight(x = window.xH, y = window.yH) {
		if (!tail[0]) this.clear(x, y);
		window.xh = x;
		window.yh = y;
		this.draw(window.xH = x + 10, y);
	}

}

class tailSquare extends Square {

	constructor(num, x, y, h = 10, w = 10, color = "lime") {
		super(x, y, h, w, color);
		this.num = num;
		this.x = x;
		this.y = y;
	}

	followHead(h = 10, w = 10, color = "lime") {
		this.x = tail[this.num - 1] ? tail[this.num - 1].x : window.xh;
		this.y = tail[this.num - 1] ? tail[this.num - 1].y : window.yh;
	}

	static clearTail(h = 10, w = 10) {
		if (tail.length > 0)
			ctx.clearRect(tail[tail.length - 1].x, tail[tail.length - 1].y, h, w);
	}

	static add() {
		var i = 0;
		return () => i++;
	}

}

class foodSquare extends Square {

	constructor(x = window.xF, y = window.yF, h = 10, w = 10, color = "red") {
		super(x, y, h, w, color);
	}

	sameColor(x = window.xF, y = window.yF, h = 10, w = 10, color = "red") {
		val = setInterval(() => {
			this.ctx.beginPath();
			this.ctx.fillStyle = color;
			this.ctx.fillRect(x, y, h, w);
			this.ctx.closePath();
		}, 50);
	}

	changeColor(x = window.xF, y = window.yF, h = 10, w = 10) {
		var i = 0;
		foodInterval = setInterval(() => {
			this.ctx.beginPath();
			this.ctx.fillStyle = colors[i++];
			this.ctx.fillRect(x, y, h, w);
			this.ctx.closePath();
			if (i == 3)
				i = 0;
		}, 50);
	}

	stopFood(x = window.xF, y = window.yF, h = 10, w = 10, color = "green") {
		clearInterval(foodInterval);
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, h, w);
		this.ctx.closePath();
	}

	static specialTurnCounter() {
		var i = 1;
		return () => {
			if (i == 6) i = 0;
			return ++i;
		}
	}

}


/////////////////////////////// Variables ///////////////////////////////
// game pace
var clock = 60;

var head, food;
var interval, foodInterval, specialTurnTimer = 0;

// colors for special food square
var colors = ['red', 'orange', 'yellow'];

// head coordinates
var xH, yH;
// tail coordinates
var xh, yh;

// food coordinates
var xF, yF;

// array of tail (body) squares
var tail = [];

var lastKeyPressed;

// html elements
var desSpanEl;
var desEl;
var nameSpanEl;
var scoreEl1;
var scoreEl2;

var specialTurnCounter = foodSquare.specialTurnCounter();
var add = tailSquare.add();

// sound effects
var beepSound = new Audio("Beep.wav");
var specialSound = new Audio("specialBeep.wav");
var powerUp1Sound = new Audio("500Powerup.wav");
var powerUp2Sound = new Audio("1000Powerup.wav");


/////////////////////////////// preparing everything ///////////////////////////////
window.onload = function () {

	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	desEl = document.getElementById('description');
	desSpanEl = document.getElementById('descriptionSpan');
	nameSpanEl = document.getElementById('nameSpan');
	scoreEl1 = document.getElementsByClassName("score")[0];
	scoreEl2 = document.getElementsByClassName("score")[1];

	screenResize();
	startingHeadCoords();
	randomFoodCoords();

	document.addEventListener('keydown', startGame);
	window.addEventListener('resize', screenResize);

}



/////////////////////////////// game function ///////////////////////////////
function startGame(evt) {
	let key = evt.key;
	if (key == 'Enter') {

		desEl.style.visibility = 'hidden';
		document.removeEventListener('keydown', startGame);

		head = new headSquare();
		interval = setInterval(() => {
			circleOfLifeRight();
		}, clock);
		food = new foodSquare();
		food.sameColor();

		listenCommands();

	}
}

/////////////////////////////// other functions ///////////////////////////////
function listenCommands() {
	document.addEventListener('keydown', listenCommandsFunction);
}

function screenResize() {
	var winW = window.innerWidth;
	var winH = window.innerHeight;
	canvas.width = Math.floor((winW / 2) / 10) * 10;
	canvas.height = Math.floor((winH / 2) / 10) * 10;
}

function eatFood() {
	if (xF == xH && yF == yH) {
		var specialCounter = specialTurnCounter();
		if (specialTurnTimer) {
			clearTimeout(specialTurnTimer);
			specialTurnTimer = 0;
			addToScore(50);
			specialSound.play();
		}
		else {
			addToScore();
			beepSound.play();
		}
		food.stopFood();
		randomFoodCoords();
		if (specialCounter == 6) {
			food.changeColor();
			specialTurnTimer = setTimeout(() => {
				specialTurnCounter();
				food.stopFood(undefined, undefined, undefined, undefined, "rgb(20,20,20)");
				randomFoodCoords();
				food.sameColor();
				specialTurnTimer = 0;
			}, 5000);
		}
		else {
			food.sameColor();
		}
		growBody();
	}
}

function randomFoodCoords() {
	var W = canvas.width;
	var H = canvas.height;
	xF = Math.floor(Math.random() * (W / 10)) * 10;
	yF = Math.floor(Math.random() * (H / 10)) * 10;
	if (xF == xH && yF == yH)
		randomFoodCoords();
}

function startingHeadCoords() {
	var W = canvas.width;
	var H = canvas.height;
	xH = (Math.floor((W / 2) / 10) * 10) - (Math.floor((W / 4) / 10) * 10);
	yH = Math.floor((H / 2) / 10) * 10;
}

function growBody() {
	var num = add();
	if (num == 0) {
		tail[num] = new tailSquare(num, window.xh, window.yh);
		scoreEl2.style.color = scoreEl1.style.color = 'rgb(0,50,255)';
	}
	else {
		tail[num] = new tailSquare(num, tail[num - 1].x, tail[num - 1].y);
	}
}

function moveBody() {
	for (var i = tail.length - 1; i >= 0; i--) {
		tail[i].followHead();
	}
}

function circleOfLifeUp() {
	eatFood();
	head.translateUp();
	checkCollisionBorder();
	checkCollisionSnake();
	tailSquare.clearTail();
	moveBody();
}

function circleOfLifeDown() {
	eatFood();
	head.translateDown();
	checkCollisionBorder();
	checkCollisionSnake();
	tailSquare.clearTail();
	moveBody();
}

function circleOfLifeLeft() {
	eatFood();
	head.translateLeft();
	checkCollisionBorder();
	checkCollisionSnake();
	tailSquare.clearTail();
	moveBody();
}

function circleOfLifeRight() {
	eatFood();
	head.translateRight();
	checkCollisionBorder();
	checkCollisionSnake();
	tailSquare.clearTail();
	moveBody();
}

function checkCollisionBorder() {
	if (xH > canvas.width - 10 || yH > canvas.height - 10 || xH < 0 || yH < 0) {
		clearInterval(interval);
		document.removeEventListener('keydown', listenCommandsFunction);
		desSpanEl.innerHTML = "Press 'R' for Restart";
		desEl.style.visibility = "visible";
		listenRestart();
	}
}

function checkCollisionSnake() {
	tail.forEach((item) => {
		if (item.x == xH && item.y == yH) {
			clearInterval(interval);
			document.removeEventListener('keydown', listenCommandsFunction);
			desSpanEl.innerHTML = "Press 'R' for Restart";
			desEl.style.visibility = "visible";
			listenRestart();
		}
	});
}

function listenRestart() {
	document.addEventListener('keydown', (evt) => {
		var key = evt.key;
		if (key == 'r') window.location.reload();
	});
}

function listenCommandsFunction(evt) {
	let key = evt.key;
	switch (key) {
		case 'ArrowUp':
			if (lastKeyPressed == "ArrowDown" || lastKeyPressed == "ArrowUp") break;
			lastKeyPressed = key;
			circleOfLifeUp();
			clearInterval(interval);
			interval = setInterval(() => {
				circleOfLifeUp();
			}, clock);
			break;

		case 'ArrowDown':
			if (lastKeyPressed == "ArrowUp" || lastKeyPressed == "ArrowDown") break;
			lastKeyPressed = key;
			circleOfLifeDown();
			clearInterval(interval);
			interval = setInterval(() => {
				circleOfLifeDown();
			}, clock);
			break;

		case 'ArrowLeft':
			if (lastKeyPressed == "ArrowRight" || lastKeyPressed == "ArrowLeft") break;
			lastKeyPressed = key;
			circleOfLifeLeft();
			clearInterval(interval);
			interval = setInterval(() => {
				circleOfLifeLeft();
			}, clock);
			break;

		case 'ArrowRight':
			if (lastKeyPressed == "ArrowLeft" || lastKeyPressed == "ArrowRight") break;
			lastKeyPressed = key;
			circleOfLifeRight();
			clearInterval(interval);
			interval = setInterval(() => {
				circleOfLifeRight();
			}, clock);
			break;
	}
}

function addToScore(score = 10) {
	scoreEl2.innerHTML = scoreEl1.innerHTML = Number(scoreEl1.innerHTML) + score;
	if (arguments.length != 0) {
		specialEffect(scoreEl1, 3, "yellow");
		specialEffect(scoreEl2, 3, "yellow");
	}
	if (Number(scoreEl2.innerHTML) == 500) {
		specialEffect(nameSpanEl, 10, "orange", "You're good at this!");
		powerUp1Sound.play();
	}
	if (Number(scoreEl2.innerHTML) == 1000) {
		specialEffect(nameSpanEl, 10, "orange", "OMG!!!");
		powerUp2Sound.play();
	}
}

function specialEffect(element, repTime, color, text = "") {
	var oldColor = element.style.color;
	var oldText = element.innerHTML;
	var interval = 100;
	if (text) element.innerHTML = text;
	while (repTime) {
		setTimeout(() => {
			element.style.color = color;
		}, interval += 100)
		setTimeout(() => {
			element.style.color = oldColor;
		}, interval += 100)
		if (repTime == 1) {
			setTimeout(() => {
				element.innerHTML = oldText;
			}, interval)
		}
		repTime--;
	}
}

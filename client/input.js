//HANDLE KEYBOARD
var keysDown = {};
window.addEventListener('keydown', function(e){keysDown[e.keyCode] = true});
window.addEventListener('keyup', function(e){delete keysDown[e.keyCode]});

//HANDLE MOUSE
var isMouseDown = false;
var mouseDownCoords = {x: 0, y: 0};
var wasLeftClick = false;
var shouldTeleport = false;
function setMouseDownCoords(windowX, windowY)
{
	var bbox = canvas.getBoundingClientRect();

	mouseDownCoords.x = windowX - bbox.left * (canvas.width  / bbox.width);
	mouseDownCoords.y = windowY - bbox.top  * (canvas.height / bbox.height);
}
function ProcessLobbyClick()
{
	var mx = mouseDownCoords.x;
	var my = mouseDownCoords.y;

	//clicks on join buttons
	var bX = canvas.width / 2 + 240;
	var vBase = 180;
	var rWidth = 400;
	var rHeight = 120;
	var vertPad = 60 + rHeight;

	var p1rect = new RectWh(bX - rWidth/2, vBase, rWidth, rHeight);
	var p2rect = new RectWh(bX - rWidth/2, vBase + vertPad, rWidth, rHeight);
	var specrect = new RectWh(bX - rWidth/2, vBase + 2*vertPad, rWidth, rHeight);

	if(IsInRectangle(mx, my, p1rect) && (p1count == 0))
	{
		TryJoinAsPlayer(0);
	}
	else if(IsInRectangle(mx, my, p2rect) && (p2count == 0))
	{
		TryJoinAsPlayer(1);
	}

	//clicks on char select
	var avatarY = 525;
	var avatarX = 75;
	var avPad = 160;
	var avSize = 125;

	c1rect = new RectWh(avatarX, avatarY, avSize, avSize);
	c2rect = new RectWh(avatarX + avPad, avatarY, avSize, avSize);
	c3rect = new RectWh(avatarX + 2*avPad, avatarY, avSize, avSize);

	if(IsInRectangle(mx, my, c1rect))
		CHARSELECT = CHARS.ROCK;
	else if(IsInRectangle(mx, my, c2rect))
		CHARSELECT = CHARS.PAPER;
	else if(IsInRectangle(mx, my, c3rect))
		CHARSELECT = CHARS.SCISSORS;
}
function ProcessGameClick()
{
	if(isWaitingThrow)
		return;

	var buttonY = 500;
	var rockX = 200;
	var midPad = 300;	

	var extra = 20; //extra space outside the button that is also valid click zone

	var rect = function(x, y) {this.x1 = x - extra; this.y1 = y - extra;};

	var rects = [new rect(rockX, buttonY), new rect(rockX + midPad, buttonY), new rect(rockX + 2*midPad, buttonY)]

	function inRect(r)
	{
		var x2 = r.x1 + BUTTON_WIDTH + 2*extra;
		var y2 = r.y1 + BUTTON_HEIGHT + 2*extra;
		if( mouseDownCoords.x >= r.x1 && mouseDownCoords.x <= x2 )
			if( mouseDownCoords.y >= r.y1 && mouseDownCoords.y <= y2 )
				return true;
		return false;
	}

	if(inRect(rects[0]))
		player.currThrow = THROWS.ROCK;
	else if(inRect(rects[1]))
		player.currThrow = THROWS.PAPER;
	else if(inRect(rects[2]))
		player.currThrow = THROWS.SCISSORS;
}
function ProcessClick()
{
	if(!wasLeftClick)
		return;

	switch(gameState)
	{
		case STATES.LOBBY:
			ProcessLobbyClick();
			break;
		case STATES.GAME:
			ProcessGameClick();
			break;
	}
}

canvas.onmousedown = function(e)
{
	if(!isMouseDown)
		isMouseDown = true;
	//setMouseDownCoords(e.x, e.y);

	evt = e || window.event;
	var button = evt.which || evt.button;
	wasLeftClick = (button == 1);
	ProcessClick();
}
canvas.onmouseup = function(e)
{
	if(isMouseDown)
		isMouseDown = false;
}
canvas.onmousemove = function(e)
{
	//if(isMouseDown)
	setMouseDownCoords(e.x, e.y);
}

canvas.oncontextmenu = function (e)
{
	e.preventDefault();
};
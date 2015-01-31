var THROW_BUTTONS = {}
THROW_BUTTONS[THROWS.ROCK] = {true: null, false: null} //true for pressed version
THROW_BUTTONS[THROWS.PAPER] = {true: null, false: null} //false for unpressed version
THROW_BUTTONS[THROWS.SCISSORS] = {true: null, false: null}
var buttonsLoaded = 0
function LoadButtons(CallbackFunc)
{
	function LoadButtonForThrow(eThrow)
	{
		function LoadButtonForThrowPressed(eThrow, pressed)
		{
			var text = THROWSTRINGS[eThrow];
			var path = text + (pressed ? "Down" : "Up") + ".png"

			var img = new Image();

			img.onload = function()
			{
				THROW_BUTTONS[eThrow][pressed] = img;
				buttonsLoaded += 1;
				if(buttonsLoaded == 6)
					CallbackFunc();
			}

			img.src = BUTTON_FOLDER + path;
		}
		LoadButtonForThrowPressed(eThrow, true);
		LoadButtonForThrowPressed(eThrow, false);
	}
	LoadButtonForThrow(THROWS.ROCK);
	LoadButtonForThrow(THROWS.PAPER);
	LoadButtonForThrow(THROWS.SCISSORS);
}

function DrawButton(eThrow, pressed, x, y, big, context)
{
	var buttonSize = {width: BUTTON_WIDTH, height: BUTTON_HEIGHT};

	var img = THROW_BUTTONS[eThrow][pressed]

	context.drawImage(img, x, y, buttonSize.width, buttonSize.height);

	// var text = THROWSTRINGS[eThrow];

	// context.fillStyle = "#000000";
	// context.textAlign = "center"
	// if(big)
	// 	context.font = "bold 44px Arial";
	// else
	// 	context.font = "bold 20px Arial";		

	// textY = y + 45 + (big ? 10 : 0);
	// context.fillText(text, x + (buttonSize.width)/2, textY);

	// context.textAlign = "start"
}

//draw time remaining, 3x buttons, win values, 3x button labels
function DrawGame(context)
{
	DrawUI(context);

	//draw time remaining
	intTime = Math.ceil(timeLeft);
	context.fillStyle = "#000000";
	context.font = "bold 120px Arial";
	context.textAlign = "center"
	context.fillText(intTime.toString(), canvas.width / 2, 250);
	context.textAlign = "start"

	//draw button
	var buttonY = 500;
	var rockX = 200;
	var midPad = 300;
	var paths = {
				ROCK: {t: THROWS.ROCK, x: rockX},
				PAPER: {t: THROWS.PAPER, x: rockX + midPad},
				SCISSORS: {t: THROWS.SCISSORS, x: rockX + 2*midPad}
				};
	for(path in paths)
	{
		var pressed = false
		if(player.currThrow == THROWS[path])
			pressed = true

		//DrawButton(eThrow, pressed, x, y, big, context)
		DrawButton(paths[path].t, pressed, paths[path].x, buttonY, pressed, context);
	}

	//calc throw values
	var values = CalcThrowValues(player);

	//draw throw values
	var valueY = buttonY + 220;
	var valueX = rockX + 60;	
	context.fillStyle = "#000000";
	context.font = "bold 24px Arial";
	context.fillText("-" + values.r, valueX, valueY);
	context.fillText("-" + values.p, valueX + midPad, valueY);
	context.fillText("-" + values.s, valueX + 2*midPad, valueY);
}
function DrawPlayerThrow(p, context)
{
	var quarter = canvas.width / 4;
	var halfWidth = BUTTON_WIDTH / 2;
	var posY = 300;
	var throwPositions = [{x: quarter - halfWidth, y: posY}, {x: 3*quarter - halfWidth, y: posY}]
	var throwPos = throwPositions[p.num - 1]

	var eThrow = p.currThrow;

	//DrawButton(eThrow, pressed, x, y, big, context)
	DrawButton(eThrow, true, throwPos.x, throwPos.y, true, context);
}
function DrawDamage(damage, context)
{
	var loser = WhoLost();

	var quarter = canvas.width / 4;
	var posY = 550;
	var positions = [{x: quarter, y: posY}, {x: 3*quarter, y: posY}]
	var pos = positions[loser.num - 1]

	context.fillStyle = "#303030";
	context.font = "bold 60px Arial";
	context.textAlign = "center"
	context.fillText("-" + damage.toString(), pos.x, pos.y);

	context.textAlign = "start"
}
//draw my throw, enemy throw, damage taken
function DrawThrowResult(context)
{
	DrawUI(context);

	//draw time remaining
	var intTime = Math.ceil(timeLeft);
	context.fillStyle = "#303030";
	context.font = "bold 50px Arial";
	context.fillText(intTime.toString(), canvas.width - 100, canvas.height - 45);

	//draw throws (if the player threw at all)
	if(player.currThrow != THROWS.NONE)
		DrawPlayerThrow(player, context);
	if(enemy.currThrow != THROWS.NONE)
		DrawPlayerThrow(enemy, context);

	//draw damage (if not a tie)
	if(!IsTie())
	{
		var winner = WhoWon();
		var values = CalcThrowIndexedValues(winner);
		var value = values[winner.currThrow];
		DrawDamage(value, context)
	}		
}

//draw win and lose text
function DrawGameResult(context)
{
	DrawUI(context);

	var gameWinner = WhoWonTheGame().name;

	//draw game over
	intTime = Math.ceil(timeLeft);
	context.fillStyle = "#000000";
	context.font = "bold 120px Arial";
	context.textAlign = "center"
	context.fillText(gameWinner + " wins!", canvas.width / 2, 250);
	context.textAlign = "start"

	//draw time remaining
	intTime = Math.ceil(timeLeft);
	context.fillStyle = "#303030";
	context.font = "bold 50px Arial";
	context.fillText(intTime.toString(), canvas.width - 100, canvas.height - 45);
}
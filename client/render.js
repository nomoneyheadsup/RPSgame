var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 800;

function update(mod)
{
	switch(gameState)
	{
	case STATES.LOBBY:
		LobbyTick(mod);
		break;
	case STATES.GAME:
		//update remaining time
		timeLeft -= mod/1000;
		if(timeLeft < 0)
			timeLeft = 0;

		if(timeLeft <= 0)
		{
			if(!LOCAL_TEST)
			{
				//send player throw and freeze inputs (ONCE)
				if(!isWaitingThrow)
					FinalizeThrow();
			}
			else
			{
				enemy.currThrow = THROWS.ROCK;

				//calculate and apply damage
				if(!IsTie())
				{
					var winner = WhoWon();
					var loser = WhoLost();
					var values = CalcThrowIndexedValues(winner);
					var value = values[winner.currThrow];
					loser.hp -= (value * TEST_DAMAGE_MULTIPLIER);
					if(loser.hp < 0)
						loser.hp = 0;
				}

				//show throw result
				timeLeft = 4.0;
				gameState = STATES.THROWRESULT;

				PlayThrowSound();
			}
		}
		else
		{
		//check QWE keys
		if('Q'.charCodeAt(0) in keysDown)
			player.currThrow = THROWS.ROCK;
		if('W'.charCodeAt(0) in keysDown)
			player.currThrow = THROWS.PAPER;
		if('E'.charCodeAt(0) in keysDown)
			player.currThrow = THROWS.SCISSORS;
		}
		break;
	case STATES.THROWRESULT:
		timeLeft -= mod/1000;
		if(timeLeft <= 0)
		{
			//if someone died, go to GameResult
			if(player.hp <= 0 || enemy.hp <= 0)
			{
				SetStreaks();

				timeLeft = 8.0;
				gameState = STATES.GAMERESULT;
			}
			else
			{
				SetStreaks();

				timeLeft = CalculateNextRoundTime();
				gameState = STATES.GAME;
				player.currThrow = THROWS.NONE;
				enemy.currThrow = THROWS.NONE;
			}
		}
		break;
	case STATES.GAMERESULT:
		timeLeft -= mod/1000;
		if(timeLeft <= 0)
		{
			timeLeft = ONE_THROW_TIME;
			player.currThrow = THROWS.NONE;
			player.hp = player.maxHP;
			enemy.hp = enemy.maxHP;

			//gameState = STATES.GAME;
			SendExitGame();
			EnterLobby();
		}
		break;
	}
}

function render()
{
	//white background
	context.fillStyle = '#FFFFFF';
	context.fillRect(0, 0, canvas.width, canvas.height);

	switch(gameState)
	{
	case STATES.GAME:
		DrawGame(context);
		break;
	case STATES.THROWRESULT:
		DrawThrowResult(context);
		break;
	case STATES.GAMERESULT:
		DrawGameResult(context);
		break;
	case STATES.LOBBY:
		DrawLobby(context);
		break;
	case STATES.WAITING:
		DrawWaitingRoom(context);
		break;
	}	
}

var time = Date.now();
function run()
{
	var mod = Date.now() - time; //ms since last update
	update(mod);
	render();
	time = Date.now();
}

function EnterLobby()
{
	timeSinceLobbyUpdate = 999999;
	gameState = STATES.LOBBY;
	box = document.getElementById('nameInput');
	box.style.zIndex = "101";
}

function LeaveLobby()
{
	box = document.getElementById('nameInput');
	box.style.zIndex = "-1";
}

var LOCAL_TEST = false;

function startgame()
{
	gameState = STATES.GAME;

	if(!LOCAL_TEST)
		EnterLobby();

	setInterval(run, 15); //autocall, set minimum ms between calls
}

function startup()
{
	box = document.getElementById('nameInput');
	box.style.top = "255px";
	box.style.left = "150px";
	box.style.zIndex = "-1";

	LoadAvatars(function(){ //callbacks to LoadButtons
		LoadButtons(startgame); //callbacks to startgame
	});
	
}

window.onload = startup;
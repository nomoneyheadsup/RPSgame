var soundLoaded = false;
var ThrowSound = new Audio("jankenpo.mp3");
ThrowSound.addEventListener("loadeddata", function() { soundLoaded = true; });

function PlayThrowSound()
{
	if(!soundLoaded)
		return;

	var checkBox = document.getElementById('soundCheckbox');
	if(!checkBox.checked)
		return;

	ThrowSound.play();
}

function FinalizeThrow()
{
	playerThrow = player.currThrow;

	isWaitingThrow = true;

	var sendID = 4;
	var gameID = 0;
	var data = new Uint8Array([sendID, gameID, playerThrow])
	gameSocket.send(data);
}

var TEST_DAMAGE_MULTIPLIER = 1;

function ReceiveEnemyThrow(packet)
{
	if(gameState == STATES.GAME && isWaitingThrow == true)
	{
		gameID = packet[0];
		enemyThrow = packet[1];

		enemy.currThrow = enemyThrow;

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

		isWaitingThrow = false;

		PlayThrowSound();
	}
}

function SendExitGame()
{
	var sendID = 5;
	var gameID = 0;
	var data = new Uint8Array([sendID, gameID])
	gameSocket.send(data);
}

function KickedFromGame(packet)
{
	if(gameState == STATES.GAMERESULT)
	{
		return; //return if game is over
	}
	else if(gameState == STATES.THROWRESULT)
	{
		if(player.hp == 0 || enemy.hp == 0)
				return; //return if game is about to be over
	}

	isWaitingThrow = false;
	EnterLobby();
}
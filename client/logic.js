var STATES = {GAME: 0, THROWRESULT: 1, GAMERESULT: 2, LOBBY: 3, WAITING: 4};
var gameState = STATES.GAME;
var isWaitingThrow = false;

var THROWS = {NONE: 0, ROCK: 1, PAPER: 2, SCISSORS: 3}
var REALTHROWS = [THROWS.ROCK, THROWS.PAPER, THROWS.SCISSORS] //for rng throws

var CHARS = {ROCK: 1, PAPER: 2, SCISSORS: 3, BALANCED: 4}
var CHARBONUS = {};
CHARBONUS[CHARS.ROCK] = function(v) {v.r += 5;}
CHARBONUS[CHARS.PAPER] = function(v) {v.p += 5;}
CHARBONUS[CHARS.SCISSORS] = function(v) {v.s += 5;}
CHARBONUS[CHARS.BALANCED] = function(v) {var inc = 1; v.r += inc; v.p += inc; v.s += inc;}
var AVATAR_FOLDER = "avatars/"
var AVATARS = {1: "rock.jpg", 2: "paper.jpg", 3: "scissors.jpg", 4: "balanced.jpg"}

var BUTTON_FOLDER = "buttons/"
var BUTTON_WIDTH = 150
var BUTTON_HEIGHT = 150

var player = {num: 1, name: "P1", hp: 150, maxHP: 150, chara: CHARS.PAPER, currThrow: THROWS.NONE, streak: 0};
var enemy = {num: 2, name: "P2", hp: 150, maxHP: 150, chara: CHARS.SCISSORS, currThrow: THROWS.NONE, streak: 0};

var ONE_THROW_TIME = 4.0;
var timeLeft = ONE_THROW_TIME;

var THROWSTRINGS = {};
THROWSTRINGS[CHARS.ROCK] = "Rock"
THROWSTRINGS[CHARS.PAPER] = "Paper"
THROWSTRINGS[CHARS.SCISSORS] = "Scissors"

function CalculateNextRoundTime()
{
	var lowestHP = player.hp <= enemy.hp ? player.hp : enemy.hp;
	var HPlost = 150 - lowestHP;
	return 4.0 + Math.floor(HPlost / 10);
}

//for player p, return values of each throw with attribs r, p, s
function CalcThrowValues(p)
{
	var values = {r: 5, p: 5, s: 5};
	(CHARBONUS[p.chara])(values);
	if(p.streak >= 3)
	{
		values.r *= 2;
		values.p *= 2;
		values.s *= 2;
	}
	return values;
}
//for player p, return values of each throw with attribs THROWS.ROCK, etc
function CalcThrowIndexedValues(p)
{
	var values = CalcThrowValues(p);
	var ivalues = {};
	ivalues[THROWS.ROCK] = values.r;
	ivalues[THROWS.PAPER] = values.p;
	ivalues[THROWS.SCISSORS] = values.s;
	return ivalues;
}
//did the round tie?
function IsTie()
{
	if(player.currThrow == enemy.currThrow)
		return true;
	else
		return false;
}
function SetStreaks() //should be called once per throw
{
	if(IsTie())
		return;

	var winner = WhoWon();
	var loser = WhoLost();

	loser.streak = 0;
	winner.streak = winner.streak + 1;
}
//return player who won the last round (assumes no tie)
function WhoWon()
{
	if(IsTie())
		return alert("Error in logic.js pls halp");

	if(player.currThrow == THROWS.NONE)
		return enemy;
	else if(enemy.currThrow == THROWS.NONE)
		return player;

	if(player.currThrow == THROWS.ROCK)
		return (enemy.currThrow == THROWS.SCISSORS) ? player : enemy;

	if(player.currThrow == THROWS.PAPER)
		return (enemy.currThrow == THROWS.ROCK) ? player : enemy;

	if(player.currThrow == THROWS.SCISSORS)
		return (enemy.currThrow == THROWS.PAPER) ? player : enemy;
}
//return player who lost the last round (assumes no tie)
function WhoLost()
{
	if(WhoWon() == player)
		return enemy;
	else
		return player;
}
//return player who won the game (call at GAMERESULT)
//a tie game is impossible
function WhoWonTheGame()
{
	if(player.hp > 0)
		return player;
	else
		return enemy;
}
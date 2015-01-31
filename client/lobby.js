var CHARSELECT = null;

function DrawLobby(context)
{
	//draw "RPS Game" title
	var screenMid = canvas.width / 2;
	DrawBasicText(context, "RPS GAME", screenMid, 100, size = 80, bCenter = true);

	//draw rectangles for the 3 buttons
	var bX = canvas.width / 2 + 240;
	var vBase = 180;
	var rWidth = 400;
	var rHeight = 120;
	var vertPad = 60 + rHeight;
	if(p1count == 0)
		DrawHoverRectangle(context, bX, vBase, rWidth, rHeight, true);
	else
		DrawBasicRectangle(context, bX, vBase, rWidth, rHeight, true);
	if(p2count == 0)
		DrawHoverRectangle(context, bX, vBase + vertPad, rWidth, rHeight, true);
	else
		DrawBasicRectangle(context, bX, vBase + vertPad, rWidth, rHeight, true);
	DrawBasicRectangle(context, bX, vBase + 2*vertPad, rWidth, rHeight, true);

	//draw static text for the 3 buttons (slot labels for one game)
	var vOffset = 48;
	var size = 35;
	var center = true;
	DrawBasicText(context, "Player 1", bX, vOffset + vBase, size, center);
	DrawBasicText(context, "Player 2", bX, vOffset + vBase + vertPad, size, center);
	DrawBasicText(context, "WIP", bX, vOffset + vBase + 2*vertPad, size, center);

	//draw dynamic text for the 3 buttons (current capacity/max capacity)
	var vOffset = vOffset + 47;
	var y = vBase + vOffset;
	var size = 25;
	var center = true;
	DrawBasicText(context, p1count.toString() + "/1", bX, y, size, center);
	DrawBasicText(context, p2count.toString() +  "/1", bX, y + vertPad, size, center);
	DrawBasicText(context, spectators.toString() + "/" + maxSpectators.toString()
		, bX, y + 2*vertPad, size, center);

	//draw character select
	DrawBasicRectangle(context, 50, 400, 500, 300, false);
	DrawBasicText(context, "Character Select", 300, 450, 30, true);

	var avatar1 = AVATAR_IMG[CHARS.ROCK];
	var avatar2 = AVATAR_IMG[CHARS.PAPER];
	var avatar3 = AVATAR_IMG[CHARS.SCISSORS];

	var avatarY = 525;
	var avatarX = 75;
	var avPad = 160;
	var avSize = 125;

	context.drawImage(avatar1, avatarX, avatarY, avSize, avSize);
	context.drawImage(avatar2, avatarX + avPad, avatarY, avSize, avSize);
	context.drawImage(avatar3, avatarX + 2*avPad, avatarY, avSize, avSize);

	//draw character curr selection
	if(CHARSELECT != null)
	{
		if(CHARSELECT == CHARS.ROCK) var selectX = avatarX;
		else if(CHARSELECT == CHARS.PAPER) var selectX = avatarX + avPad;
		else if(CHARSELECT == CHARS.SCISSORS) var selectX = avatarX + 2*avPad;

		var selPad = 6;
		DrawBasicRectangle(context, selectX - selPad, avatarY - selPad, avSize + 2*selPad, avSize + 2*selPad);
	}

	//draw name select
	DrawBasicRectangle(context, 50, 150, 500, 200, false);
	DrawBasicText(context, "Name", 300, 200, 30, true);

}

function DrawWaitingRoom(context)
{
	var screenMid = canvas.width / 2;
	DrawBasicText(context, "Waiting for other player", screenMid, 350, size = 40, bCenter = true);
}

function TryJoinAsPlayer(slot) //0, 1
{
	var sendID = 2;
	var gameID = 0;
	var character = CHARSELECT;

	if(character == null)
		return;

	textbox = document.getElementById('nameInput');
	nameStr = textbox.value;

	player.name = nameStr;
	player.chara = CHARSELECT;

	var dataBuf = new ArrayBuffer(nameStr.length + 4);
	var dataView = new Uint8Array(dataBuf);
	for(var q=0; q<nameStr.length; q++)
	{
		dataView[q + 4] = nameStr.charCodeAt(q);
	}

	dataView[0] = sendID;
	dataView[1] = gameID;
	dataView[2] = slot;
	dataView[3] = character;

	console.log(dataView);

	gameSocket.send(dataView);
}

var timeSinceLobbyUpdate = 999999;

function LobbyTick(mod)
{
	timeSinceLobbyUpdate += mod;

	if(timeSinceLobbyUpdate > 2500)
	{
		timeSinceLobbyUpdate = 0;

		//resend packet to grab info
		var sendID = 1;
		var gameID = 0;
		var data = new Uint8Array([sendID, gameID])
		gameSocket.send(data);
	}
}
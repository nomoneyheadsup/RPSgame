console.log("ws://" + document.location.hostname + ":{{SOCK_PORT}}/websocket");
var gameSocket = new WebSocket("ws://" + document.location.hostname + ":{{SOCK_PORT}}/websocket");
gameSocket.binaryType = "arraybuffer";
gameSocket.onopen = function()
{
	console.log("Websocket open!");
};
var closeEvent = null;
gameSocket.onclose = function(evt)
{
	closeEvent = evt;
	console.log("Websocket closed!");
	console.log(closeEvent.code);
	console.log(closeEvent.reason);
}
var errorEvent = null;
gameSocket.onerror = function(evt)
{
	errorEvent = evt;
	console.log("Websocket error!");
}
gameSocket.onmessage = function (evt)
{
	data = evt.data;
	if(data instanceof ArrayBuffer)
	{ //is binary
		byteView = new Uint8Array(data);
		PacketHandler(byteView);
	}
	else
	{ //is text
		//we're not expecting any text so do nothing
	}
};

PACKET_HANDLERS = {1: UpdateLobby, 2: TryJoinGameResult, 4: StartFromWaitingRoom
	, 5: ReceiveEnemyThrow, 6: KickedFromGame};
function OpcodeLookup(opcode)
{

	if(opcode.toString() in PACKET_HANDLERS)
	{
		Handler = PACKET_HANDLERS[opcode];
		return Handler;
	}
	else
	{
		alert('srs bsns error');
		return function(packet){};
	}
}
function PacketHandler(byteView)
{
	var opcode = byteView[0];

	var Handler = OpcodeLookup(opcode);

	Handler(byteView.subarray(1));
}

var p1count = 0;
var p2count = 0;
var spectators = 0;
var maxSpectators = 0;

function UpdateLobby(packet)
{
	//console.log(packet);
	var gameID = packet[0];

	p1count = packet[1];
	p2count = packet[2];
	spectators = packet[3];
	maxSpectators = packet[4];
}

function TryJoinGameResult(packet)
{
	var gameID = packet[0];
	var slot = packet[1];
	var bSuccess = packet[2];

	if(bSuccess != 1)
		return;

	if(gameState != STATES.LOBBY)
		return;

	player.num = slot;
	enemy.num = (slot == 2) ? 1 : 2;

	gameState = STATES.WAITING;
	LeaveLobby();
}

function StartFromWaitingRoom(packet)
{
	var gameID = packet[0];
	var mySlot = packet[1];
	var enemyChara = packet[2];

	if(gameState != STATES.WAITING && gameState != STATES.LOBBY)
		return;

	//player.name and player.chara are both set in TryJoinAsPlayer()
	player.num = mySlot;
	enemy.num = (mySlot == 2) ? 1 : 2;
	enemy.chara = enemyChara;

	//extract name
	
	if(packet.length == 3)
		var name = "";
	else
	{
		var nameLen = packet.length - 3;
		var name = String.fromCharCode.apply(null, packet.subarray(3));
	}

	enemy.name = name;

	player.currThrow = THROWS.NONE;
	enemy.currThrow = THROWS.NONE;

	player.streak = 0;
	enemy.streak = 0;
	
	gameState = STATES.GAME;
}
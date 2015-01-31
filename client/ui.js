var AVATAR_IMG = {}
var avatarsLoaded = 0;
function LoadAvatars(CallbackFunc)
{
	function LoadAvatarForChara(chara)
	{
		var avatarPath = AVATAR_FOLDER + AVATARS[chara];
		var avatarImg = new Image();
		avatarImg.onload = function()
		{
			AVATAR_IMG[chara] = avatarImg;
			avatarsLoaded += 1;
			if(avatarsLoaded == 3) //remember to update this if CHARS.BALANCED added
				CallbackFunc();
		};
		avatarImg.src = avatarPath;
	}

	LoadAvatarForChara(CHARS.ROCK);
	LoadAvatarForChara(CHARS.PAPER);
	LoadAvatarForChara(CHARS.SCISSORS);
	//LoadAvatarForChara(CHARS.BALANCED); //not used
}

//draw character icons, player HP
function DrawPlayerUI(context, p, isCurrPlayer)
{
	var baseX = 80; //left of canvas to UI
	var baseXX = canvas.width * (3/4);
	var topPadImg = 35; //top of canvas to UI
	var topPadHp = 100;
	var midPad = 105; //between avatar and HP
	if(p.num == 1)
	{
		var avatarPos = {x: baseX, y: topPadImg};
		var hpPos = {x: baseX + midPad, y: topPadHp};
	}
	else
	{
		var avatarPos = {x: baseXX, y: topPadImg};
		var hpPos = {x: baseXX + midPad, y: topPadHp};
	}

	//Draw Avatar
	var avatarImg = AVATAR_IMG[p.chara];
	context.drawImage(avatarImg, avatarPos.x, avatarPos.y, 75, 75);
	
	//Draw Name
	context.fillStyle = "#000000";
	context.font = "bold 24px Arial";
	context.textAlign = "start"
	context.fillText(p.name, hpPos.x, hpPos.y - 40);

	//Draw HP
	context.fillStyle = "#000000";
	context.font = "bold 24px Arial";
	context.textAlign = "start"
	context.fillText(p.hp.toString() + "/" + p.maxHP.toString(), hpPos.x, hpPos.y);

	//Draw box around to indicate curr player
	if(isCurrPlayer)
	{
		context.strokeStyle = "#FFCC99";
		context.lineWidth = 2;
		context.strokeRect(avatarPos.x - 10, avatarPos.y - 10, 275, 100);
	}

	//Draw streak
	if(p.streak > 0)
	{
		if(p.streak >= 3)
			context.fillStyle = "red";
		else
			context.fillStyle = "#000000";
		context.font = "bold 16px Arial";
		context.textAlign = "start"
		context.fillText("Streak: " + p.streak.toString(), hpPos.x - 20, hpPos.y + 50);
		context.fillStyle = "#000000";
	}
}
function DrawUI(context)
{
	DrawPlayerUI(context, player, true);
	DrawPlayerUI(context, enemy, false);
}
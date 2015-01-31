function DrawBasicText(context, text, x, y, size, bCenter)
{
	context.fillStyle = "#000000";
	context.font = "bold " + size.toString() + "px Arial";
	context.textAlign = bCenter ? "center" : "start";
	context.fillText(text, x, y);
	context.textAlign = "start";
}

function DrawBasicRectangle(context, x, y, width, height, bCenter)
{
	if(bCenter)
		x -= width / 2;
	context.strokeStyle = "#000000";
	context.lineWidth = 3;
	context.strokeRect(x, y, width, height);
}

var Rect = function(x1, y1, x2, y2) {this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;}
var RectWh = function(x1, y1, width, height) {this.x1 = x1; this.y1 = y1; this.x2 = x1 + width; this.y2 = y1 + height;}
function IsInRectangle(x, y, r)
{
		if( x >= r.x1 && x <= r.x2 )
			if( y >= r.y1 && y <= r.y2 )
				return true;
		return false;
}

//draw the rect slightly bigger if mouse is over it
function DrawHoverRectangle(context, x, y, width, height, bCenter)
{
	var mx = mouseDownCoords.x;
	var my = mouseDownCoords.y;

	var r = new RectWh(x, y, width, height);
	if(bCenter)
	{
		r.x1 -= width / 2;
		r.x2 -= width / 2;
	}

	if(IsInRectangle(mx, my, r))
	{
		var factor = 5;

		if(!bCenter)
		{
			x -= factor;			
		}
		
		y -= factor;
		width += 2*factor;
		height += 2*factor;
	}

	DrawBasicRectangle(context, x, y, width, height, bCenter)
}
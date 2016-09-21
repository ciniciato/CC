var Pointer = function(_canvas){
	this.canvas = _canvas;

	this.position         = {x: 0, y: 0};
	this.dragPosition     = {x: 0, y: 0};
	this.isDown     = false;
	this.hasMoved   = false;
	this.wheelDelta = 0;

	this.clicks = 0;

	this.events = {
		onclick: function(){},
		ondblclick: function(){},
		onmove: function(){},
		onup: function(){},
		onscroll: function(){}
	};

	this.init();
}

Pointer.prototype.isIntersected = function(area){
	return (Math.abs(this.position.x - area.position.x) < area.size.width && 
				Math.abs(this.position.y - area.position.y) < area.size.height);
}

Pointer.prototype.resetDrag = function(){
	var dif = [this.dragPosition.x - this.position.x,  this.dragPosition.y - this.position.y];
	this.dragPosition.x = this.position.x;
	this.dragPosition.y = this.position.y;
	return dif;
}

Pointer.prototype.getDistance = function(point){
	var dx = point.x - this.position.x, dy = point.y - this.position.y;
	return Math.sqrt(dx*dx + dy*dy);
}

Pointer.prototype.getAngle = function(point){
	return Math.atan2(this.position.y - point.y, this.position.x - point.x);
}

Pointer.prototype.onDown = function (e) {
	if (!this.isDown) {
		this.isDown = true;
		this.dragPosition.x = this.position.x;
		this.dragPosition.y = this.position.y;

		this.clicks++;
		var that = this;

		setTimeout(
			function(){
				if(that.clicks == 1) 
					that.events.onclick();
				else if(that.clicks == 2) 
					that.events.ondblclick();		
				that.clicks = 0;
			}, 300);
	} 
	
}

Pointer.prototype.onMove = function(e) {
	var pos = this.canvas.getClientRects()[0];
	if (e != undefined)
		this.position = { x: e.pageX - pos.x,
						  y: e.pageY - pos.y};
	this.hasMoved = (this.position.x != this.dragPosition.x || this.position.y != this.dragPosition.y);
	this.events.onmove();
}


Pointer.prototype.onUp = function(e) {
	this.isDown = false;
	this.events.onup();
}

Pointer.prototype.onCancel = function(e){
	this.isDown = false;
}

Pointer.prototype.onScroll = function(delta) {
	this.events.onscroll(delta);
}

Pointer.prototype.init = function(){
	var that = this;
	if ('ontouchstart' in window) {
		that.canvas.ontouchstart      = function(e) {that.onDown(e)};
		that.canvas.ontouchmove       = function(e) {that.onMove(e)};
		that.canvas.ontouchend        = function(e) {that.onUp(e)};
		that.canvas.ontouchcancel     = function(e) {that.onCancel(e)};
	}
	that.canvas.addEventListener('mousedown', function(e) {that.onDown(e)}, false);
	that.canvas.addEventListener('mousemove', function(e) {that.onMove(e)}, false);
	that.canvas.addEventListener('mouseup',   function(e) {that.onUp(e)}, false);
	
	if (window.addEventListener) 
		that.canvas.addEventListener('DOMMouseScroll', function(e) { 
			that.wheelDelta = e.detail * 10;
			that.onScroll(that.wheelDelta);
			return false; 
		}, false); 
	that.canvas.onmousewheel = function () { 
		that.wheelDelta = -event.wheelDelta * .25;
		that.onScroll(that.wheelDelta);
		return false; 
	}
}

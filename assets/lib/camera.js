'use strict';
/*
	PAN - ZOOM - ...
*/
function Camera(){	
	this.follow        = {x: null, y: null, scale: null};
	this.position      = {x: null, y: null};
	this.position_dif  = {x: null, y: null};
	this.size          = {width:  null, height: null};
	this.scale  = 100;
	this.canvas = null;
	this.ctx    = null;
}

Camera.prototype.init = function(){
	var node = document.createElement("canvas"); 
	this.canvas = document.getElementById('td_canvas').appendChild(node);
	this.canvas.container = document.getElementById('td_canvas');
	this.ctx = this.canvas.getContext("2d");
	this.ctx.save();
	this.resize();
	this.position = {x: 1000, y: 1000};
	this.follow   = {x: 1000, y: 1000, scale: 100};
}

Camera.prototype.set = function(a){
	this.size = {width: this.canvas.width/World.scale/this.scale/2, 
				 height: this.canvas.height/World.scale/this.scale/2};
	this.position_dif = {
		x: this.size.width,
		y: this.size.height
	};
}

Camera.prototype.zoom = function(_value){
	if (_value >= .5)
		this.follow.scale = _value;
}

Camera.prototype.clear = function(){
	var repos = World.scale * this.scale;
	this.ctx.clearRect( (this.position.x - this.size.width)  * repos, 
						(this.position.y - this.size.height) * repos, 
						(this.position.x - this.size.width)  * repos + this.canvas.width, 
						(this.position.y - this.size.height) * repos + this.canvas.height);
}

Camera.prototype.move = function(_d){
	this.follow.x += _d.x;
	this.follow.y += _d.y;
}

//fix velocity zoom and move
Camera.prototype.update = function (){	
	var repos = (World.scale * this.scale),
		d = utils.round(this.follow.scale - this.scale, 100);
	//smooth zoom
	if (d != 0){
		this.scale = utils.round(this.scale + d * Math.min(5, Math.pow(d, 2) * 0.01), 1000);
		debugDraw.m_drawScale = World.scale * this.scale;
		this.set()
		repos = (World.scale * this.scale);
		this.ctx.resetTransform();		
	}
	//smooth move, not stable!
	var delta = {x: this.follow.x - this.position.x,
		         y: this.follow.y - this.position.y}, 
		    r = Math.abs(delta.x) + Math.abs(delta.y);
	if (r > 0){
		this.position.x += delta.x * Math.min(10, Math.pow(delta.x, 2) * 0.01);
		this.position.y += delta.y * Math.min(10, Math.pow(delta.y, 2) * 0.01);
	}
	if (this.position.x < this.size.width){
		this.position.x = this.size.width;
		this.follow.x   = this.size.width;
	}
	if (this.position.y < this.size.height){
		this.position.y = this.size.height;
		this.follow.y   = this.size.height;
	}
	if (this.position_dif.x - this.position.x != 0 || this.position_dif.y - this.position.y != 0){
		this.ctx.translate((this.position_dif.x - this.position.x) * repos, 
							    (this.position_dif.y - this.position.y) * repos); 
		this.position_dif.x = this.position.x;
		this.position_dif.y = this.position.y;
	}
} 
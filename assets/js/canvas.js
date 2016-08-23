var 
	hdConstraints = {
		video: {
			mandatory: {
				minWidth: 1280,
				minHeight: 720
			}
		}
	},
	vgaConstraints = {
		video: {
			mandatory: {
				maxWidth: 640,
				maxHeight: 360
			}
		}
	};

var canvas = {
	realTime: false,
	img: null,
	imgData: null,
	state: 0,//0-cam,1-image,2-realTime
	top: 0,
	left: 0,
	w: 0,
	h: 0,
	video: null,
	obj: null,
	ctx: null,
	container: null
};

canvas.init = function(){
	this.video = document.getElementById('video');
	this.obj = document.getElementById('canvas');
	this.ctx = document.getElementById('canvas').getContext('2d');
	this.container = document.getElementById('main_container');		
}

canvas.changeState = function(value){
	this.state = value;
	this.video.style.display = (value==0) ? "block" : "none";
	this.obj.style.display   = (value==0) ? "none"  : "block";
	this.w = (value==0 || value==2) ? this.video.videoWidth : this.img.width;
	this.h = (value==0 || value==2) ? this.video.videoHeight : this.img.height;
	this.resize();
	if (value == 1)
	{
		this.ctx.drawImage(this.img, 0, 0, this.w, this.h);
		this.imgData = this.ctx.getImageData(0, 0, this.w, this.h);
		this.video.pause();
	}
	else
	{
		this.video.play();
	}
}

canvas.resize = function(){	
	var ch = this.container.offsetHeight,
		cw = this.container.offsetWidth,
		objscale  = this.w/this.h,
		canvasscale = cw/ch,
		w = h = 0;
	if (objscale>canvasscale)
	{
		w=cw;
		h=Math.round(w/objscale);
	}
	else
	{
		h=ch;
		w=Math.round(h*objscale);
	}
	var l = Math.round((cw-w)/2), 
		t = Math.round((ch-h)/2);
	
	canvas.w = this.obj.width  = this.video.width  = w;
	canvas.h = this.obj.height = this.video.height = h;
	
	canvas.top  = t; 
	this.obj.style.top = this.video.style.top = t+'px';
	canvas.left = l; 
	this.obj.style.left = this.video.style.left = l+'px';
}

canvas.loadImg = function(_path){
	var img = new Image();
	img.src = _path;
	var that = this;
	img.onload = function(){
		canvas.img = img;
		canvas.changeState(1);
		message.show('GREAT! Now choose the average point.');
	}	
}
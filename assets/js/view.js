'use strict';

const 
	CAMERA_STATE = 0,
	REALTIME_STATE = 1,
	IMAGE_STATE = 2,
	//VIDEO CONSTRAINTS
	QVGA = { video: {width: {exact: 320}, height: {exact: 240}}	},
	VGA = { video: {width: {exact: 640}, height: {exact: 480}} },
	HD = { video: {width: {exact: 1280}, height: {exact: 720}} },
	FULLHD = { video: {width: {exact: 1920}, height: {exact: 1080}} },
	REARCAMERA = { video: { facingMode: { exact: "environment" } } },
	FRONTCAMERA = { video: { facingMode: "user" } };
	
var view = {
	state: 0,
	timer: null,
	container: null,
	canvas: null,
	video: null,
	ctx: null,
	devices: new List(),
	size: {width: 0, height: 0},
	position: {left: 0, top: 0}
}

view.changeState = function(value){
	this.state = value;
	this.video.style.display  = (value==0) ? "block" : "none";
	this.canvas.style.display = (value==0) ? "none"  : "block";
	this.size.width = (value==CAMERA_STATE || value==REALTIME_STATE) ? this.video.videoWidth : this.img.width;
	this.size.height = (value==CAMERA_STATE || value==REALTIME_STATE) ? this.video.videoHeight : this.img.height;
	this.resize();
	if (value == CAMERA_STATE)
	{
		this.canvas.style.display = 'none';
		this.video.style.display  = 'block';
		this.video.play();
	}	
	else if (value == REALTIME_STATE)
	{
		this.video.style.display  = 'none';
		this.canvas.style.display = 'block';
		this.video.play();
    	this.timer = compatibility.requestAnimationFrame(view.realtime);
	}	
	else if (value == IMAGE_STATE)
	{
		this.video.style.display  = 'none';
		this.canvas.style.display = 'block';
		if (window.stream)
			window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
		//this.ctx.drawImage(this.img, 0, 0, this.w, this.h);
		//this.imgData = this.ctx.getImageData(0, 0, this.w, this.h);
	}
}

view.resize = function(){
	var ch = this.container.offsetHeight,
		cw = this.container.offsetWidth,
		objscale  = this.size.width/this.size.height,
		canvasscale = cw/ch,
		w = 0, h = 0;
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
	
	this.size.width  = this.canvas.width  = this.video.width  = w;
	this.size.height = this.canvas.height = this.video.height = h;
	
	this.position.top  = t; 
	this.canvas.style.top = this.video.style.top = t+'px';
	this.position.left = l; 
	this.canvas.style.left = this.video.style.left = l+'px';
}

view.loadImg = function(path){
	var img = new Image();
	img.src = path;
	var that = this;
	img.onload = function(){
		canvas.img = img;
		view.changeState(IMAGE_STATE);
		message.show('GREAT! Now choose the average point.');
	}		
}

view.handleError = function(error){
	console.log(error);
	message.show('error');
}

view.getStream = function(stream){
	message.show('success');
	window.stream = stream; 
	view.video.srcObject = stream;	
  	return navigator.mediaDevices.enumerateDevices();
}

view.changeCamera = function(){
	if (window.stream)
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
   	navigator.mediaDevices.enumerateDevices().then(
   		function(deviceInfos){
			view.devices.empty();
			var lastDevice = null;
			for (var i = 0; i !== deviceInfos.length; ++i) 
			{
				var deviceInfo = deviceInfos[i];
				if (deviceInfo.kind === 'videoinput')
				{
					view.devices.add(deviceInfo.deviceId, deviceInfo.label);
					lastDevice = deviceInfo.label;		
				}
			}
			if (view.devices.current == null)
				view.devices.current = view.devices.items.last().id;
			else
				view.devices.next();
			var constraints = {
				video: {deviceId: {exact: view.devices.getCurrent()} }
			};
			navigator.mediaDevices.getUserMedia(constraints).then(view.getStream).catch(view.handleError);
		}
   	).catch(view.handleError);
}

view.init = function(){		
	window.onresize = function(event){
		view.changeState(view.state);
	}; 			

	this.container = document.getElementById('main_container');
	this.video  = document.getElementById('video');
	this.canvas = document.getElementById('canvas');
	this.ctx = this.canvas.getContext('2d');		
	
	this.video.addEventListener('loadeddata', 
		function(){			
            view.changeState(REALTIME_STATE);
		}
	);	

	var constraint = {
		video: {
		    width: { min: 640, ideal: 1280, max: 1920 },
		    height: { min: 480, ideal: 720, max: 1080 }
		  }
	}

	view.changeCamera();	
}

view.setRealTime = function(){
	if (view.state == REALTIME_STATE)
	{
		compatibility.cancelAnimationFrame(this.timer);
		view.changeState(CAMERA_STATE);	
	}
	else
		view.changeState(REALTIME_STATE);
}

view.realtime = function(){
    compatibility.requestAnimationFrame(view.realtime);
	if (view.video.readyState === view.video.HAVE_ENOUGH_DATA) {
		var
		size=view.size.width*view.size.height,
		mapmag = new Int32Array(size), 
		mapdir = {x: new Int32Array(size),
					y: new Int32Array(size)};

		view.ctx.drawImage(view.video, 0, 0, view.size.width, view.size.height);
		var imgdata = view.ctx.getImageData(0, 0, view.size.width, view.size.height),
			input = imgdata.getGrayChannel();
		for (var i = 0; i<imgdata.data.length; i+=4)
		{
			imgdata.data[i]=imgdata.data[i+1]=0;
		}
		//fastSobel(input, mapmag, mapdir, canvas.w,canvas.h);
		//imgdata.setGrayChannel(mapmag);
		view.ctx.putImageData(imgdata, 0, 0);
	}
}
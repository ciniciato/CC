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
	state: null,
	realtime: false,
	timer: null,
	img: null,	
	container: null,
	canvas: null,
	buff: null,
	video: null,
	ctx: null,
	devices: new List(),
	size: {width: 0, height: 0},
	position: {left: 0, top: 0}
}

view.changeState = function(value){
	this.state = value;
	this.video.style.display  = (value==CAMERA_STATE) ? "block" : "none";
	this.canvas.style.display = (value==CAMERA_STATE) ? "none"  : "block";

	view.realtime = false;
	compatibility.cancelAnimationFrame(this.timer);

	view.resize();

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
		this.realtime = true;
		this.video.play();
    	this.timer = compatibility.requestAnimationFrame(view.stepRealtime);
	}	
	else if (value == IMAGE_STATE)
	{
		this.video.pause();
		this.video.style.display  = 'none';
		this.canvas.style.display = 'block';
		view.ctx.drawImage(view.img, 0, 0, view.size.width, view.size.height);
		view.filter();
	}
}

view.resize = function(){
	view.size.width = (view.state==CAMERA_STATE || view.state==REALTIME_STATE) ? view.video.videoWidth : view.img.width;
	view.size.height = (view.state==CAMERA_STATE || view.state==REALTIME_STATE) ? view.video.videoHeight : view.img.height;

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

	if (view.state == IMAGE_STATE)
	{
		view.ctx.drawImage(view.img, 0, 0, view.size.width, view.size.height);
		view.filter();
	}
	adaptiveThreshold.resize();
	segment.resize();
}

view.loadImg = function(path){
	var img = new Image();
	img.src = path;
	var that = this;
	img.onload = function(){
		view.img = img;
		view.changeState(IMAGE_STATE);
	}		
}

view.handleError = function(error){
	console.log(error);
}

view.getStream = function(stream){
	window.stream = stream; 
	view.video.srcObject = stream;	
  	return navigator.mediaDevices.enumerateDevices();
}

view.changeCamera = function(){
	var previousState = view.state;
	if (view.state === IMAGE_STATE) 
		if (view.realtime) 
			view.changeState(REALTIME_STATE);
		else
			view.changeState(CAMERA_STATE);

	if (window.stream && previousState != IMAGE_STATE)
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
			else if (previousState != IMAGE_STATE) 
				view.devices.next();
			var constraints = {
				video: {deviceId: {exact: view.devices.getCurrent()} }
			};
			if (previousState != IMAGE_STATE) 
				navigator.mediaDevices.getUserMedia(constraints).then(view.getStream).catch(view.handleError);
		}
   	).catch(view.handleError);
}

view.init = function(){		
	window.onresize = function(event){
		view.resize();
	}; 			

	this.container = document.getElementById('main_container');
	this.video  = document.getElementById('video');
	this.canvas = document.getElementById('canvas');
	this.ctx = this.canvas.getContext('2d');		
	
	this.video.addEventListener('loadeddata', 
		function(){			
			if (view.state === null)
			{
            	view.changeState(REALTIME_STATE);
				view.resize();
			}
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
		view.changeState(CAMERA_STATE);	
	else
		view.changeState(REALTIME_STATE);
}

view.stepRealtime = function(){
    if (view.realtime) compatibility.requestAnimationFrame(view.stepRealtime);
	if (view.realtime && view.video.readyState === view.video.HAVE_ENOUGH_DATA) {
		view.ctx.drawImage(view.video, 0, 0, view.size.width, view.size.height);
		view.filter();
	}
}

view.filter = function(){
	var imgdata = view.ctx.getImageData(0, 0, view.size.width, view.size.height);		
	adaptiveThreshold.data = imgdata.getGrayChannelNormalized();
	adaptiveThreshold.apply();
	
	segment.data = adaptiveThreshold.data;
	segment.apply();
	imgdata.setGrayChannel(segment.oData);
//	imgdata.setGrayChannel(adaptiveThreshold.data);
	
	view.ctx.putImageData(imgdata, 0, 0);
}
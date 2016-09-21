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
	FRONTCAMERA = { video: { facingMode: "user" } },
	DEFAULT_VIDEO = {
						video: {
							width: { min: 640, ideal: 1280, max: 1920 },
							height: { min: 480, ideal: 720, max: 1080 }
						  }
					};

var
	ALL_NEIGHBORS = [],//NE, SE, SW, NW, RIGHT, BOTTOM, LEFT, TOP
	FOUR_NEIGHBORS = [];//RIGHT, BOTTOM, LEFT, TOP
	
var view = {
	state: null,
	realtime: false,
	timer: null,
	container: null,
	canvas: null,
	ctx: null,
	video: null,
	img: null,	
	devices: new List(),
	size: {width: 0, height: 0},
	position: {left: 0, top: 0},
	markPoints: null,

	camera: {
		newPosition: [0,0],
		position: [0,0],
		size: [0,0],
		scale: 1,
		newScale: 1
	}
}

view.camera.pan = function(dist){
	this.newPosition[0] += dist[0]/this.scale;
	this.newPosition[1] += dist[1]/this.scale;
}

view.camera.update = function(){
	var
		zoom = this.newScale - this.scale,//Math.round((this.newScale - this.scale)*100)/100,
		panX = this.newPosition[0] -  this.position[0],
		panY = this.newPosition[1] -  this.position[1];

	//zoom
	if (Math.round(zoom) != 0)
	{
		this.scale += zoom;
	}
	if (this.scale<1){
		this.scale = 1;
		this.newScale = 1;
	}
	
	this.size = [view.size.width/this.scale/2, 
			 	view.size.height/this.scale/2];	

	//pan
	if (panX) 
	{
		var pan = panX;
		if (!isNaN(pan)) this.position[0] += pan;
	}
	if (panY)
	{
		pan = panY;
		if (!isNaN(pan)) this.position[1] += pan;
	}
	
	if (this.position[0] < this.size[0])
	{
	 	this.position[0] = this.newPosition[0] = this.size[0];
	} else if (this.position[0] > view.size.width - this.size[0])
	{
		this.position[0] = this.newPosition[0] = view.size.width - this.size[0];
	}

	if (this.position[1] < this.size[1])
	{
	 	this.position[1] = this.newPosition[1] = this.size[1];
	} else if (this.position[1] > view.size.height - this.size[1])
	{
		this.position[1] = this.newPosition[1] = view.size.height - this.size[1];
	}
}

view.drawImage = function(){
	var pos = [(this.camera.position[0] - this.camera.size[0]) * this.camera.scale,
				(this.camera.position[1] - this.camera.size[1]) * this.camera.scale];

	view.ctx.drawImage(view.img, 
				-Math.round(pos[0]), -Math.round(pos[1]), 
				view.size.width*this.camera.scale, view.size.height*this.camera.scale);
	view.filter();
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
		control.countMode();
		//this.drawImage();
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
	
	this.size.width = this.canvas.width  = this.video.width  = w;
	this.size.height = this.canvas.height = this.video.height = h;
	
	this.position.top  = t; 
	this.canvas.style.top = this.video.style.top = t+'px';
	this.position.left = l; 
	this.canvas.style.left = this.video.style.left = l+'px';

	ALL_NEIGHBORS  = [1-w, 1+w, -1+w, -1-w, 1, w, -1, -w];
	FOUR_NEIGHBORS = [1, w, -1, -w];
	
	filters.resize();

	if (view.state == IMAGE_STATE) view.drawImage();
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
	control.captureMode();
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
			if (view.devices.current == null && view.devices.size>0)
				view.devices.current = view.devices.items.last().id;
			else if (previousState != IMAGE_STATE) 
				view.devices.next();
			var constraints = {
				video: {
					deviceId: {exact: view.devices.getCurrent()},
				    width: { min: 640, ideal: 1280, max: 1920 },
				    height: { min: 480, ideal: 720, max: 1080 }
				}
			};
			if (previousState != IMAGE_STATE) 
				navigator.mediaDevices.getUserMedia(constraints).then(view.getStream).catch(view.handleError);
		}
   	).catch(view.handleError);
}

view.setRealTime = function(){
	if (view.state == REALTIME_STATE)
		view.changeState(CAMERA_STATE);	
	else
		view.changeState(REALTIME_STATE);
}

view.stepRealtime = function(){
	if (view.realtime)
	{
		if (view.video.readyState === view.video.HAVE_ENOUGH_DATA) {
			view.ctx.drawImage(view.video, 0, 0, view.size.width, view.size.height);
			view.filter();
	  		compatibility.requestAnimationFrame(view.stepRealtime);
		}else
	   		compatibility.requestAnimationFrame(view.stepRealtime);
   	}
}

view.filter = function(){
	filters.imgData = view.ctx.getImageData(0, 0, view.size.width, view.size.height);
	var grayC = filters.imgData.getGrayChannel(), t= filters.imgData.getGrayChannel();
	//filters.fastSobel(t, grayC);
	//grayC=filters.cannyEdge.apply(grayC);

	//filters.invert(grayC);
	filters.adaptiveThreshold(grayC, filters.buffData, Math.round(filters.params.wsize*view.camera.scale), filters.params.thresh);//10ms on video
	//filters.cannyEdge.apply(grayC);
	//filters.invert(grayC);
	//filters.threshold(grayC,120);
	//filters.imgData.setGrayChannel(grayC); view.ctx.putImageData(filters.imgData, 0,0);	
	
	filters.segmentation.apply(grayC);//15ms on video	
	control.regions = filters.segmentation.regions;
	control.regionsLen = filters.segmentation.regionsLen;
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
            	view.changeState(CAMERA_STATE);
				view.resize();
			}
		}
	);	

   //view.loadImg('canvasc.png');
	view.changeCamera();	
}
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
	container: null,
	canvas: null,
	video: null,
	ctx: null,
	devices: new List(),
	size: {width: 0, height: 0},
	position: {left: 0, top: 0}
}

view.getDevices = function(deviceInfos){
	view.devices.clear();
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		if (deviceInfo.kind === 'videoinput')
			view.devices.add(deviceInfo.deviceId);		
	}
}

view.changeState = function(value){
	this.state = value;
	this.video.style.display  = (value==0) ? "block" : "none";
	this.canvas.style.display = (value==0) ? "none"  : "block";
	this.size.width = (value==CAMERA_STATE || value==REALTIME_STATE) ? this.video.videoWidth : this.img.width;
	this.size.height = (value==CAMERA_STATE || value==REALTIME_STATE) ? this.video.videoHeight : this.img.height;
	this.resize();
	if (value == 1)
	{
		//this.ctx.drawImage(this.img, 0, 0, this.w, this.h);
		//this.imgData = this.ctx.getImageData(0, 0, this.w, this.h);
		this.video.pause();
	}
	else
	{
		this.video.play();
	}	
}

view.resize = function(){
	var ch = this.container.offsetHeight,
		cw = this.container.offsetWidth,
		objscale  = this.size.width/this.size.height,
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
		canvas.changeState(1);
		message.show('GREAT! Now choose the average point.');
	}		
}

view.handleError = function(error){
	console.log(error);
	message.show(error);
}

view.gotStream = function(stream){
	message.show(stream);
	window.stream = stream; 
	this.video.srcObject = stream;
	return navigator.mediaDevices.enumerateDevices();
}

view.changeCamera = function(){
	this.video.pause();
	this.devices.next();
	var constraints = {
		video: {deviceId: {exact: view.devices.current} }
	};	  
	message.show('Camera:'+view.devices.currentID);
	navigator.mediaDevices.getUserMedia(constraints).
			then(this.gotStream).catch(this.handleError);	
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
            view.changeState(CAMERA_STATE);
		}
	);	

	navigator.mediaDevices.getUserMedia({video: {deviceId: undefined}}).
			then(this.gotStream).then(this.getDevices).catch(this.handleError);	
}
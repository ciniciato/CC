'use strict';

var control = {
	regions: null,
	regionsLen: 0,
	currentScreen: null,
	fullscreen: false,
	
	pointer: null,
	neuralNet: null,
	camera: null,
	dontScroll: false,
	counter: 0,
	hasChanged: false
}

control.changeScreen = function(id){
	if (this.currentScreen.id == 'initial_screen') animation.fade('initial_screen', id,0,1);
	else animation.slide(this.currentScreen.id, id, 0, 1);		
	this.currentScreen = document.getElementById(id);
}

control.setEvents = function(){	
	
	document.getElementById('btn_enableRealTime').addEventListener('click', view.setRealTime, false);
	
	document.getElementById('openFile').addEventListener('change', control.loadPhoto, false);
	
	document.getElementById('btn_changeCamera').addEventListener('click', view.changeCamera, false);
	
	document.getElementById('btn_changeScreenSize').addEventListener('click', control.changeScreenSize, false);	
	
	document.getElementById('btn_autoSetParameters').addEventListener('click', control.btn_autoSetParameters, false);	


	document.getElementById('btn_capture').addEventListener('click', control.snap, false);	
	
	//CHECKS MENU
	document.getElementById('btn_right').addEventListener('click', control.selectRightPoints, false);	
	//document.getElementById('btn_tooMany').addEventListener('click', control.selectTooManyPoints, false);
	document.getElementById('btn_wrong').addEventListener('click', control.selectWrongPoints, false);	
	
	compatibility.onfullscreenchange(
		function(e){
			control.fullscreen = !control.fullscreen;
			if (control.fullscreen)
				document.getElementById('btn_changeScreenSize').className = 'fa fa-compress';
			else
				document.getElementById('btn_changeScreenSize').className = 'fa fa-expand';
		}
	);
	
	document.getElementById('treshold_slider').addEventListener('input', 
		function(e){
			filters.params.thresh = 1-Number(e.target.value);
			if (view.state==IMAGE_STATE) view.drawImage();
			control.hasChanged = true;
		}, 
		false);
	document.getElementById('size_slider').addEventListener('input', 
		function(e){
			filters.params.wsize = Math.ceil(view.size.width/Math.pow(2,(Number(e.target.value)) ) );
			if (view.state==IMAGE_STATE) view.drawImage();
			control.hasChanged = true;
		}, 
		false);
}

control.loadProperties = function(){
	var valThresh = (localStorage.getItem('treshold_slider')) ? localStorage.getItem('treshold_slider') : .01;
	document.getElementById('treshold_slider').value = valThresh;
	console.log(valThresh);
	filters.params.thresh = 1-Number(valThresh);

	var valSize = (localStorage.getItem('size_slider')) ? localStorage.getItem('size_slider') : 10;
	document.getElementById('size_slider').value = valSize;
	filters.params.wsize = valSize;
}

control.changeScreenSize = function(){
	if (control.fullscreen)
		compatibility.exitFullscreen();	
	else
		compatibility.requestFullScreen();
}
		
control.loadPhoto = function(evt) {
	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
	  if (!f.type.match('image.*'))
		continue;
	  var reader = new FileReader();
	  reader.onload = (function(theFile) {
		return function(e) {
			var path = e.target.result,
				fileName = escape(theFile.name);
			view.loadImg(path);
		};
	  })(f);
	  reader.readAsDataURL(f);
	}
}

control.timer = {
	beforeTime: 0,
	delay: 0,
	fallback: null,
	isRunning: false,

	toDoList: new Array(),

	step: function(){},
	run: function(){
		if  (control.timer.isRunning)
		{
			var now = new Date().valueOf();
			control.delay = now - control.beforeTime;
			control.beforeTime = now;


			view.camera.update();
			try
			{
				if (control.hasChanged)
				{
					view.drawImage();
					control.setQuantity(control.counter);
					control.hasChanged = false;
				}
			}
			catch(err) 
			{
			}

			control.timer.step();

			control.timer.fallback = compatibility.requestAnimationFrame(control.timer.run);
		}
	},
	start: function(doAction){
		if (!this.isRunning)
		{
			this.isRunning = true;
			this.beforeTime = new Date().valueOf();
			this.step = doAction || function(){};
			setTimeout(
				this.run(),
				5000);
		}
	},
	stop: function(){
		if (this.isRunning)
		{
			this.isRunning = false;		
			compatibility.cancelAnimationFrame(this.fallback);
		}
	}
} 

control.snap = function(){
	var el = document.getElementById('btn_capture');
	el.style.display='none';
				
	var previousState = view.state;

	view.img = view.video;
	view.changeState(IMAGE_STATE);
}

control.btn_autoSetParameters = function(){
	control.dontScroll = true;
	var isDrawing = false,
		firstPoint = {x: 0, y: 0},
		secondPoint = {x: 0, y: 0};

	function evalute(){		
		var 
			ctx = view.ctx,			
			dx = firstPoint.x - secondPoint.x, 
			dy = firstPoint.y - secondPoint.y,
			radius = Math.abs(Math.round(Math.sqrt(dx*dx+dy*dy))),

			px = (firstPoint.x-radius < 0) ? 0 : firstPoint.x-radius,
			py = (firstPoint.y-radius < 0) ? 0 : firstPoint.y-radius,
			h = (py+radius*2>view.size.height) ? view.size.height - py : radius*2,
			w = (px+radius*2>view.size.width) ? view.size.width - px : radius*2,  
		    selectedData = view.ctx.getImageData(px, py, w, h).getGrayChannel();
			
			var meanIntensity =  filters.otsu(selectedData, 1);
			console.log('Otsu intensity:' +meanIntensity);
			
			function getThresh(meanThresh, wSize, channel, iChannel){
				wSize = Math.round(wSize/2);
				filters.integralize(channel, iChannel);
				var a=0, b=0, c=0, d=0, 
					area=0, sum=0, 
					i=0,
					y= firstPoint.y - wSize, x = firstPoint.x - wSize,
					ax=0, ay=0,
					bx=0, by=0,
					h = view.size.height,
					w = view.size.width,
					results = new Array();

				for(y=firstPoint.y - wSize; y<firstPoint.y + wSize ; y++)
					for(x=firstPoint.x - wSize; x< firstPoint.x + wSize; x++)
					{
						i = x + y*w;
						
						ax = (x - wSize < 0) ? 0 : x - wSize;
						ay = (y - wSize < 0) ? 0 : y - wSize;
						bx = (x + wSize >= w) ? w-1: x + wSize;
						by = (y + wSize >= h) ? h-1: y + wSize;

						area = (bx - ax)*(by - ay);

						a = iChannel[bx + by*w];
						b = iChannel[bx + ay*w];
						c = iChannel[ax + by*w];
						d = iChannel[ax + ay*w];

						sum = a-b-c+d;
						if (channel[i] <= meanThresh)
							results.push(channel[i]*area/sum);
					}
				return results.stats().mean;
			}//getTresh
							
			filters.imgData = view.ctx.getImageData(0, 0, view.size.width, view.size.height);
			
			var grayC = filters.imgData.getGrayChannel();
			
			var t = getThresh(meanIntensity, radius, grayC, filters.buffData);	
			radius = Math.round(radius/view.camera.scale);	
			console.log('Thresh:'+t);	
			console.log('Radius:'+radius);
			
		
			filters.params.thresh = t;
			filters.params.wsize = radius;
	}
		
	control.timer.step =
		function(){
				if (control.pointer.isDown)
				{
					control.hasChanged = true;
					isDrawing=true;
					
					var ctx = view.ctx;
					
					firstPoint = control.pointer.dragPosition;
					secondPoint = control.pointer.position;
					
					var
						dx = firstPoint.x - secondPoint.x, 
						dy = firstPoint.y - secondPoint.y,
						radius  = Math.sqrt(dx*dx+dy*dy);

					ctx.lineWidth = 2;
					ctx.strokeStyle='#fba026';
					ctx.beginPath();
					ctx.arc(firstPoint.x, firstPoint.y, radius, 0, 2 * Math.PI, false);
					ctx.stroke();
					console.log('aaa');
				} 
				else if (isDrawing)
				{
					var
						dx = firstPoint.x - secondPoint.x, 
						dy = firstPoint.y - secondPoint.y,
						radius  = Math.sqrt(dx*dx+dy*dy);
					if (radius > 1)
						evalute();
					view.camera.newScale = 1;
					control.dontScroll = false;
					control.hasChanged = true;
					isDrawing = false;
					control.timer.step = function(){};
				}
		};
}

control.setQuantity = function(qtd){
	document.getElementById('box_quantity').innerHTML = qtd;
}

control.selectRightPoints = function(){
	var isDrawing = false,
		firstPoint = {x: 0, y: 0},
		secondPoint = {x: 0, y: 0};
		
	control.timer.start(
		function(){
			var ctx = view.ctx,
					position = control.pointer.position,
					radius = filters.params.wsize;
			
			//view.drawImage();
			ctx.drawImage(view.img, 0, 0, view.size.width, view.size.height);
			filters.segmentation.showPolygon('yellow');
			if (control.pointer.isDown)
			{
				for (var i = 0; i<control.regionsLen; i++)
				{
					if (polygon.ContainsPoint(control.regions[i].polygon, radius,
									control.pointer.position.x, control.pointer.position.y))
					{
						control.regions[i].group = 1;
					}
				}
			}

			ctx.lineWidth = 2;
			ctx.strokeStyle='#00a885';
			ctx.beginPath();
			ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	);//control.timer
}

control.selectWrongPoints = function(){
	var isDrawing = false,
		firstPoint = {x: 0, y: 0},
		secondPoint = {x: 0, y: 0};
		
	control.timer.start(
		function(){
			var ctx = view.ctx,
					position = control.pointer.position,
					radius = filters.params.wsize;
			
			view.drawImage();

			ctx.lineWidth = 2;
			ctx.strokeStyle='#d14841';
			ctx.beginPath();
			ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	);//control.timer
}

control.selectTooManyPoints = function(){
	var isDrawing = false,
		firstPoint = {x: 0, y: 0},
		secondPoint = {x: 0, y: 0};
		
	control.timer.start(
		function(){
			var ctx = view.ctx,
					position = control.pointer.position,
					radius = filters.params.wsize;
			
			view.drawImage();

			ctx.lineWidth = 2;
			ctx.strokeStyle='#fba026';
			ctx.beginPath();
			ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	);//control.timer
}

control.captureMode = function(){
	document.getElementById('checks_menu').style.display = 'none';
	document.getElementById('btn_autoSetParameters').style.display = 'none';

	document.getElementById('btn_capture').style.display = 'block';
	document.getElementById('btn_enableRealTime').style.display = 'inline';

	control.timer.stop();
}

control.countMode = function(){
	document.getElementById('checks_menu').style.display = 'block';
	document.getElementById('btn_autoSetParameters').style.display = 'inline';

	document.getElementById('btn_capture').style.display = 'none';
	document.getElementById('btn_enableRealTime').style.display = 'none';
	document.getElementById('video').style.display = 'none';

	control.hasChanged = true;
	control.timer.start();
}

control.init = function(){	
	this.neuralNet = new neuralNet({ 
							layers: [3,3,1],
							learning_rate: 0.01,
							hasBias: true
						});							

	this.currentScreen = document.getElementById('initial_screen');
	if (!localStorage.getItem('notFirstTime'))
	{
  		localStorage.setItem('notFirstTime', true);
		animation.initial_screen();
	} else
		this.changeScreen('main_screen');
	this.setEvents();
	
	view.init();

	this.camera	= new Camera();	
	this.pointer = new Pointer(view.canvas);
	this.pointer.events.onscroll = function(delta){
		if (view.camera.scale >=1)
		{
			view.camera.newScale += -view.camera.scale*delta/30/5; 
			control.hasChanged = true;
		}
	}
	this.pointer.events.onmove = function(){
		if (!control.dontScroll && control.pointer.isDown && control.pointer.hasMoved)
		{
			view.camera.pan(control.pointer.resetDrag());	
			control.hasChanged = true;
		}
	}
	this.pointer.events.ondblclick = function(){
		var relativePos = [view.camera.position[0] - view.camera.size[0]  + control.pointer.position.x / (view.camera.scale),
							view.camera.position[1] - view.camera.size[1]  + control.pointer.position.y / (view.camera.scale)];

		view.camera.newScale = view.camera.scale * 2;
		view.camera.newPosition[0] = relativePos[0];
		view.camera.newPosition[1] = relativePos[1];
		control.hasChanged = true;
	}
}
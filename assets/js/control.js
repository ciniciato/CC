var control = {
}

var control = {
	requestAnimationFrame: null,
	timer: null
}

control.step = function(){
    compatibility.requestAnimationFrame(control.step);
	if (canvas.video.readyState === canvas.video.HAVE_ENOUGH_DATA) {
		var
		size=canvas.w*canvas.h,
		mapmag = new Int32Array(size), 
		mapdir = {x: new Int32Array(size),
					y: new Int32Array(size)};

		canvas.ctx.drawImage(canvas.video, 0, 0, canvas.w, canvas.h);
		var imgdata = canvas.ctx.getImageData(0, 0, canvas.w, canvas.h),
		input = imgdata.getGrayChannel();
		fastSobel(input, mapmag, mapdir, canvas.w,canvas.h);
		imgdata.setGrayChannel(mapmag);
		canvas.ctx.putImageData(imgdata, 0, 0);
	}
}

control.init = function(){
	canvas.init();
	document.getElementById('openFile').addEventListener('change', control.loadPhoto, false);
	compatibility.getUserMedia({video: true}, 
		function(stream) {
            try {
                canvas.video.src = compatibility.URL.createObjectURL(stream);
            } catch (error) {
                canvas.video.src = stream;
            }
            canvas.video.play();
        }, 
        function (error) {
   		}
   	);	

    canvas.video.addEventListener('loadeddata', 
		function(){			
            canvas.changeState(2);
			control.timer =  setTimeout(
					function() {				
                    	compatibility.requestAnimationFrame(control.step);
					}, 
				500);
		}
	);	
}
		
control.takePhoto = function(){
	canvas.changeState(0);
	document.getElementById('snap_button').style = 'display:block';
	message.show('TAKE A PHOTO!');
	message.confirm.hide();
}
		
control.loadPhoto = function(evt) {
	console.log
	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
	  if (!f.type.match('image.*'))
		continue;
	  var reader = new FileReader();
	  reader.onload = (function(theFile) {
		return function(e) {
			var path = e.target.result,
				fileName = escape(theFile.name);
			canvas.loadImg(path);
		};
	  })(f);
	  reader.readAsDataURL(f);
	}
  }

control.snap = function(){
	var el = document.getElementById('snap_button');
	el.style.display='none';
				
	canvas.img = canvas.video;
	canvas.changeState(1);
	
	message.show('Can we count on it?');
	message.confirm.show(
		function(value){	
			if (value)
			{
				message.show('GREAT! Now choose the average point.');
			}
			else
			{					
				control.takePhoto();
			}
		}
	);
}

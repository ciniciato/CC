var control = {
}

//<input type="file" accept="image/*;capture=camera"> tirar foto
//{ audio: true, video: { facingMode: { exact: "environment" } } } rearcamera
//{ audio: true, video: { facingMode: "user" } } frontcamera
/*
video: {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 776, ideal: 720, max: 1080 }
  }
*/

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  var constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).then(gotDevices).catch(handleError);
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
		var imgdata = canvas.ctx.getImageData(0, 0, canvas.w, canvas.h);
		//input = imgdata.getGrayChannel();
		//fastSobel(input, mapmag, mapdir, canvas.w,canvas.h);
		//imgdata.setGrayChannel(mapmag);
		canvas.ctx.putImageData(imgdata, 0, 0);
	}
}

control.init = function(){
	view.init();
	document.getElementById('openFile').addEventListener('change', control.loadPhoto, false);
	document.getElementById('btn_camera').addEventListener('click', view.changeCamera, false);
}
		
control.takePhoto = function(){
	//canvas.changeState(0);
	//document.getElementById('snap_button').style = 'display:block';
	//message.show('TAKE A PHOTO!');
	//message.confirm.hide();
	//view.changeCamera();
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

'use strict';

var control = {
}

//<input type="file" accept="image/*;capture=camera"> tirar foto

control.init = function(){
	view.init();
	document.getElementById('openFile').addEventListener('change', control.loadPhoto, false);
	document.getElementById('btn_changecamera').addEventListener('click', view.changeCamera, false);
	document.getElementById('btn_realtime').addEventListener('click', view.setRealTime, false);
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

'use strict';

var control = {
	fullscreen: false
}

control.init = function(){
	view.init();
	document.getElementById('openFile').addEventListener('change', control.loadPhoto, false);
	document.getElementById('btn_changecamera').addEventListener('click', view.changeCamera, false);
	document.getElementById('btn_realtime').addEventListener('click', view.setRealTime, false);
	document.getElementById('btn_fullscreen').addEventListener('click', control.setFullscreen, false);
	document.getElementById('btn_config').addEventListener('click', control.showconfig, false);

	compatibility.onfullscreenchange(
		function(e){
			control.fullscreen = !control.fullscreen;
			if (control.fullscreen)
				document.getElementById('btn_fullscreen').className = 'fa fa-compress';
			else
				document.getElementById('btn_fullscreen').className = 'fa fa-expand';
		}
	);

}

control.setFullscreen = function(){
	if (control.fullscreen)
		compatibility.exitFullscreen();	
	else
		compatibility.requestFullScreen();
}

control.showconfig = function(){
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

control.snap = function(){
	var el = document.getElementById('snap_button');
	el.style.display='none';
				
	var previousState = view.state;

	view.img = view.video;
	view.changeState(IMAGE_STATE);
	
	message.show('Can we count on it?');
	message.confirm.show(
		function(value){	
			if (value)
			{
				message.show('GREAT! Now choose the average point.');
			}
			else
			{					
				el.style.display='block';
				view.changeState(previousState);
				message.show('TAKE A PHOTO!');
			}
		}
	);
}

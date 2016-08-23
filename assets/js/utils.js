'use strict';

var message = {
	el: document.getElementById('hint'),
	show: function(txt){
		this.el.innerHTML = txt+'<br>';
	},
	confirm: {
		el: document.getElementById('acceptmsg'),
		doAfter: function(){},
		show: function(callback){
			this.el.style.display = 'block';
			this.doAfter = callback;
		},				
		callback: function(value){
			this.doAfter(value);
			this.hide();
		},
		hide: function(callback){
			this.el.style.display = 'none';
		}
	}
}

var constraints = window.constraints = {
	video: true
};

Array.prototype.last = function(pos){
    var ind = (pos == undefined) ? 1 : (1 + Math.abs(pos));
    return this[this.length - ind];
}; 


function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  canvas.video.srcObject = stream;
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}
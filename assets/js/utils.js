'use strict';

function roundDir(deg) {
    var deg = deg < 0 ? deg + 180 : deg;

    if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
      return 0;
    } else if (deg > 22.5 && deg <= 67.5) {
      return 45;
    } else if (deg > 67.5 && deg <= 112.5) {
      return 90;
    } else if (deg > 112.5 && deg <= 157.5) {
      return 135;
    }
  };
  

var constraints = window.constraints = {
	video: true
};

Array.prototype.last = function(pos){
    var ind = (pos == undefined) ? 1 : (1 + Math.abs(pos));
    return this[this.length - ind];
}; 


//REMOVE DUPLICATES ELEMENTS IN ARRAY
Array.prototype.removeDuplicates = function (){
  var temp = new Array();
  label : for (var i = 0; i < this.length; i++){
            for (var j = 0; j < temp.length; j++){
              if (temp[j].x == this[i].x && temp[j].y == this[i].y)
                continue label;      
            }
            temp[temp.length] = this[i];
          }
  return temp;
}

//CALCULATE MEAN, VARIANCE, STANDARD DEVIATION IN A NUMERIC ARRAY
Array.prototype.stats = function(){
	var stats = this.reduce((a, x) => {
		
		if (a.histo[x] == undefined) a.histo[x]=1;
		else a.histo[x]++;
		
		a.min = (x<a.min) ? x : a.min;
		a.max = (x>a.max) ? x : a.max;
		
		a.N++;
		var delta = x - a.mean;
		a.mean += delta/a.N;
		a.M2 += delta*(x - a.mean);
		return a;
	}, { N: 0, mean: 0, M2: 0, min: this[0], max: this[0], histo:{} });
	if(stats.N > 2) {
		stats.variance = stats.M2 / (stats.N - 1);
		stats.stdev = Math.sqrt(stats.variance);
	}
	return stats;
}


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




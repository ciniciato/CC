'use strict';

ImageData.prototype.duplicate = function(){
	var newImg = new ImageData(this.width, this.height), i = 0, len = this.data.length;
	for (; i < len; ++i)
		newImg.data[i] = this.data[i]
	return newImg;
}

ImageData.prototype.getGrayChannel = function(){
	var newImg = new Uint8ClampedArray(this.width*this.height), i = 0, iN = 0, len = this.data.length;
	for (; i < len; i+=4, iN++)
		newImg[iN] = 0.298 * this.data[i] + 0.586 * this.data[i+1] + 0.114 * this.data[i+2];
	return newImg;
}

ImageData.prototype.getGrayChannelNormalized = function(){
	var newImg = new Float32Array(this.width*this.height), i = iN = 0, len = this.data.length;
	for (; i < len; i+=4, iN++)
		newImg[iN] = (0.298 * this.data[i] + 0.586 * this.data[i+1] + 0.114 * this.data[i+2])/255;
	return newImg;
}

ImageData.prototype.setGrayChannel = function(input){
	var  i = 0, iN=0, len = this.data.length;
	for (; i < len; i+=4, iN++)
		this.data[i]=this.data[i+1]=this.data[i+2] = input[iN];
}

ImageData.prototype.runI = function(_do){
	var i = 0, len = this.data.length;
	for (; i < len; i += 4)
		_do(i);
}

ImageData.prototype.run = function(_do){
	for (var y = 0; y < this.height; y++)
		for (var x = 0; x < this.width; x++)
		{
			_do(x,y);
		}
}
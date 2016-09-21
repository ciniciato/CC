'use strict';
var filters = {
	imgData: null,
	labeledData: null,
	buffData: null,
	resize: function(){
		this.labeledData = new Float32Array(view.size.height*view.size.width);
		this.buffData    = new Float32Array(view.size.height*view.size.width);
		filters.segmentation.resize();
	},
	params: { wsize:6, thresh:.925 }
}

filters.invert = function(channel){
	var i = 0, len = channel.length;
	for (; i < len; i++)
		channel[i] =Math.abs(255-channel[i]);
	return channel;
}

filters.threshold = function(channel, level){
	var i = 0, len = channel.length;
	for (; i < len; i++)
		channel[i] = (channel[i] > level) ? 255 : 0;
	return channel;
}

filters.otsu = function(channel, factor){
	var factor = factor || 1;
	var i = 0, len = channel.length, 
	step = Math.ceil(factor/len),
	histogram = new Int32Array(256),
	sum = 0,
	sumB = 0,
	wB = 0, wF = 0,//weight
	mB = 0, mF = 0,//mean
	variance = 0, maxVar = 0,
	level = 0,
	total = Math.ceil(len/step);

	//calculate histogram
	for (; i < len; i +=  step)
		histogram[channel[i]]++;

	for (i=0 ; i<256 ; i++) sum += i * histogram[i];

	for (i=0 ; i<256 ; i++)
	{		
	   wB += histogram[i];// Weight Background
	   if (wB == 0) continue;

	   wF = total - wB;// Weight Foreground
	   if (wF == 0) break;

	   sumB += i * histogram[i];

	   mB = sumB / wB; 
	   mF = (sum - sumB) / wF; 

	   variance = wB * wF * (mB - mF) * (mB - mF);

	   // Check if new maximum found
	   if (variance > maxVar) {
	      maxVar = variance;
	      level = i;
	   }
	}

	return level;
}

filters.integralize =function(channel, iChannel){
	var h = view.size.height,
		w = view.size.width,
		y=0, x=0,
		a=0, b=0, c=0,
		i=0;
	for(; y<h ; y++)
	{
		for(x=0; x<w; x++, i++)
		{
			a=(x==0 || y==0)?0:iChannel[i-1-w];
			b=(y==0)?0:iChannel[i-w];
			c=(x==0)?0:iChannel[i-1];
			iChannel[i] = c - a + b + channel[i];
		}
	}	
	return iChannel;
}

filters.adaptiveThreshold = function(channel, iChannel, wSize, thresh){
	filters.integralize(channel, iChannel);
	var a=0, b=0, c=0, d=0, 
		area=0, sum=0, 
		i=0,
		y=0, x=0,
		ax=0, ay=0,
		bx=0, by=0,
		h = view.size.height,
		w = view.size.width;

	for(; y<h ; y++)
	{
		for(x=0; x<w; x++, i++)
		{
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
			
			channel[i] = (channel[i] * area <= sum * thresh)?0:255;
		}
	}	
	return channel;
}

filters.fastSobel = function(channel, output) {
    var x=1, y=1,
    	difx=0,	dify=0,
		h = view.size.height, w = view.size.width, len=channel.length,
    	pRow=0,	row=w, nRow=w+w,
    	mapDir = {x: new Float32Array(len), y:new Float32Array(len)};

    for(; y < h-1; y++, row+=w, pRow+=w, nRow+=w) {
        for(x = 1; x < w-1; x++) {        	
            difx = channel[row+x-1]  -channel[row+x+1];//x
            dify = channel[pRow+x]   -channel[nRow+x];//y

        	mapDir.x[row+x]  += difx;
        	mapDir.x[pRow+x] += difx+difx;
        	mapDir.x[nRow+x] = difx;

        	mapDir.y[row+x]   += dify+dify;
        	mapDir.y[row+x-1] += dify;        	
        	mapDir.y[row+x+1] =  dify; 

        	output[pRow+x] = 2*Math.round(Math.sqrt(mapDir.x[pRow+x]*mapDir.x[pRow+x]+mapDir.y[pRow+x]*mapDir.y[pRow+x]));   
        }
    }
}


filters.dilate = function(ichannel, ochannel, color){
	var i=0,
		y=0, x=0,
		h = view.size.height,
		w = view.size.width;
	var dirs = [-1,1,w,-w,w-1,w+1,-w-1,-w+1];
	for(y=2; y<h-2; y++)
		for(x=2; x<w-2; x++)
		{
			i=x+y*w;		
			if (ichannel[i]==color)
				for (var k=0; k < 8; k++)
					ochannel[i+dirs[k]]=color;
		}
	return ochannel;
}
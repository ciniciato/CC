'use strict';
var adaptiveThreshold = {
	iData: null,
	data: null,
	DOM: {},
	init: function(){
		this.DOM.windowSize = document.getElementById('w_range');
		this.DOM.threshold  = document.getElementById('t_range');
	},
	changeParameters: function(){
		var that = adaptiveThreshold;
		that.parameters = {windowSize: Math.ceil(Number(that.DOM.windowSize.value)*view.size.height), 
				threshold: 1 - Number(that.DOM.threshold.value)};
	},
	parameters: {windowSize: 10, threshold: .9},
	resize: function(){
		this.iData = new Float32Array(view.size.width*view.size.height);
	},
	integralize: function(){
		var h = view.size.height,
			w = view.size.width,
			y=0, x=0,
			a=0, b=0, c=0,
			i=0;
		for(; y<h ; y++)
		{
			for(x=0; x<w; x++, i++)
			{
				a=(x==0 || y==0)?0:this.iData[i-1-w];
				b=(y==0)?0:this.iData[i-w];
				c=(x==0)?0:this.iData[i-1];
				this.iData[i] = c - a + b + this.data[i];
			}
		}
	},
	apply: function(){
		this.integralize();
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
				ax = (x - this.parameters.windowSize < 0) ? 0 : x - this.parameters.windowSize;
				ay = (y - this.parameters.windowSize < 0) ? 0 : y - this.parameters.windowSize;
				bx = (x + this.parameters.windowSize >= w) ? w-1: x + this.parameters.windowSize;
				by = (y + this.parameters.windowSize >= h) ? h-1: y + this.parameters.windowSize;

				area = (bx - ax)*(by - ay);

				a = this.iData[bx + by*w];
				b = this.iData[bx + ay*w];
				c = this.iData[ax + by*w];
				d = this.iData[ax + ay*w];

				sum = a-b-c+d;
				
				this.data[i]=(this.data[i]*area <= sum * this.parameters.threshold)?0:255;
			}
		}
			
	}
}

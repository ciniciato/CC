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
		if (view.state === IMAGE_STATE)
			view.resize();
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


var segment = {
	data: null,
	oData: null,
	neighbors: null,
	DOM: {},
	init: function(){
		this.DOM.min_range = document.getElementById('min_range');
		this.DOM.max_range  = document.getElementById('max_range');
	},
	changeParameters: function(){
		var that = segment;
		that.parameters = {minSize: Number(that.DOM.min_range.value), 
				maxSize: Number(that.DOM.max_range.value)};
		if (view.state === IMAGE_STATE)
			view.resize();
	},
	parameters: {minSize: 10, maxSize: 100},
	resize: function(){
		this.oData = new Int32Array(view.size.width*view.size.height);	
		this.neighbors = new Int32Array(view.size.width*view.size.height);		
	},
	apply: function(){
		var h = view.size.height,
			w = view.size.width,
			len=this.data.length, 
			neighborLen=0,
			currentNeighbor=0,
			neighborInd=0,
			tempInd=0,
			i=0,
			iR=0;
		
		var regions = [], biggestRegion = 0, biggestRegionId=0;
		
		this.oData.fill(255);	
		//blank borders
		for (var y = 0; y < h; y++)
			this.data[y*w] = 255;
			
		for (; i < len; i++)
			if(this.data[i]==0)//maxt
			{
				neighborLen=0;
				this.neighbors[neighborLen++] = i;
				currentNeighbor=0;

				regions.push({points:[i], len: 0, min:i, max:i});
				var region = regions.last();
				
				this.data[i]=255;			

				while(currentNeighbor<=neighborLen)
				{
					neighborInd=this.neighbors[currentNeighbor++];

					tempInd=neighborInd+1;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd-1;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd+w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd-w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd-1-w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd+1-w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd+1+w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
					tempInd=neighborInd-1+w;
					if((this.data[tempInd]==0)){
						this.neighbors[neighborLen++]=tempInd;
						this.data[tempInd]=255;
						region.points.push(tempInd);
						if (tempInd<region.min)region.min=tempInd;
						if (tempInd>region.max)region.max=tempInd;
					}
				}//while
				if (neighborLen>biggestRegion)
				{
					biggestRegion = neighborLen;
					biggestRegionId = regions.length-1;
					
				}
			}//if maxt
			
			//var ctx=canvas.ctx;
			
			//ctx.strokeStyle='red';
			//ctx.lineWidth=2;
			//ctx.beginPath();
			
			for (var r = 0; r<regions.length; r++)
			{		
				region = regions[r];
				len =  regions[r].points.length;
				if (len>this.parameters.minSize && len<this.parameters.maxSize)
					for (var i = 0; i < len; i++)
					{				
						this.oData[region.points[i]]=0;
					}
				/*
				var i = region.points[0];
				var y= Math.floor(i/w), x = i-y*w,
					miny =Math.floor(region.min/w), minx =region.min- miny*w,
					maxy =Math.floor(region.max/w), maxx =region.max- maxy*w,
					rad = Math.abs((maxy-miny)+(maxx-minx))/2;
					ctx.moveTo((minx+maxx)/2, (miny+maxy)/2);
				if (len<100 && len>10)
					ctx.arc((minx+maxx)/2, (miny+maxy)/2, rad, 0, 2 * Math.PI, false);
				*/
				//ctx.moveTo(x,y);
			}
			//ctx.stroke();
			/*
			var region = regions[biggestRegionId];
			for (var i = 0; i < biggestRegion; i++)
			{
				this.oData[region.points[i]] = 0;
			}
			*/			

	
	}
} 

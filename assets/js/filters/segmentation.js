'use strict';

filters.segmentation = {
	regions: null,
	regionsLen: 0,
	labeledData: null,
	resize: function(){
		this.labeledData = new Int16Array(view.size.width*view.size.height);
		this.regions = new Array(1000);
	},	
	getRegions: function(channel){//label regions and feature extraction
		control.counter = 0;

		var h = view.size.height, w = view.size.width, 
			neighborLen = 0, currentNeighbor = 0, neighborInd = 0, tempInd = 0,

			regionIndex=0,

			x=0, y=0, i=0,
			isEdge = false,
			labeledData = this.labeledData,
			
			neighbors = filters.buffData,
			region = null,

			maxX=0, maxY=0, minX=w, minY=h,
			maxXy=0, minXy=0, maxYx=0, minYx=0,
			xn=0, yn=0,
			
			rgbData = filters.imgData;

		//blank borders, prevent out bound search
		var lastrow=w*(h-1);
		for (var x = 0; x < w; x++)
			channel[x] = channel[x+w] = channel[lastrow+x] = channel[lastrow+x-w] = 255;	
		for (var y = 0; y < h; y++)
			channel[y*w] = channel[y*w+1] = channel[y*w+w-1] = channel[y*w+w-2] = 255;
		
		this.regionsLen = 0;

		var DIRS  = ALL_NEIGHBORS;
		
		for (y = 2; y < h-2; y++)
			for(x = 2; x < w-2; x++)
			{
				i = x + y*w;
				if (channel[i]==0 && labeledData[i]==0)
				{					
					neighborLen = 0;
					currentNeighbor = 0;
									
					regionIndex++;
										
					neighbors[neighborLen++] = i;
					labeledData[i] = regionIndex;
					
					region = {
						id: regionIndex,

						polygon: new Array(),

						edges: new Array(),
						perimeter: 0,

						points: new Array(),
						area: 0,

						rgbMean: [0, 0, 0],
						corners: [],
						equivalent_radius: 0,
						circularity: 0,

						bounds: null,
						centroid: [0, 0],

						group: 0
					};

					maxX=0; maxY=0; minX=w; minY=Math.floor(i/w); minYx=i-minY*w;
					
					while(currentNeighbor<neighborLen)
					{											
						neighborInd = neighbors[currentNeighbor++];
						region.points[region.area++] = neighborInd;

						isEdge = false;
											
						for (var iD = 0; iD < DIRS.length; iD++)
						{
							tempInd = neighborInd+DIRS[iD];
							if (channel[tempInd]<120) 
							{
								if (labeledData[tempInd]==0)
								{
									labeledData[tempInd] = regionIndex;	
									neighbors[neighborLen++] = tempInd;
								}
							} 
							else if (iD>3)
								isEdge = true;
						}			

						if (isEdge)
						{
							region.edges[region.perimeter++] = neighborInd;
							//channel[neighborInd]=110;
						}

						yn = Math.floor(neighborInd/w);
						xn = neighborInd - yn*w;

						if (maxX < xn)
						{
							maxX = xn;
							maxXy = yn;
						}
						if (minX > xn)
						{ 
							minX = xn;
							minXy = yn;
						}
						if (maxY < yn)
						{
							maxY = yn;
							maxYx = xn;
						}
					}//while gettingNeighbors

					if (region.area>10)//prevent noise add
					{						
						region.bounds ={
											minX:[minX, minXy],
											maxX:[maxX, maxXy],
											minY:[minYx, minY],
											maxY:[maxYx, maxY]
										};				
						region.centroid = [(minX+maxX)/2, (minY+maxY)/2];
						region.equivalent_radius = Math.sqrt(region.area/Math.PI);
						region.circularity = (region.equivalent_radius/2) / (region.area/region.perimeter);
						
					//	if (Math.abs(region.circularity - 1)>=0 && Math.abs(region.circularity - 1)<=1)//filters
						{
							this.regions[this.regionsLen++] = region;
							var group = control.neuralNet.feedFwd([ region.circularity,
																		region.perimeter,
																		region.area]);
							var group = control.neuralNet.feedFwd([Math.random(),Math.random(),Math.random()]);
							region.group = Math.round(group.data[0]);
							control.counter += region.group;
						}
					}
				
				}//if
			}//for x
	},
	getPolygon: function(channel){
		var h = view.size.height, w = view.size.width, 
			neighborLen = 0, currentNeighbor = 0, neighborInd = 0, tempInd = 0,
			buffLen = 0,
			firstPoint = 0,

			r=0, i=0, y=0, x=0,
			neighbors = filters.buffData,
			buff = filters.buffData.slice(),
			regionIndex=0, region = null,
			labeledData = this.labeledData,
			
			isClosed = false, added = false;
		
		var DIRS  = FOUR_NEIGHBORS;

		function IsEdge(ind, reg){
			return (labeledData[ind-1] == reg ||
					labeledData[ind+1] == reg ||
					labeledData[ind-w] == reg ||
					labeledData[ind+w] == reg ||

					labeledData[ind+1+w] == reg ||
					labeledData[ind-1+w] == reg ||
					labeledData[ind+1-w] == reg ||
					labeledData[ind-1-w] == reg);
		}
		
		for (r=0; r < this.regionsLen; r++){			
			region = this.regions[r];
			regionIndex = region.id;
			firstPoint = region.points[0]-1;
			
			neighborLen = 0;
			currentNeighbor = 0;
			
			buffLen = 0;
			
			neighbors[neighborLen++] = firstPoint;
			labeledData[firstPoint]  = -regionIndex;
						
			isClosed = false;
			
			while(currentNeighbor<neighborLen && !isClosed)
			{					
				added = false;

				neighborInd = neighbors[currentNeighbor++];	

				for (var iD = 0; iD < DIRS.length; iD++)
				{
					tempInd = neighborInd+DIRS[iD];
					
					if (!isClosed && neighborLen>3 && tempInd==firstPoint)
					{
						isClosed=true;
						break;
					}
					if (Math.abs(labeledData[tempInd]) != regionIndex && IsEdge(tempInd, regionIndex)){
						if (!added)
						{
							labeledData[tempInd] = -regionIndex;
							neighbors[neighborLen++] = tempInd;	
							added = true;
						}	
						else if(currentNeighbor>1)
						{									
							buff[buffLen++] = currentNeighbor-1;
							break;
						}
					} 
				}

				if (!added && buffLen>0 && !isClosed)
				{					
					currentNeighbor=buff[buffLen-1]; neighborLen=currentNeighbor+1;
					buffLen--;
				}

			}//while gettingNeighbors		
			
			for (var i = 0; i<neighborLen; i++)
			{
				tempInd = neighbors[i];
				y = Math.floor(tempInd/w);
				x = tempInd - y*w;
				region.polygon[i*2] = x;
				region.polygon[i*2+1] = y;		
			}			
			region.polygon=polygon.simplifyDouglasPeucker(region.polygon, 9);
		}//for regions		
	},//getEdges
	kCurvature: function(interval){
		var polygon = null, 
			theta=0, prior_theta=0, next_theta=0;
		var	
			ctx=view.ctx, 
			i=0, 
			point=0, prior_point=0, next_point=0;
			

		for (i = 0; i < this.regionsLen; i++)
		{
			polygon = this.regions[i].polygon;
			for (var point = 1; point < polygon.length; point++){		
				if (point-interval<0)
					prior_point = polygon.length+(point-interval);
				else
					prior_point = point - interval;
				
				if (point+interval>polygon.length-1)
					next_point = (polygon.length-1)-point+interval;
				else
					next_point = point + interval;
				
				prior_theta = Math.atan2(polygon[point].y -polygon[prior_point].y,
									polygon[prior_point].x -polygon[point].x);

				next_theta = Math.atan2(polygon[point].y -polygon[next_point].y,
									polygon[next_point].x -polygon[point].x);

				var factor = 1;
				prior_theta = Math.round(prior_theta*PI_TO_DEGREE/factor)*factor;
				next_theta  = Math.round(next_theta*PI_TO_DEGREE/factor)*factor;

				if (prior_theta<0) prior_theta += 360;
				if (next_theta<0)  next_theta  += 360;

				if (prior_theta>next_theta)
					theta = (prior_theta - next_theta);
				else
					theta = 360-(next_theta - prior_theta);	
				
				ctx.font="14px Arial";
				ctx.fillStyle='blue';
				if (theta<130)
				{
				ctx.beginPath();
				ctx.arc(polygon[point].x, polygon[point].y, 3, 0, 2 * Math.PI, false);
				ctx.stroke();
				//ctx.fillText(theta,polygon[point].x,polygon[point].y);
				}
			}//for points
		}
	},
	showPolygon: function(color){
		var polygon=null,
			ctx=view.ctx;
			
		ctx.lineWidth = 2.
		for (var i = 0; i < this.regionsLen; i++)
		{
			polygon=this.regions[i].polygon;
			
			if (this.regions[i].group==0)
				ctx.strokeStyle='red';
			else if (this.regions[i].group==1)
				ctx.strokeStyle='green';
			else if (this.regions[i].group==2)
				ctx.strokeStyle='orange';
			else 
				ctx.strokeStyle='blue';

			ctx.beginPath();		
			ctx.moveTo(polygon[0],  polygon[1]);
			for (var p = 2; p < polygon.length; p+=2)
				ctx.lineTo(polygon[p],  polygon[p+1]);
			ctx.closePath();
			ctx.stroke();
		}
	},
	apply: function(channel){
		this.resize();
		this.getRegions(channel);//10-15ms
		this.getPolygon(channel);//10-15ms
		
		
		this.showPolygon();
		//this.kCurvature(1);
	}
}
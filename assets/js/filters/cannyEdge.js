'use strict';
filters.cannyEdge = {
	params: {},
	sobel: function(input, mapMag, mapDir, w,h) {
	    var x=1, y=1,
	    	pRow=0, row=w, nRow=w+w,
	    	difx=0, dify=0;

	    for(; y < h-1; y++, row+=w, pRow+=w, nRow+=w) {
	        for(x = 1; x < w-1; x++) {        	
	            difx = input[row+x-1]  -input[row+x+1];//x
	            dify = input[pRow+x]   -input[nRow+x];//y

	        	mapDir.x[row+x]  += difx;
	        	mapDir.x[pRow+x] += difx+difx;
	        	mapDir.x[nRow+x] = difx;

	        	mapDir.y[row+x]   += dify+dify;
	        	mapDir.y[row+x-1] += dify;        	
	        	mapDir.y[row+x+1] = dify;
				mapMag[pRow+x] = Math.round(Math.sqrt(mapDir.x[pRow+x]*mapDir.x[pRow+x]+mapDir.y[pRow+x]*mapDir.y[pRow+x]));   
	        }
	    }
	    return mapMag;
   	},//sobel
	nomMaxSupression: function(input, mapDir, w,h){
		var y=0, x=0,
			i=0,
			pixa=0, pixb=0, pix=0,
			degree=0,
			len=input.length;
		for (i=0; i < len; i++)
		{
			degree = roundDir(Math.atan2(mapDir.y[i],mapDir.x[i])*PI_TO_DEGREE);
			pix = input[i];
			if (pix>0)
			{
				if (degree==0)
				{
					pixa=input[i-1];
					pixb=input[i+1];
				}
				else if (degree==45)
				{			
					pixa=input[i-1-w];
					pixb=input[i+1+w];		
				}
				else if (degree==90)
				{
					pixa=input[i+w];
					pixb=input[i-w];					
				}
				else if (degree==135)
				{
					pixa=input[i+w-1];
					pixb=input[i-w+1];				
				}
				if (pix<=pixa || pix<pixb)
					input[i] = 0;				
			} 
		}//for i
	},//nomMaxSupression
	hysteresis: function(input, output, w,h, mint,maxt){
		var len=input.length,
			neighbors = new Int32Array(len), 
			neighborLen=0, currentNeighbor=0, neighborInd=0, tempInd=0, i=0;
		for (; i < len; i++)
			if(input[i]>=maxt)//maxt
			{
				neighborLen=0;
				neighbors[neighborLen++] = i;
				currentNeighbor=0;

				input[i]=0;
				output[i]=255;

				while(currentNeighbor<=neighborLen)
				{
					neighborInd=neighbors[currentNeighbor++];

					tempInd=neighborInd+1;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd-1;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd+w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd-w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd-1-w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd+1-w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd+1+w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
					tempInd=neighborInd-1+w;
					if((input[tempInd]>=mint)){
						neighbors[neighborLen++]=tempInd;
						input[tempInd]=0;
						output[tempInd]=255;
					}
				}//while
			}//if maxt
	},//hysteresis
	apply: function(channel){
		var h = view.size.height, w = view.size.width, len = channel.length,
			mapMag = new Float32Array(len), 
			mapDir = {x:new Float32Array(len), y:new Float32Array(len)};
		this.sobel(channel, mapMag, mapDir, w, h);//input, mapMag, mapDir, w,h
		this.nomMaxSupression(mapMag, mapDir, w, h);//input, mapDir, w,h
		channel.fill(0);
		this.hysteresis(mapMag, channel, w, h, 30, 60);//input, output, w,h, mint,maxt
		return channel;
	}
}
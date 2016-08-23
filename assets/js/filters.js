'use strict';

var filters = {
}

var fastSobel = function(input, mapMag, mapDir, w,h) {
    var x=1,
        y=1,
    	pRow=0,
    	row=w,
    	nRow=w+w,
    	difx=0,
        dify=0;

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
        	var p = Math.round(Math.sqrt(mapDir.x[pRow+x]*mapDir.x[pRow+x]+mapDir.y[pRow+x]*mapDir.y[pRow+x]));
			mapMag[pRow+x] = (p>20) ? 255 : 0;   
        }
    }
}
//'use strict';
var integralize = function(input, output, w,h){
	var i = 0, 
		len = input.length, 
		a=b=c=0,
		x=y=0;

	for(; y<h ; y++)
	{
		for(x=0; x<w; x++, i++)
		{
			a=(x==0 || y==0)?0:output[i-1-w];
			b=(y==0)?0:output[i-w];
			c=(x==0)?0:output[i-1];
			output[i] = c - a + b + input[i];
		}
	}
	return output;
}
var adaptiveThreshold = function(input, iInput, output, w,h, windowSizex,windowSizey, threshold, transparent){
	var i=a=b=c=d=0, 
		len = input.length, 
		count=sum=0, 
		y=x=0,
		ax=ay=bx=by=0;
	if (transparent)
		for(y=0; y<h ; y++)
		{
			for(x=0; x<w; x++, i++)
			{
				ax = (x - windowSizex < 0) ? 0 : x - windowSizex;
				ay = (y - windowSizey < 0) ? 0 : y - windowSizey;
				bx = (x + windowSizex >= w) ? w-1: x + windowSizex;
				by = (y + windowSizey >= h) ? h-1: y + windowSizey;

				area = (bx - ax)*(by - ay);

				a = iInput[bx + by*w];
				b = iInput[bx + ay*w];
				c = iInput[ax + by*w];
				d = iInput[ax + ay*w];

				sum = a-b-c+d;

				if (input[i]*area <= sum * threshold)
					output[i]=255;
			}
		}
	else
		for(y=0; y<h ; y++)
		{
			for(x=0; x<w; x++, i++)
			{
				ax = (x - windowSizex < 0) ? 0 : x - windowSizex;
				ay = (y - windowSizey < 0) ? 0 : y - windowSizey;
				bx = (x + windowSizex >= w) ? w-1: x + windowSizex;
				by = (y + windowSizey >= h) ? h-1: y + windowSizey;

				area = (bx - ax)*(by - ay);

				a = iInput[bx + by*w];
				b = iInput[bx + ay*w];
				c = iInput[ax + by*w];
				d = iInput[ax + ay*w];

				sum = a-b-c+d;
				
				output[i]=(input[i]*area <= sum * threshold)?0:255;
			}
		}
	return output;
}
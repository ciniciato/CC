var colors = {
};

colors.RGBtoYCC = function (_rgb, _normalize){
	var normalize = (_normalize !== undefined) ? _normalize : false;
	var r = _rgb[0]/255, g = _rgb[1]/255, b = _rgb[2]/255;
	var Y  = Math.round(r*65.481+g*128.553+b*24.966),
		Cb = Math.round(r*(-39.797)+g*(-70.203)+b*112),
		Cr = Math.round(r*112+g*(-93.786)+b*(-18.214));
	if (normalize)
		return [100*Y/219, 100*(Cb+112)/224, 100*(Cr+112)/224];
	else
		return [Y+16, Cb+128, Cr+128];
}

colors.RGBtoHSV = function(_rgb, _normalize){//Travis method
	var normalize = (_normalize === undefined) ? false : _normalize;
	_rgb = [_rgb[0]/255, _rgb[1]/255, _rgb[2]/255];//normalize
	var min = 255, max = 0, delta;
	var HSV = [0, 0, 0];

	for (var i = 0; i < _rgb.length; i++){
		max = (max < _rgb[i]) ? _rgb[i] : max;
		min = (min > _rgb[i]) ? _rgb[i] : min;
	}

	HSV[2] = max;
	delta = max - min;
	if (delta != 0){
		HSV[1] = delta / max;
		if (_rgb[0] == max)
			HSV[0] = (_rgb[1] - _rgb[2]) / delta
		else if (_rgb[1] == max)
			HSV[0] = 2 + (_rgb[2] - _rgb[0]) / delta
		else
			HSV[0] = 4 + (_rgb[0] - _rgb[1]) / delta;
		HSV[0] *= 60;
		if( HSV[0] < 0 )
			HSV[0] += 360;
	}else{
		HSV[1] = 0;
		HSV[0] = 361;	
	} 
	if (normalize)
		HSV = [Math.round(HSV[0])/360, Math.round(HSV[1]*100), Math.round(HSV[2]*100)]
	else
		HSV = [Math.round(HSV[0]), Math.round(HSV[1]*100), Math.round(HSV[2]*100)];
	return HSV;
}
//CONVERT HSV(Hue, Saturation, Value) COLOR TO RGB(Red, Green, Blue)
colors.HSVtoRGB = function(_hsv){//Travis method
	var hex = _hsv[0]/60,
		S   = _hsv[1] / 100; 
	 	V   = _hsv[2] / 100; 
	var primaryColor   = Math.floor(hex),
		secondaryColor = hex - primaryColor,
		a = (1 - S)*V,
		b = (1 - (S * secondaryColor) )*V,
		c = (1 - (S * (1 - secondaryColor) ) )*V;


	var RGB = [];
	if (primaryColor == 0){
		RGB[0] = V;
		RGB[1] = c;
		RGB[2] = a;
	}else if (primaryColor == 1){
		RGB[0] = b;
		RGB[1] = V;
		RGB[2] = a;
	}else if (primaryColor == 2){
		RGB[0] = a;
		RGB[1] = V;
		RGB[2] = c;
	}else if (primaryColor == 3){
		RGB[0] = a;
		RGB[1] = b;
		RGB[2] = V;
	}else if (primaryColor == 4){
		RGB[0] = c;
		RGB[1] = a;
		RGB[2] = V;
	}else{
		RGB[0] = V;
		RGB[1] = a;
		RGB[2] = b;
	}

	return [Math.round(RGB[0]*255), Math.round(RGB[1]*255), Math.round(RGB[2]*255)];
}
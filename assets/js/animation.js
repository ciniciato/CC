var animation = {
	busy: false
}

animation.slide = function(fadeOut, fadeIn, direction, time){//0 = left, 1 = right
	if (!animation.busy)
	{	
		animation.busy = true;
		var fadeOut = document.getElementById(fadeOut),
			fadeIn = document.getElementById(fadeIn),
			direction = direction,
			time = time || 1;		
		
		var screenSize = document.body.clientWidth;
		
		fadeIn.style.transition = fadeOut.style.transition = 'left '+time+'s';
		fadeOut.style.left = 0;
		fadeIn.style.display = 'block';	
		fadeIn.style.left = (direction ==  0) ? screenSize+'px' : '-'+screenSize+'px';
			
		setTimeout(
			function(){
				fadeOut.style.left = (direction ==  0) ? '-'+screenSize+'px' : screenSize+'px';
				fadeIn.style.left = (direction ==  0) ? '0px' : '0px';				
				setTimeout(
					function(){
						fadeOut.style.display = 'none';
						animation.busy = false;
					}
				, time*1000);
			}	
		, 100);
	}
}

animation.fade = function(fadeOut, fadeIn, time){
	if (!animation.busy)
	{	
		animation.busy = true;
		var fadeOut = document.getElementById(fadeOut),
			fadeIn = document.getElementById(fadeIn),
			time = time || 1;
		fadeIn.style.transition = fadeOut.style.transition = 'opacity '+time+'s';
		
		fadeOut.style.zindex=2;
		fadeOut.style.opacity = 1;
		
		fadeIn.style.zindex=1;
		fadeIn.style.display = 'block';	
		fadeIn.style.opacity = 0;
			
		setTimeout(
			function(){
				fadeOut.style.opacity = 0;
				fadeIn.style.opacity = 1;				
				setTimeout(
					function(){
						fadeOut.style.display = 'none';
						animation.busy = false;
					}
				, time*1000);
			}	
		, 100);	
	}
} 

animation.initial_screen = function(){
	console.log('Animation initial screen.');
	var elem = document.getElementById('initial_screen');
	elem.style.opacity = '0';
	elem.style.display = 'block';
	
	setTimeout(
		function(){
			elem.style.opacity = '1';
			setTimeout(
				function(){
					control.changeScreen('main_screen');
				}
			, 1500);
		}	
	, 100);
	
}
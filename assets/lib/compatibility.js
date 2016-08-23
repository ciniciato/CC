var compatibility = (function() {
        var lastTime = 0,

        URL = window.URL || window.webkitURL,

        requestAnimationFrame = function(callback, element) {
            var requestAnimationFrame =
                window.requestAnimationFrame        || 
                window.webkitRequestAnimationFrame  || 
                window.mozRequestAnimationFrame     || 
                window.oRequestAnimationFrame       ||
                window.msRequestAnimationFrame      ||
                function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            return requestAnimationFrame.call(window, callback, element);
        },

        cancelAnimationFrame = function(id) {
            var cancelAnimationFrame = window.cancelAnimationFrame ||
                                        function(id) {
                                            clearTimeout(id);
                                        };
            return cancelAnimationFrame.call(window, id);
        },

        requestFullScreen = function(){            
            if(document.body.requestFullscreen) {
                document.body.requestFullscreen();
            } else if(document.body.mozRequestFullScreen) {
                document.body.mozRequestFullScreen();
            } else if(document.body.webkitRequestFullscreen) {
                document.body.webkitRequestFullscreen();
            } else if(document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            }
        }

        exitFullscreen = function(){
            if (document.exitFullscreen)
                document.exitFullscreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
            else if (document.msExitFullscreen)
                document.msExitFullscreen();
            else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
        }

        fullscreenEnabled = function(){
            if (document.fullscreenEnabled)
                return document.fullscreenEnabled;
            else if (document.webkitFullscreenEnabled)
                return document.webkitFullscreenEnabled;
            else if (document.mozFullScreenEnabled)
                return document.mozFullScreenEnabled;
            else if (document.msFullscreenEnabled)
                return document.msFullscreenEnabled;
            else
                return false;
        }

        onfullscreenchange = function(callback){
            if (document.onfullscreenchange !== undefined)
                document.fullscreenEnabled = callback;
            else if (document.onwebkitfullscreenchange !== undefined)
                document.onwebkitfullscreenchange = callback;
            else if (document.onmozfullscreenchange !== undefined)
                document.onmozfullscreenchange = callback;
            else if (document.MSFullscreenChange !== undefined)
                document.MSFullscreenChange = callback;
        }

    return {
        URL: URL,
        requestAnimationFrame: requestAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,

        requestFullScreen: requestFullScreen,
        exitFullscreen: exitFullscreen,
        fullscreenEnabled: fullscreenEnabled,
        onfullscreenchange: onfullscreenchange 
    };
})();
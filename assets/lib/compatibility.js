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


    return {
        URL: URL,
        requestAnimationFrame: requestAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        requestFullScreen: requestFullScreen
    };
})();
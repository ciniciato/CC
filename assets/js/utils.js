var message = {
	el: document.getElementById('hint'),
	show: function(txt){
		this.el.innerHTML = txt;
	},
	confirm: {
		el: document.getElementById('acceptmsg'),
		doAfter: function(){},
		show: function(callback){
			this.el.style.display = 'block';
			this.doAfter = callback;
		},				
		callback: function(value){
			this.doAfter(value);
			this.hide();
		},
		hide: function(callback){
			this.el.style.display = 'none';
		}
	}
}
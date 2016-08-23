'use strict';

var List = function(){
	this.current = null;
	this.currentID = null;
	this.id      = 0;
	this.size    = 0;
	this.items   = new Array();	
}


List.prototype.getCurrent = function(){
	var item = this.items.find(o => o.id === this.currentID);
	if (item === undefined) item = this.items[0];
	return item.val;		
}

List.prototype.get = function(id){
	return this.items.find(o => o.id === id);	
}

List.prototype.add = function(value, id){
	if (id !== undefined)
	{
		this.items[this.size++] = {id: id, val: value};
		if (this.current == null)
		{		
			this.currentID = id;
			this.current   = value;
		}
	}
	else
	{
		this.items[this.size++] = {id: this.id++, val: value};
		if (this.current == null)
		{		
			this.currentID = this.id-1;
			this.current   = value;
		}
	}
}

List.prototype.next = function(){
	if (this.size > 0)
	{
		var id = (this.currentID==null) ? 0 : this.currentID,
			ind = this.items.findIndex(o => o.id == this.currentID);
		if (ind+1 == this.size)
		{
			this.current   = this.items[0].val;
			this.currentID = this.items[0].id;
		}
		else
		{
			this.current   = this.items[ind+1].val;
			this.currentID = this.items[ind+1].id;
		}
	}
}

List.prototype.clear = function(){
	this.items = new Array();
	this.size = 0;
	this.id   = 0;
}
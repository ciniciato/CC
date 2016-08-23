'use strict';

var List = function(){
	this.current = null;
	this.numID   = 0;
	this.id      = '';
	this.size    = 0;
	this.items   = new Array();	
}

List.prototype.getCurrent = function(){
	var item = this.items.find(o => o.id === this.current);
	if (item === undefined) item = this.items[0];
	return (this.size == 0) ? false : item.val;		
}

List.prototype.get = function(id){
	return this.items.find(o => o.id === id);	
}

List.prototype.add = function(value, id){
	if (id !== undefined && id != '')
		this.items[this.size++] = {id: id, val: value};
	else
		this.items[this.size++] = {id: this.numID++, val: value};
}

List.prototype.next = function(){
	if (this.size > 0)
	{
		var id = (this.current==null) ? 0 : this.current,
			ind = this.items.findIndex(o => o.id == this.current);
		if (ind+1 == this.size)
			this.current = this.items[0].id;
		else
			this.current = this.items[ind+1].id;
	}
}

List.prototype.empty = function(){
	this.items = new Array();
	this.size = 0;
	this.id   = 0;
}
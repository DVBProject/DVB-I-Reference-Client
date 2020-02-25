
/********* Program ***********/
function Program(programdata, element_id, channelObject){
	this.element_id = element_id;
	this.init(programdata);
	this.visible = false;
	this.scrollStartTimeout = null;
	this.timeouts = [];
	
	this.getChannel = function(){
		return channelObject;
	}
}

Program.prototype.init = function(programdata){
	for(var field in programdata){
		this[field] = programdata[field];
	}
	if(this.start && this.end){
		this.start_date_obj = this.start;
		this.end_date_obj = this.end;
	}
}




function Program(programdata){
	this.init(programdata);	
}

Program.prototype.init = function(programdata){
	for(var field in programdata){
		this[field] = programdata[field];
	}
}

Program.prototype.populate = function(){
	var self = this;

	if(self.element == null){
		var element = document.createElement("a");
		element.addClass("list-group-item ist-group-item-action row d-flex px-0");
		element.setAttribute("href", "#");

		var startTime = document.createElement("div");
        startTime.addClass("col-2");
        startTime.innerHTML = self.start.create24HourTimeString();
        element.appendChild(startTime);
        var title = document.createElement("div");
        title.addClass("col-10 text-truncate");
        title.innerHTML = self.title;
        element.appendChild(title);
		self.element = element;
	}
    return self.element;
}

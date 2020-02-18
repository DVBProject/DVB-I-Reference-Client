
function Program(programdata,channel){
	this.init(programdata,channel);	
}

Program.prototype.init = function(programdata,channel){
	for(var field in programdata){
		this[field] = programdata[field];
	}
    this.channel = channel;
}

Program.prototype.populate = function(){
	var self = this;

	if(self.element == null){
		var element = document.createElement("a");
		element.addClass("list-group-item ist-group-item-action row d-flex px-0 py-1");
		element.setAttribute("href", "#");
        element.addEventListener("click", function () { openProgramInfo(self); }, false);

		var startTime = document.createElement("div");
        startTime.addClass("col-2 pl-0");
        startTime.innerHTML = self.start.create24HourTimeString();
        element.appendChild(startTime);
        var title = document.createElement("div");
        title.addClass("col-10 pl-0 text-truncate");
        title.innerHTML = self.title;
        element.appendChild(title);
		self.element = element;
	}
    return self.element;
}

Program.prototype.populateProgramInfo = function(){
    $("#info_chicon").attr('src',this.channel.image);
    $("#info_chnumber").text(this.channel.lcn);
    $("#info_chname").text(this.channel.name);
    $(".title").text(this.title);
    $(".description").text(this.desc);
    $(".img").attr('src',this.mediaimage);
    $(".date").text(this.start.getDate()+"."+(this.start.getMonth()+1)+".");
    $(".starttime").text(this.start.create24HourTimeString());
    $(".endtime").text(this.end.create24HourTimeString());
    $(".duration").text(this.prglen+" mins");
    
}

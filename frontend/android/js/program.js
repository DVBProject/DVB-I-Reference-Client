
function Program(programdata,element_id,channel){
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
		element.addClass("list-group-item list-group-item-action row d-flex px-2 py-1");
		element.setAttribute("href", "#");
        element.addEventListener("click", function () { openProgramInfo(self); }, false);
        var now = new Date();
        if(self.start < now) {
            if(self.end < now) {
                element.addClass("past");
            }
            else {
                element.addClass("current");
            }
        }
		var startTime = document.createElement("div");
        startTime.addClass("col-4 col-md-2 col-xl-1 pl-0");
        startTime.innerHTML = self.start.create24HourTimeString();
        element.appendChild(startTime);
        var title = document.createElement("div");
        title.addClass("col-8 col-md-10 col-xl-11 pl-0 text-truncate");
        title.innerHTML = self.title;
        element.appendChild(title);
		self.element = element;
	}
    return self.element;
}

Program.prototype.populateProgramInfo = function(){
    $("#info_chicon").attr('src',this.channel.image || "./images/empty.png");
    $("#info_chnumber").text(this.channel.lcn);
    $("#info_chname").text(this.channel.name);
    $(".title").text(this.title);
    $(".description").text(this.desc);
    $(".img").attr('src',this.mediaimage);
    $(".date").text(this.start.getDate()+"."+(this.start.getMonth()+1)+".");
    $(".starttime").text(this.start.create24HourTimeString());
    $(".endtime").text(this.end.create24HourTimeString());
    $(".duration").text(this.prglen+" mins");
    $("#select_service_button").attr("href","javascript:channelSelected('"+this.channel.id+"')");
    
}

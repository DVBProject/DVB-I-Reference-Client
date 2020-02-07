var MINUTE_WIDTH = 6;
var PROGRAM_MARGIN_WIDTH = 1;
var PROGRAM_BORDER_THICKNESS = 1;

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

Program.prototype.getTitle = function(){
	var title =  this.title;
	if(!title && this.texts){
		for(var i = 0; i < this.texts.length; i++){
			if(this.texts[i].lang == _epg_.lang){
				title = this.texts[i].serietitle || this.texts[i].title;
				break;
			}
		}
	}
	return title;
}

Program.prototype.getAltTitle = function(){
	var title =  this.title;
	if(!title && this.texts){
		for(var i = 0; i < this.texts.length; i++){
			if(this.texts[i].lang == "alt"){
				title = this.texts[i].serietitle || this.texts[i].title;
				break;
			}
		}
	}
	return title;
}

Program.prototype.getDescription = function(lang){
	var desc = this.desc || "";
	if(!desc && this.texts){
		for(var i = 0; i < this.texts.length; i++){
			if(this.texts[i].lang == lang){
				desc = this.texts[i].desc;
				break;
			}
		}
	}
	return desc;
}

Program.prototype.getSynopsisText = function(){
	var text = "";
	var defLangDesc = this.getDescription("def");
	var altLangDesc = this.getDescription("alt");
	if(defLangDesc.length >= 5) {
	// if(defLangDesc.length >= 5 && altLangDesc.length < 5){
		text = defLangDesc;
	// }
	// else if(altLangDesc.length >= 5 && defLangDesc.length < 5){
		// text = altLangDesc;
	// }
	// else if(defLangDesc != altLangDesc && defLangDesc.length >= 5 && altLangDesc.length >= 5){
		// text = defLangDesc + "<br>" + altLangDesc;
	}
	else{
		text = "No Synopsis Available";
	}
	return text;
}



Program.prototype.populate = function(){
	var self = this;

	self.element = document.getElementById(self.element_id);

	// The program does not have an element -> Create it
	if(self.element == null){
		var element = document.createElement("div");
		element.addClass("program");
		element.setAttribute("id", self.element_id);
		var title = (self.bilingual) ? self.getTitle() + ((!self.noprogram) ? " " + self.getAltTitle() : "") : self.getTitle();
		element.innerHTML = "<div class=\"programTextContainer horizontalAutoscroll\"><span>" + htmlDecode(title) + "</span></div>";
		
		if((self.mediaurl != null && self.mediaurl.length > 0)
		&& (self.start_date_obj != null && self.start_date_obj <= curTime)){
			var blue_catchup = document.createElement("div");
			blue_catchup.addClass("blue_catchup");
			element.appendChild(blue_catchup);
			element.addClass("hasVideo");
		}

		if(self.noprogram){
			element.addClass("noprogram");
		}

		self.element = element;
	}

    // Don't remove. This might be needed later.
	//self.handleStarOver(self.startOver);
	self.setTimeClass();

	var programwidth = Math.max(0, (Number(self.prglen) * MINUTE_WIDTH) - (PROGRAM_MARGIN_WIDTH) - (PROGRAM_BORDER_THICKNESS));
	self.element.style.width = programwidth + "px";
}

Program.prototype.handleStarOver = function(restartOK){
	var self = this;
	if(restartOK){
		var green = document.createElement("div");
		green.addClass("green_restart");
		self.element.appendChild(green);
		self.element.addClass("startOver");
		//document.getElementById("greenb").removeClass("hide");
		buttonbar.show(VK_GREEN);
	}
	else{
		//document.getElementById("greenb").addClass("hide");
		buttonbar.hide(VK_GREEN);
		self.element.removeClass("startOver");
		var green_restart = self.element.childNodes.getByClass("green_restart");
		while( green_restart.length > 0){
			self.element.removeChild(green_restart.pop());
		}
	}
}

Program.prototype.setFocus = function(){
	try{
		var self = this;

		if(focusElement(self.element)){
			clearInterval(self.scrollIntervalID);
			_epg_.populateProgramDetail(self);
			var programTextContainer = self.element.firstChild;
			var scrollDist = programTextContainer.scrollWidth - programTextContainer.offsetWidth;
			if(scrollDist > 0){
                self.fadeOutScroll();
            }

			return true;
		}
		return false;

	}
	catch(e){
		console.log(e);
		return false;
	}
}

Program.prototype.fadeOutScroll = function(){
	var self = this;
   
	if(_epg_.activeItem != null && self == _epg_.activeItem){
		var programTextContainer = self.element.firstChild;
		var scrollDist = programTextContainer.scrollWidth - programTextContainer.offsetWidth;		  
	}
	else{
		console.log("fadeOutScroll: this is an INACTIVE program");
	}
}

Program.prototype.unFocus = function(){
	var self = this;  
}

Program.prototype.now = function(){
	return this.start_date_obj <= curTime && curTime <= this.end_date_obj;
}

Program.prototype.setTimeClass = function(){
	this.element.removeClass("passed");
	this.element.removeClass("now");
	this.element.removeClass("upcoming");
	if(this.end_date_obj < curTime){
		this.element.addClass("passed");
	}
	else if(this.start_date_obj > curTime){
		this.element.addClass("upcoming");
	}
	else{
		this.element.addClass("now");
	}
}

Program.prototype.overlaps = function(otherProgram){
	if(otherProgram instanceof Program){
		return (this.start_date_obj >= otherProgram.start_date_obj && this.end_date_obj <= otherProgram.end_date_obj);
	}
	return false;
}


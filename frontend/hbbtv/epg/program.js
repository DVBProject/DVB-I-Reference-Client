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
	};
}

Program.prototype.init = function(programdata){
	for(var field in programdata){
		this[field] = programdata[field];
	}
	if(this.start && this.end){
		this.start_date_obj = this.start;
		this.end_date_obj = this.end;
	}
};

Program.prototype.getTitle = function(){
	 if(this.titles.length == 1) {
    return this.titles[0].text;
  }
  else if(this.titles.length > 1){
    var defaultTitle = null;
    for(var i = 0;i < this.titles.length;i++) {
      if(this.titles[i].type == "main" && this.titles[i].lang == languages.ui_language) {
        return this.titles[i].text;
      }
      else if(this.titles[i].type == "main" && this.titles[i].lang == "default") {
        defaultTitle = this.titles[i].text;
      }
    }
    if(defaultTitle != null) {
      return defaultTitle;
    }
    else {
      return this.titles[0].text
    }
  }
  return "";
};

Program.prototype.getAltTitle = function(){
 if(this.titles.length == 1) {
    return this.titles[0].text;
  }
  else if(this.titles.length > 1){
    var defaultTitle = null;
    for(var i = 0;i < this.titles.length;i++) {
      if(this.titles[i].type == "secondary" && this.titles[i].lang == languages.ui_language) {
        return this.titles[i].text;
      }
      else if(this.titles[i].type == "secondary" && this.titles[i].lang == "default") {
        defaultTitle = this.titles[i].text;
      }
    }
    if(defaultTitle != null) {
      return defaultTitle;
    }
    else {
      return this.titles[0].text
    }
  }
  return "";
};


Program.prototype.getSynopsisText = function(){
  if(this.descriptions.length == 1) {
    return this.descriptions[0].text;
  }
  else if(this.descriptions.length > 1){
    var defaultDesc = null;
    for(var i = 0;i < this.descriptions.length;i++) {
      if(this.descriptions[i].lang == languages.ui_language) {
        return this.descriptions[i].text;
      }
      else if(this.descriptions[i].lang == "default") {
        defaultDesc = this.descriptions[i].text;
      }
    }
    if(defaultDesc != null) {
      return defaultDesc;
    }
    else {
      return this.descriptions[0].text
    }
  }
  return "No description";
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
        if(self.parentalRating && self.parentalRating.length > 0) {
            for(var i = 0;i < self.parentalRating.length;i++) {
                if(self.parentalRating[i].minimumage) {
                     title += "("+self.parentalRating[i].minimumage+")";
                    break;
                }
            }
        }
		element.innerHTML = "<div class=\"programTextContainer horizontalAutoscroll\"><span>" + title.replace(/&/g,"&amp;") + "</span></div>";
		
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
};

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
};

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
};

Program.prototype.fadeOutScroll = function(){
	var self = this;
   
	if(_epg_.activeItem != null && self == _epg_.activeItem){
		var programTextContainer = self.element.firstChild;
		var scrollDist = programTextContainer.scrollWidth - programTextContainer.offsetWidth;		  
	}
	else{
		console.log("fadeOutScroll: this is an INACTIVE program");
	}
};

Program.prototype.unFocus = function(){
	var self = this;  
};

Program.prototype.now = function(){
	return this.start_date_obj <= curTime && curTime <= this.end_date_obj;
};

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
};

Program.prototype.overlaps = function(otherProgram){
	if(otherProgram instanceof Program){
		return (this.start_date_obj >= otherProgram.start_date_obj && this.end_date_obj <= otherProgram.end_date_obj);
	}
	return false;
};

Program.prototype.getLongDescription = function() {
  var defaultDesc = null;
  for(var i = 0;i < this.descriptions.length;i++) {
    if(this.descriptions[i].lang == languages.ui_language &&  this.descriptions[i].textLength == "long") {
      return this.descriptions[i].text;
    }
    else if(this.descriptions[i].lang == "default" && this.descriptions[i].textLength == "long") {
      defaultDesc = this.descriptions[i].text;
    }
  }
  if(defaultDesc != null) {
    return defaultDesc;
  }
  return null;
}



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


Program.prototype.getTitle = function() {
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
}

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

Program.prototype.getDescription = function(){
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

/********* MENU ***********/
function Menu( element_id ){
	this.init(element_id);
}

Menu.prototype.init = function(element_id){
	this.items = [];
	this.element = document.getElementById(element_id);
	if(this.element == null){
		var element = document.createElement("div");
		element.id = element_id;
		this.element = element;
	}
}

Menu.prototype.populate = function(){
	_menu_.element.innerHTML = "";
	_menu_.element.setAttribute("style", "");
	for(var i = 0; i < this.items.length; i++){
		var pb_frame = document.createElement("span");
		pb_frame.addClass("progress_bar_frame");
		
		var progress_bar = document.createElement("span");
		progress_bar.addClass("progress_bar");
		
		var status_wrapper = document.createElement("span");
		status_wrapper.addClass("status_wrapper");
		
		var item = this.items[i];
		var now = item.boxes[0];
		var defLang_title = now.getTitle("def");
		var altLang_title = now.getTitle("alt");
		
		var program_title = document.createElement("span");
		program_title.addClass("program_title");
		program_title.innerHTML = defLang_title ? XMLEscape(defLang_title) : XMLEscape(altLang_title);
		var pb_width = 0;
		if(item.boxes[0].start && item.boxes[0].end){
			var start = item.boxes[0].start;
			var end = item.boxes[0].end;
			pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60)) * progressWidth);
		}
		
        progress_bar.style.width = pb_width + "px";
		
		pb_frame.appendChild(progress_bar);
		
		status_wrapper.appendChild(pb_frame);
		status_wrapper.appendChild(program_title);
        if(start) {
		    var start_str = start.create24HourTimeString() + " ";
		    var start_time = document.createElement("span");
		    start_time.addClass("start_time");
		    start_time.innerHTML = XMLEscape(start_str) || "";
            status_wrapper.appendChild(start_time);
		}		
		
		var menuitem = this.items[i].element;
		menuitem.appendChild(status_wrapper);
		
		this.element.appendChild(menuitem);
		
		this.items[i].element.childNodes.getByClass("items")[0].style.left = 0 + "px";
		if(i == this.center){
			this.items[i].setOpen(true);
			this.items[i].element.childNodes.getByClass("items")[0].addClass("visible");

            var newTop = (menuOffset  - (i * (ROW_HEIGHT - ROW_VERTICAL_MARGIN)));
            menuOffset = newTop;
            $("#menu_0").css("top", menuOffset);

            if(activeBox){
				activeBox.autoScrollChildren();
			}
		}
	}
}

Menu.prototype.getOpenChannel = function(){
	for(var i = 0; i < this.items.length; i++){
		if(this.items[i].open){
			return this.items[i];
		}
	}
	return null;
}


Menu.prototype.getOpenChannelIndex = function(){
	for(var i = 0; i < this.items.length; i++){
		if(this.items[i].open){
			return i;
		}
	}
	return 0;
}

Menu.prototype.getChannelIndex = function(channel){
	for(var i = 0; i < this.items.length; i++){
		if(this.items[i] == channel){
			return i;
		}
	}
	return 0;
}

Menu.prototype.getPreviousChannel = function(){
	for(var i = 1; i < this.items.length; i++){
		if(this.items[i].open){
			return this.items[i-1];
		}
	}
    if(this.items[0].open) {
        return this.items[this.items.length -1];
    }
	return null;
}

Menu.prototype.getPreviousChannelIndex = function(){
	for(var i = 1; i < this.items.length; i++){
		if(this.items[i].open){
			return i-1;
		}
	}
    if(this.items[0].open) {
        return this.items.length -1;
    }
	return 0;
}

Menu.prototype.getNextChannel = function(){
	for(var i = 0; i < this.items.length-1; i++){
		if(this.items[i].open){
			return this.items[i+1];
		}
	}
    if(this.items[this.items.length -1].open) {
        return this.items[0];
    }
	return null;
}

Menu.prototype.getNextChannelIndex = function(){
	for(var i = 0; i < this.items.length-1; i++){
		if(this.items[i].open){
			return i+1;
		}
	}
    if(this.items[this.items.length -1].open) {
        return 0;
    }
	return 0;
}

Menu.prototype.getChannelAtIndex = function(index){	
		var value = null;
		for(var i = 0; i < this.items.length; i++){
			if(this.items[i].lcn == index) {
				value = this.items[i];
				break;
			}
		}
		return value;
}


Menu.prototype.get5minusChannel = function(){
	for(var i = 5; i < this.items.length; i++){
		if(this.items[i].open){
			if(this.items[i-5]){
				return this.items[i-5];
			}
		}
	}
	return null;
}

Menu.prototype.get5plusChannel = function(){
	for(var i = 0; i < this.items.length-5; i++){
		if(this.items[i].open){
			if(this.items[i+5]){
				return this.items[i+5];
			}
		}
	}
	return null;
}

function compareLCN(a, b) {
  if (a.lcn > b.lcn) return 1;
  if (b.lcn > a.lcn) return -1;

  return 0;
}

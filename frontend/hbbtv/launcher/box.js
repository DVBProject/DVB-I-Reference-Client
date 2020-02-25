/**************** BOX ***************/
function Box( init_obj, element_id ){
	var self = this;
	self.element = document.getElementById(element_id);
	self.element_id = element_id;
	if(self.element == null){
		var element = document.createElement("div");
		element.setAttribute("id", element_id);
		element.className = "boxitem";
		self.info = "";
		self.element = element;
	}
	self.element.innerHTML = "";
	self.timeouts = [];
	self.scrolling = false;
	self.scrollTimeout = null;
	self.init( init_obj, element_id );
}

Box.prototype.init = function( init_obj, element_id ){
	var self = this;
	self.timeouts = [];
	$.each(init_obj, function(f, field){
		self[f] = field;
	});
	//self.populate();
}

Box.prototype.getTitle = function(lang){
	var self = this;
	if(self.texts){
		for(var i = 0; i < self.texts.length; i++){
			if(self.texts[i].lang == lang){
				if(self.texts[i].serietitle){
					return self.texts[i].serietitle;
				}
				else if(self.texts[i].title){
					return self.texts[i].title;
				}
			}
		}
	}
	else{
		return self.title || "";
	}
	return "";
}

Box.prototype.populate = function(callback){
	var self = this;
    
	var boxitem_description = document.createElement("div");
	boxitem_description.addClass("boxitem_description");
	if(self.catchup || self.related_video){
		boxitem_description.addClass("hide");
	}
	boxitem_description.innerHTML = (self.description != null) ? XMLEscape(self.description) : "";
    
    
	var boxitem_image = document.createElement("div");
	boxitem_image.addClass("boxitem_image");
    
	var img_url = self["mediaimage"] || self["parentimage"];
	
    if(img_url != null && img_url.length > 0){
		var image = new Image();
		var imgElem = document.createElement("img");
		image.onload = function(imgtag, box, url){
			imgtag.setAttribute("src", url);
            imgtag.setAttribute("alt", "Image not found");
			box.appendChild(imgElem);
		}(imgElem, boxitem_image, img_url);
		image.src = img_url;
	}
    
	// Boxitem info
    
	var boxitem_info = document.createElement("div");
	boxitem_info.addClass("boxitem_info");
	if(self.info){
		boxitem_info.innerHTML = self.info;
		boxitem_info.removeClass("hide");
	}
	else{
		boxitem_info.addClass("hide");
	}
    
	var boxitem = document.createElement("div");
	boxitem.addClass("boxitem");
	boxitem.setAttribute("id", self.element_id);
	if(self.url){
		boxitem.setAttribute("data-url", self.url);
	}
	if(self.name != null && self.name.length > 0){
		boxitem.addClass(self.name);
	}

	boxitem.appendChild(boxitem_description);
	boxitem.appendChild(boxitem_image);
	boxitem.appendChild(boxitem_info);

	self.element = boxitem;
    
	if(typeof(callback) == "function"){
		callback.call();
	}
}

Box.prototype.autoScrollChildren = function(){
	var self = this;
	var horizontalAutoscrollElems = self.element.getSuccessorsByClass("horizontalAutoscroll");
	for(var i = 0; i < horizontalAutoscrollElems.length; i++){
		(function (idx, arr){
			horizontalFadeAutoScroll(arr[idx], 2000, self.timeouts);
		})(i, horizontalAutoscrollElems);
	}
	if(self.scrollTimeout != null) {
		clearTimeout(self.scrollTimeout);
		self.scrollTimeout = null;
	}

	self.scrollTimeout = setTimeout(function() { self.scrolling = true; }, 50);
}

Box.prototype.autoScrollChildrenFast = function(){
	var self = this;
	var horizontalAutoscrollElems = self.element.getSuccessorsByClass("horizontalAutoscroll");
	for(var i = 0; i < horizontalAutoscrollElems.length; i++){
		(function (idx, arr){
			autoScrollHorizontal(arr[idx], 0);
		})(i, horizontalAutoscrollElems);
	}
	self.scrolling = true;
}

Box.prototype.setUnactive = function(){
	var self = this;
	if(self.scrolling) {
		self.scrolling = false;
		while(self.timeouts.length > 0){
			clearTimeout(self.timeouts.pop());
		}
		var horizontalAutoscrollElems = self.element.getSuccessorsByClass("horizontalAutoscroll");
		for(var i = 0; i < horizontalAutoscrollElems.length; i++){
			$(horizontalAutoscrollElems[i]).stop(true).clearQueue().scrollLeft(0).css("opacity", 1);
		}
	}
}

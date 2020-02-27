function Channel( init_obj, element_id ){
	this.center = 1; 
	this.open = false;
	this.element_id = element_id;
	this.init(init_obj, element_id);
}

Channel.prototype.getNowNext = function() {
    var self = this;
    if(self.contentGuideURI) {
        $.get( self.contentGuideURI+"?sid="+self.getServiceRef()+"&now_next=true", function( data ) { //TODO use ContentGuideServiceRef from the service
            var epg = {};
            var boxes = [];
            var now_next = {};
            var newPrograms = self.parseSchedule(data);
            if(newPrograms.length > 0) {
                 epg["now"] = newPrograms[0];
            }
            if(newPrograms.length > 1) {
                 epg["next"] = newPrograms[1];
            }
            self.epg = epg;

	        $.each( self.items, function( i, item ){
			if(self.epg && self.epg[item.name] != null){
				// Set info text for the Box
				// NOW
				if(item.name == "now"){
                    try{
                        var box = new Box(self.epg[item.name], self.element_id + "_" + item.name);
                        box.name = item.name;
                        box.parentimage = self.epg[item.name].mediaimage || "../CommonUI/empty.png";
                        box.description = item.description || "";
                        var now = box;
                        var info = "";
                        var next = self.epg["next"];
                        var following = self.epg["following"];
                        
                        if(now){
                            
                            //   info += "<span>";
                            if(now.start && now.end){
                                var now_start = now.start;
                                var now_end = now.end;
                            }
                            
                            if(now_start){
                               info += "<span class=\"horizontalAutoscroll\">" +now_start.create24HourTimeString() + " ";
                                
                                var defLang_title = XMLEscape(now.getTitle("def"));
                                var altLang_title = XMLEscape(now.getTitle("alt"));
                                
                                info += defLang_title + ((defLang_title != altLang_title) ? " " + altLang_title : "");
                                
                                if(now.season && now.season.indexOf("_") > -1){
                                    var season = now.season.substring(0, now.season.indexOf("_"));
                                    
                                }
                                
                                (now.season && now.season.indexOf("_") > -1) ? " - S" + season + "EP" + now.season.substring(now.season.indexOf("_")+1): "";
                                
                                info += "</span>"; 
                            }else{
                                info += "<span class=\"horizontalAutoscroll\">";
                                var defLang_title = XMLEscape(now.getTitle("def"));
                                var altLang_title = XMLEscape(now.getTitle("alt"));
                                info += defLang_title + ((defLang_title != altLang_title) ? " " + altLang_title : "");
                                
                                if(now.season && now.season.indexOf("_") > -1){
                                    var season = now.season.substring(0, now.season.indexOf("_"));
                                    
                                }
                                
                                info += (now.season && now.season.indexOf("_") > -1) ? " - S" + season + "EP" + now.season.substring(now.season.indexOf("_")+1) : "";
                                info += "</span>"; 
                            }
                            
                            
                            // info += "</span>";
                            
                            if(now_end){
                                info += "<span class=\"timeremaining\">" + Math.max(0, Math.round((now_end.getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining</span>";
                            }
                            
                            
                            if(now_end && now_start){
                               var pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - now_start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((now_end.getTime() - now_start.getTime()) / 1000 / 60)) * progressOpenWidth);
                            
                                info += "<span class=\"progress_bar_frame open\">" +
                                            "<span class=\"progress_bar open\" style=\"width:"+ pb_width +"px;\"></span>" +
                                        "</span>";
                                        
                            }
                            now.info = info;
                            
                            if(now instanceof Box){
                                boxes.push(now);
                            }
                       
                            if(self.epg[item.name].title == "No program" && self.epg["following"].title == "No program" && self.epg["next"].title == "No program"){
                                return;
                            }
                            
                        }
                     }catch(e){
                        console.log("Error updating channel info: " + e.message);
                    }
                    
					
					if(following){
						info = "";
						var box = new Box(following, self.element_id + "_" + "following");
						if(box){
							
							if(following.start && following.end){
								var following_start = following.start;
								var following_end = following.end;
							}
							
                            box.name = "following";
							box.parentimage = following.mediaimage || "../CommonUI/empty.png";
							box.description = "Following";
                            
                            
							//info += "<span>";
							
							info += "<span class=\"horizontalAutoscroll\"> ";
							if(following_start){
								info += following_start.create24HourTimeString() + " ";
							}
							
							var defLang_title = XMLEscape(box.getTitle("def"));
							var altLang_title = XMLEscape(box.getTitle( "alt"));
							
							info += defLang_title + ((defLang_title != altLang_title) ? " " + altLang_title : "");
							
							if(following.season && following.season.indexOf("_") > -1){
								var season = following.season.substring(0, following.season.indexOf("_"));
								
							}
							
							info += (following.season && following.season.indexOf("_") > -1) ? " - S" + season + "EP" + following.season.substring(following.season.indexOf("_")+1) : "";
							info += "</span>";
							
							if(following_start && following_end){
								info += "<span class=\"duration\"> Duration " + Math.max(0, Math.round((following_end.getTime() - following_start.getTime()) / 1000 / 60)) + " mins</span>";
							}
							//info += "</span>";
                            
							box.info = info;
						}	
						
						if(box instanceof Box){
							boxes.push(box);
						}
					}
					
					if(next){
						info = "";
						var box = new Box(next, self.element_id + "_" + "next");
						if(box){
                            
                            box.name = "next";
							box.parentimage = next.mediaimage2 || "../CommonUI/empty.png";
							box.description = "Next";
                            
							//info += "<span>";
						
							if(next.start && next.end){
								var next_start = next.start;
								var next_end = next.end;
							}
                            
							info += "<span class=\"horizontalAutoscroll\"> ";
							if(next_start){
								info += next_start.create24HourTimeString() + " ";
							}
							
							var defLang_title = XMLEscape(box.getTitle( "def"));
							var altLang_title = XMLEscape(box.getTitle( "alt"));
					
							info += defLang_title + ((defLang_title != altLang_title) ? " " + altLang_title : "");
							
							if(next.season && next.season.indexOf("_") > -1){
								var season = next.season.substring(0, next.season.indexOf("_"));
								
							}
							
							info += (next.season && next.season.indexOf("_") > -1) ? " - S" + season + "EP" + next.season.substring(next.season.indexOf("_")+1) : "";
							info += "</span>"; 
							
							if(next_start && next_end){
								info += "<span class=\"duration\"> Duration " + Math.max(0, Math.round((next_end.getTime() - next_start.getTime()) / 1000 / 60)) + " mins</span>";
							}
							//info += "</span>";
							
                            
                            box.info = info;
                            
						}
						if(box instanceof Box){
							boxes.push(box);
						}
					}
                    
					
				}	
			}
         
		});
        self.boxes = boxes;
        self.center = 0;        
      
        self.populate(null);
        var status_wrapper = self.element.childNodes.getByClass("status_wrapper")[0];
        var pb_width = 0;
        if(self.boxes[0].start && self.boxes[0].end){
            var start = self.boxes[0].start;
            var end = self.boxes[0].end;
            pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60)) * progressWidth);
        }

        // Update all closed channels progressbars
        var progress_bar_frame = status_wrapper.childNodes.getByClass("progress_bar_frame")[0];
        var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
        progress_bar.style.width = pb_width + "px";
        if(self.open){
			var activeBoxName = (activeBox) ? activeBox.name : null;
			var focus = self.getBoxByName(activeBoxName);
			self.setOpen(true, focus);
        }
      },"text");
    }
    else {
        self.center = 0;
        self.populate(null);
    }
}


Channel.prototype.init = function( init_obj, element_id){
		var self = this;
		self.boxes = [];
		$.each( init_obj, function( f, field ){
			self[f] = field;
		});
        self.element = document.getElementById(element_id);
		if(self.element == null){
			var element = document.createElement("div");
			element.className = "menuitem closed";
			element.setAttribute("id", element_id);

			// Arrow up
			var arrow_up = document.createElement("div");
			arrow_up.addClass("menu_arrow_triangle_up");
			arrow_up.addClass("menu_arrow");
			element.appendChild(arrow_up);

			// Boxitem title
			if(self.description != null && self.description.length > 0){
				var boxitem_title = document.createElement("div");
				boxitem_title.innerHTML = "<span>" + XMLEscape(self.description) + "</span>";
				boxitem_title.addClass("boxitem_title");
				element.appendChild(boxitem_title);
			}

			// Menuitem title
			var menuitem_title = document.createElement("div");
            var innerHtml = "";
            if(self.image && self.image.length > 0 ) {
                innerHtml = "<span class=\"menuitem_chicon\"><img src=\""+self.image+"\"></img></span>";
            }
            menuitem_title.innerHTML = innerHtml+"<span class=\"menuitem_chnumber\">" + XMLEscape(self.lcn) +".</span><span class=\"menuitem_chname\">" + XMLEscape(self.title) +"</span><span class=\"sourcetype\">" + XMLEscape(self.sourceTypes) +"</span>";

            menuitem_title.addClass("menuitem_title", null);
			element.appendChild(menuitem_title);
            
			// Items
			var items = document.createElement("div");
			items.addClass("items", null);
			element.appendChild(items);
			
			// Arrow down
			var arrow_down = document.createElement("div");
			arrow_down.addClass("menu_arrow_triangle_down");
			arrow_down.addClass("menu_arrow");
			element.appendChild(arrow_down);

			self.element = element;
		}

        if(!self.epg || self.epg.length == 0) {
            var placeholder = { text : "No program information" };
            var box = new Box( placeholder, self.element_id + "_" + self.code);
            box.name = self.name;
            box.parentimage = "../CommonUI/empty.png";
            box.description =  "";
            var now = box;
            var info = "No program information";
            now.info = info;
            self.boxes.push(now);
        }
        self.getNowNext();
}

Channel.prototype.update = function(epg_obj){
		var self = this;
		if(self.element){
			var items = self.element.childNodes.getByClass("items")[0];
			if(items){ items.innerHTML = ""; }
			self.getNowNext();
			if(self.open){
				var activeBoxName = (activeBox) ? activeBox.name : null;
				var focus = self.getBoxByName(activeBoxName);
				self.setOpen(true, focus);
			}
		}
}

Channel.prototype.setOpen = function(open, focus){
	var channel = this;
	channel.open = open;
	if(channel.open){
		var box = focus;
		if(!box && channel.boxes[channel.center]){
			box = channel.boxes[channel.center];
		}
		if(!box){
			box = channel.boxes[0];
		}

		if(box != null){
			if(focusBox(box)){
				var itemsElem = channel.element.childNodes.getByClass("items")[0];
				if(itemsElem){
					var left = 930;
					for(var i = 0; i < itemsElem.childNodes.length; i++){
						if(itemsElem.childNodes[i] == box.element){
							break;
						}
						left = left - 250;
					}
					itemsElem.style.left = left + "px";
				}
				channel.element.removeClass("closed");
				channel.element.addClass("open");
			}
		}

		var catchups = channel.element.getSuccessorsByClass("catchup");
		var related_videos = channel.element.getSuccessorsByClass("related_video");
        if(catchups != null){
            for(var i = 0; i < catchups.length; i++){
                var desc = catchups[i].getSuccessorsByClass("boxitem_description");
                if(desc.length > 0){
                    desc = desc[0];
                    if(i < catchups.length-1){
                        desc.addClass("hide");
                    }
                    else{
                        desc.removeClass("hide");
                    }
                }
            }
        }
        if(related_videos != null){
            for(var i = 0; i < related_videos.length; i++){
                var desc = related_videos[i].getSuccessorsByClass("boxitem_description");
                if(desc.length > 0){
                    desc = desc[0];
                    if(i > 0){
                        desc.addClass("hide");
                    }
                    else{
                        desc.removeClass("hide");
                    }
                }
            }
        }
	}
	else{
		channel.element.removeClass("open");
		channel.element.addClass("closed");
		channel.element.childNodes.getByClass("items")[0].style.left = "0px";
	}
}

Channel.prototype.populate = function(callback){
	var self = this;
	var itemsElem = self.element.childNodes.getByClass("items")[0];
	if(itemsElem){
		var boxes = document.createDocumentFragment();
		
        $.each(self.boxes, function(i, box){
			if(box instanceof Box){
                    box.populate(function(){
                        if(box.catchup){box.element.addClass("catchup");}
                        if(box.related_video){box.element.addClass("related_video");}
                    });
				boxes.appendChild(box.element);
			}
		});
        
		itemsElem.appendChild(boxes);
	}
    
	if(typeof(callback) == "function"){
		callback.call();
	}
}

Channel.prototype.getCenterBox = function(){
	try{
		if(this.boxes[this.center]){
			return this.boxes[this.center];
		}
		if(this.boxes[0]){
			return this.boxes[0];
		}
		return null;
	}
	catch(e){
		return null;
	}
}

Channel.prototype.getPreviousItem = function(){
	var self = this;
	var prev;
	$.each(self.boxes, function(i, box){
		if(box instanceof Box){
			if(box.element.hasClass("focused") && i > 0){
				prev = self.boxes[i-1];
				return false;
			}
		}
	});
	return prev;
}

Channel.prototype.getNextItem = function(){
	var self = this;
	var next;
	$.each(self.boxes, function(i, box){
		if(box.element.hasClass("focused") && i < self.boxes.length-1){
			next = self.boxes[i+1];
			return false;
		}
	});
	return next;
}

Channel.prototype.getBoxByName = function(name){
	var self = this;
	var result = null;
	$.each(self.boxes, function(i, box){
		if(box){
			if(box.name == name){
				result = box;
				return false;
			}
		}
	});
	return result;
}

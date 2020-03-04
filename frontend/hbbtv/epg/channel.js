/********* Channel ***********/
function Channel(channeldata, element_id){
	this.init(channeldata, element_id);
}

Channel.prototype.getSchedule = function(start,end,callback,earlier) {
    var self = this;

    if(self.contentGuideURI) {
         var offset = new Date().getTimezoneOffset()*60;
         $.get( self.contentGuideURI+"?sids[]="+self.getServiceRef()+"&start="+(start+offset)+"&end="+(end+offset), function( data ) { //TODO use ContentGuideServiceRef from the service
            var newPrograms = self.parseSchedule(data);
            if(newPrograms.length == 0) {
                var program = {};
                var programId = "no_program_"+start+"_"+end;
                program.start = new Date(start*1000);
                program.end  =  new Date(end*1000);
                program.prglen = (program.end.getTime() - program.start.getTime())/(1000*60);
                program.title = "No programinfo available";
                var program = new Program(program, self.element_id + "_no_program", self);
                program.bilingual = self.bilingual;
                program.channelimage = self.image;
                program.channel_streamurl = self.streamurl;
                program.noprogram = true;
                newPrograms.push(program);
            }
            if(earlier) {
                for(var j=newPrograms.length-1;j>= 0;j--) {
		           self.programs.unshift(newPrograms[j]);
                }
            }
            else {
                for(var j= 0;j < newPrograms.length;j++) {
		           self.programs.push(newPrograms[j]);
                }
            }
            if(typeof(callback) == "function") {
                callback.call();
            }
         },"text");
    }
}

Channel.prototype.init = function(channeldata, element_id){
	var channel = this;
	channel.programs = [];
	channel.open = false;
	channel.visiblePrograms = [];
	channel.element_id = element_id;
	channel.element = document.getElementById(element_id);
	if(channel.element == null){
		channel.element = document.createElement("div");
		channel.element.addClass("epgRow");
		channel.element.setAttribute("id", element_id);
		channel.element.setAttribute("data-ccode", channeldata.code );
	}
	for(var field in channeldata){
		if(field != "epg" && typeof(field) != "function"){
			channel[field] = channeldata[field];
		}
	}

	channel.bilingual = false;
}

Channel.prototype.setVisiblePrograms = function(start, end){
	this.visiblePrograms = [];
	var self = this;
	$.each(self.programs, function(i, program){
		if( program && program instanceof Program){
			if( (program.end_date_obj > start && program.end_date_obj <= end)
			||  (program.start_date_obj < end && program.start_date_obj >= start)
			||  (program.start_date_obj <= start && program.end_date_obj >= end)){
				program.visible = true;
				
				var overlappingNoProgram = false;
				if(program.noprogram){
					$.each(self.visiblePrograms, function(j, vp){
						if(program.overlaps(vp)){
							console.log("overlappingNoProgram");
							overlappingNoProgram = true;
							return false;
						}
					});
				}
				if(!overlappingNoProgram){
					self.visiblePrograms.push(program);
				}
			}
		}
	});
	
	/*
	// Check whether this program overlaps with another visible program.
	$.each(self.visiblePrograms, function(j, vp){
		$.each(self.visiblePrograms, function(j2, vp2){
			if(vp.start_date_obj >= vp2.start_date_obj && vp.end_date_obj <= vp2.end_date_obj){
				// is overlapping -> If one of the overlapping programs is a non-program, remove it.
				console.log(self.visiblePrograms);
				if(vp.noprogram){
					self.visiblePrograms.splice(j, 1);
					console.log("remove");
				}
				else if(vp2.noprogram){
					self.visiblePrograms.splice(j2, 1);
					console.log("remove");
				}
				console.log(self.visiblePrograms);
			}
		});
	});
	*/
}

Channel.prototype.populate = function(){
	try{
		var self = this;
		self.element.innerHTML = "";

		$.each(self.visiblePrograms, function(i, program){
			if(program.visible){
				program.populate();
				if(program.element){
					var start = program.start_date_obj;
					var left = ((start.getTime() - _epg_.timelinestart.getTime()) / 1000 / 60) * MINUTE_WIDTH;
					program.element.style.left = left + "px";
					if(left < 0){
						program.element.firstChild.style.left = (-left) + "px";
					}
					self.element.appendChild(program.element);
				}
			}
		});
	}
	catch(e){
		console.log(e);
	}
}

Channel.prototype.setFocus = function(){
	try{
		var nowProgram = null;
		var firstVisible = null;
        var current = null;
		var self = this;
		$.each(self.visiblePrograms, function(i, program){
			if(program.now()){
				this.open = true;
				nowProgram = program;
			}
   			if(program.visible && !firstVisible){
				firstVisible = program;
			}
            if(_epg_.activeItem instanceof Program && program.title  == _epg_.activeItem.title && program.start.getTime() == _epg_.activeItem.start.getTime() && program.end.getTime() == _epg_.activeItem.end.getTime()) {
               current = program;
               return;
            }
		});
        if(current) {
            this.open = true;
			_epg_.setActiveItem(current);
        }
        else if(!nowProgram && firstVisible){
			this.open = true;
			_epg_.setActiveItem(firstVisible);
		}
		else if(nowProgram){
			this.open = true;
			_epg_.setActiveItem(nowProgram);
		}
	}
	catch(e){
		console.log(e);
	}
}

Channel.prototype.getClosest = function(currentFocus){
	var currPrgBounds = currentFocus.element.getBoundingClientRect();
	var ax = currPrgBounds.left + (currPrgBounds.width/2);
	var ay = currPrgBounds.top + (currPrgBounds.height/2);
	var closest = null;
	var mindist = null;

	if(currentFocus.element.hasClass("now")){
        for(var i = 0; i < this.visiblePrograms.length; i++){
            if(this.visiblePrograms[i].element.hasClass("now")){
                closest = this.visiblePrograms[i];
                return closest;
            }
        }
    }

	$.each(this.visiblePrograms, function(i, program){
		// Aligning left sides of programs are considered more important than mathematical distance.
		var prgBounds = program.element.getBoundingClientRect();
		if(Math.round(currPrgBounds.left) == Math.round(prgBounds.left)){
			closest = program;
			return false;
		}

		// Check whether the current focus program fits inside the time range of a program of this channel, or vice versa.
		if((currPrgBounds.left >= prgBounds.left && currPrgBounds.left+currPrgBounds.width <= prgBounds.left+prgBounds.width)
		|| (prgBounds.left >= currPrgBounds.left && prgBounds.left+prgBounds.width <= currPrgBounds.left+currPrgBounds.width)){
			closest = program;
			return false;
		}

		var bx = prgBounds.left + (prgBounds.width/2);
		var by = prgBounds.top + (prgBounds.height/2);
		var dist = Math.sqrt(Math.pow(ax-bx, 2) + Math.pow(ay-by, 2));
		if(!mindist || dist < mindist){
			mindist = dist;
			closest = program;
		}
	});
	return closest;
}

Channel.prototype.getCurrentlyRunningProgram = function(){
	var self = this;
	for(var i = 0; i < self.visiblePrograms.length; i++){
		if(self.visiblePrograms[i].now()){
			return self.visiblePrograms[i];
		}
	}
	for(var i = 0; i < self.programs.length; i++){
		if(self.programs[i].now()){
			return self.programs[i];
		}
	}
	return null;
}

Channel.prototype.nextProgram = function(item){
	var next = null;
	var self = this;
	$.each(self.visiblePrograms, function(i, program){
		if(program == item){
			if(i+1 < self.visiblePrograms.length){
				if(self.visiblePrograms[i+1] instanceof Program){
					next = self.visiblePrograms[i+1];
					return false;
				}
			}
		}
	});
	if(!next){
		$.each(self.programs, function(i, program){
			if(program == item){
				if(i+1 < self.programs.length){
					if(self.programs[i+1] instanceof Program){
						next = self.programs[i+1];
						return false;
					}
				}
			}
		});
	}
	return next;
}

Channel.prototype.previousProgram = function(item){
	var previous = null;
	var self = this;
	$.each(self.visiblePrograms, function(i, program){
		if(program == item){
			if(i > 0){
				if(self.visiblePrograms[i-1] instanceof Program){
					previous = self.visiblePrograms[i-1];
					return false;
				}
			}
		}
	});
	if(!previous){
		$.each(self.programs, function(i, program){
			if(program == item){
				if(i > 0){
					if(self.programs[i-1] instanceof Program){
						previous = self.programs[i-1];
						return false;
					}
				}
			}
		});
	}
	return previous;
}

/********** GridEPG ***********/
function GridEPG(element_id, epgdata, firstvisible_channel, visible_channels, firstday, timelinestart, days,loadedCallback){
	this.lang 										= "def";
	this.activeItem 								= null;
	this.currentTimeline 							= null;
	this.detail_program_title 						= document.getElementById("detail_program_title");
	this.detail_description 						= document.getElementById("detail_description");
	this.detail_description.scrollTop 				= 0;
	this.detail_description_text 					= document.getElementById("detail_description_text");
	this.detail_program_time 						= document.getElementById("detail_program_time");
	this.rating 									= document.getElementById("rating");
	this.rating.className 							= "";
	this.detail_programimage 						= document.getElementById("detail_programimage");
	this.detail_programimage.className 				= "";
	this.detailDescriptionVbar 						= document.getElementById("detailDescriptionVbar");
	this.detailDescriptionScroller 					= document.getElementById("detailDescriptionScroller");
	this.programDetailTitleFadeOutTimeout 			= null;
	this.programDetailTitleFadeInTimeout 			= null;
	this.programDetailTitleScrollStartTimeout 		= null;
	this.dayIdx 									= 3;
	this.previousDayIsAvailable 					= true;
	this.nextDayIsAvailable 						= true;
	this.channel_margin_bottom						= 3;
	this.channel_element_height  					= 55;
	this.firstDay 									= firstday;
	this.firstDay 									= new Date(this.firstDay.setHours(4));
	this.firstDay 									= new Date(this.firstDay.setMinutes(0));
	this.firstDay 									= new Date(this.firstDay.setSeconds(0));
	this.firstDay 									= new Date(this.firstDay.setMilliseconds(0));
	this.lastDay 									= new Date(this.firstDay.getTime() + ((days-1) * TWENTY_FOUR_HOURS));
	this.minDay                     				= new Date(this.firstDay.getTime() - (2 * TWENTY_FOUR_HOURS));
	this.maxDay                     				= new Date(this.lastDay.getTime() + (6 * TWENTY_FOUR_HOURS));
	this.timeouts 									= {
														"autoScrollDescriptionTimeouts":[], 
														"autoScrollDetailProgramTitleTimeouts":[]
													};
    this.loadedCallback = loadedCallback;


	this.initEPG(element_id, epgdata, firstvisible_channel, visible_channels, firstday, timelinestart, days);
}

GridEPG.prototype.initEPG = function(element_id, epgdata, firstvisible_channel, visible_channels, firstday, timelinestart, days){
	this.days 											= days;
	this.firstDay 										= firstday;
	this.firstDay 										= new Date(this.firstDay.setHours(4));
	this.firstDay 										= new Date(this.firstDay.setMinutes(0));
	this.firstDay 										= new Date(this.firstDay.setSeconds(0));
	this.firstDay 										= new Date(this.firstDay.setMilliseconds(0));
	this.lastDay 										= new Date(this.firstDay);
	this.timelinestart 									= new Date(timelinestart);
	this.timelinestart 									= new Date(this.timelinestart.setMinutes(0));
	this.timelinestart 									= new Date(this.timelinestart.setSeconds(0));
	this.timelinestart 									= new Date(this.timelinestart.setMilliseconds(0));
	this.timelineend 									= new Date(this.timelinestart.getTime() + (1000 * 60 * 180)); // start + 3 hours
	this.firstvisible_channel 							= firstvisible_channel;
	this.visible_channels 								= visible_channels;
	this.descTextFadeOutTimeout 						= null;
	this.descTextFadeInTimeout 							= null;
	this.descTextScrollStartTimeout 					= null;
	this.element 										= document.getElementById(element_id);
	this.cids = cids;
    this.channelsLoaded = 0;
	if(this.element == null){
		this.element = document.createElement("div");
		this.element.setAttribute("id", element_id);
	}

	this.channels = [];
    var start = this.firstDay.getTime()/1000;
    var end = start +(24*60*60);
	for(var i = 0; i < epgdata["channels"].length; i++){
		var channel = new Channel(epgdata["channels"][i], "epgRow" + i );
		if(i >= firstvisible_channel && i < firstvisible_channel + this.visible_channels){
			channel.visible = true;
		}
		else{
			channel.visible = false;
		}
        channel.getSchedule(start,end,this.channelLoaded.bind(this),false);
		this.channels.push(channel);
	}

	this.initLeftBar();
	this.initContainer();

	var self = this;
	setTimeout(function(){
		if(document.getElementById("currentTimelineContainer") == null){
			self.initCurrentTimeline();
		}
		else{
			self.currentTimeline = document.getElementById("currentTimelineContainer");
			self.updateVerticalTimeLine();
		}
	}, 50);
}

GridEPG.prototype.channelLoaded = function(){
    this.channelsLoaded++;

    if(this.channelsLoaded == this.channels.length && typeof(this.loadedCallback) == "function") {
		this.loadedCallback.call();
    } 
}

GridEPG.prototype.initCurrentTimeline = function(){
	if(document.getElementById("currentTimelineContainer") == null){
		var currentTimelineContainer = document.createElement("div");
		currentTimelineContainer.setAttribute("id", "currentTimelineContainer");
		var verticalTimeLine = document.createElement("div");
		verticalTimeLine.setAttribute("id", "verticalTimeLine");
		verticalTimeLine.style.width = Math.max(1,PROGRAM_MARGIN_WIDTH) + "px";
		currentTimelineContainer.appendChild(verticalTimeLine);
		this.element.appendChild(currentTimelineContainer);
		this.currentTimeline = currentTimelineContainer;
		var vtimeline = document.getElementById("verticalTimeLine");
		var pos = ((curTime.getTime()-this.timelinestart.getTime()) / 1000 / 60 * MINUTE_WIDTH) - (this.currentTimeline.offsetWidth/2) - (vtimeline.offsetWidth/2);
		this.currentTimeline.style.left = Number(this.containerFrame.getLeft() + pos) + "px";
	}
}

GridEPG.prototype.updateVerticalTimeLine = function(){
	if(this.currentTimeline){
		if(curTime >= this.timelinestart && curTime <= this.timelineend){
			this.currentTimeline.removeClass("hide");
			if(this.currentTimeline && this.timelinestart){
				var vtimeline = document.getElementById("verticalTimeLine");
				var pos = ((curTime.getTime()-this.timelinestart.getTime()) / 1000 / 60 * MINUTE_WIDTH) - (this.currentTimeline.offsetWidth/2) - (vtimeline.offsetWidth/2);
				this.currentTimeline.style.left = Number(this.containerFrame.getLeft() + pos) + "px";
			}
		}
		else{
			this.currentTimeline.addClass("hide");
		}
	}
}

GridEPG.prototype.insertFirstDay = function(epgdata){
	console.log("GridEPG.insertFirstDay");
	for(var i = 0; i < epgdata.channels.length; i++){
		for(var j = 0; j < this.channels.length; j++){
			if(epgdata.channels[i].id == this.channels[j].id){
				var tempchannel = new Channel(epgdata.channels[i], "temp");
				this.channels[j].programs = tempchannel.programs.concat(this.channels[j].programs);
				for(var k = 0; k < this.channels[j].programs.length; k++){
					if(this.channels[j].programs[k] != null){
						this.channels[j].programs[k].element_id = this.channels[j].element_id + "_program_" + k;
					}
				}
				break;
			}
		}	
	}
}

GridEPG.prototype.insertLastDay = function(epgdata){
	console.log("GridEPG.insertLastDay");

	for(var i = 0; i < epgdata.channels.length; i++){
		for(var j = 0; j < this.channels.length; j++){
			if(epgdata.channels[i].id == this.channels[j].id){
				var tempchannel = new Channel(epgdata.channels[i], "temp");
				this.channels[j].programs = this.channels[j].programs.concat(tempchannel.programs);
				for(var k = 0; k < this.channels[j].programs.length; k++){
					if(this.channels[j].programs[k] != null){
						this.channels[j].programs[k].element_id = this.channels[j].element_id + "_program_" + k;
					}
				}
				break;
			}
		}	
	}
}

GridEPG.prototype.removeFirstDay = function(){
	console.log("GridEPG.removeFirstDay");

	for(var j = 0; j < this.channels.length; j++){
		for(var k = 0; k < this.channels[j].programs.length; k++){
			if(this.channels[j].programs[k] != null && this.channels[j].programs[k].start_date_obj >= this.firstDay){
				this.channels[j].programs.splice(0, Math.max(0,k-1));
				break;
			}
		}
	}	
}


GridEPG.prototype.removeLastDay = function(){
	console.log("GridEPG.removeLastDay");

	for(var j = 0; j < this.channels.length; j++){
		for(var k = this.channels[j].programs.length-1; k >= 0; k--){
			if(this.channels[j].programs[k] != null && this.channels[j].programs[k].start_date_obj > this.lastDay){
				this.channels[j].programs.splice(k, this.channels[j].programs.length-k);
				break;
			}
		}
	}	
}

GridEPG.prototype.initLeftBar = function(){
	//console.log("GridEPG.initLeftBar");

	this.leftbar = document.getElementById("leftbarFrame");
	if(this.leftbar == null){
		this.leftbar = document.createElement("div");
		this.leftbar.setAttribute("id", "leftbarFrame");
		this.element.appendChild(this.leftbar);
	}
	this.leftbar.innerHTML = "";
	var channels = document.createElement("div");
	channels.setAttribute("id", "channels");
	this.leftbar.appendChild(channels);
}

GridEPG.prototype.initContainer = function(){
	//console.log("GridEPG.populateContainer");

	this.containerFrame = document.getElementById("containerFrame");
	if(this.containerFrame == null){
		this.containerFrame = document.createElement("div");
		this.containerFrame.setAttribute("id", "containerFrame");
		if(document.getElementById("detail")){
			this.element.insertBefore(document.getElementById("detail"));
		}
		else{
			this.element.appendChild(this.containerFrame);
		}
	}
	this.containerFrame.innerHTML = "";
	var container = document.createElement("div");
	container.setAttribute("id", "container");
	this.container = container;
	this.containerFrame.appendChild(container);
	var epgRows = document.createElement("div");
	epgRows.setAttribute("id", "epgRows");
	this.epgRowsElement = epgRows;
	container.appendChild(this.epgRowsElement);
}

GridEPG.prototype.getOpenChannel = function(){
	for(var i = 0; i < this.channels.length; i++){
		if(this.channels[i].open){
			return this.channels[i];
		}
	}
	return null;
}

GridEPG.prototype.getPreviousChannel = function(){
	for(var i = 1; i < this.channels.length; i++){
		if(this.channels[i].open){
			return this.channels[i-1];
		}
	}
	return null;
}

GridEPG.prototype.getNextChannel = function(){
	for(var i = 0; i < this.channels.length-1; i++){
		if(this.channels[i].open){
			return this.channels[i+1];
		}
	}
	return null;
}

GridEPG.prototype.populate = function(callback){
	console.log("GridEPG.populate()");
	try{
		this.populateTimeline();

		var self = this;
		self.leftbar.firstChild.innerHTML = "";
		self.epgRowsElement.innerHTML = "";

		$.each(self.channels, function(i, channel){
			// leftbar
            var img = channel.image;
			var channelElement = document.createElement("div");
			channelElement.setAttribute("id", "channel_" + i);
			channelElement.addClass("channel");
            if(img) {
                channelElement.innerHTML = "<img src=\"" + img + "\" alt=\"\" />";
            }
            else {
                channelElement.innerHTML = "<span>"+channel.title+"</span>";
            }
			
			self.leftbar.firstChild.appendChild(channelElement);

			// epgRow
			channel.setVisiblePrograms(self.timelinestart, self.timelineend);
			channel.populate();
			self.epgRowsElement.appendChild(channel.element);
		});

		this.handleArrows();

		if(typeof(callback) == "function"){
			callback.call();
		}
	}
	catch(e){
		console.log(e);
	}
}

GridEPG.prototype.handleArrows = function(){
	// Set arrows
	if(arrow_down && arrow_up && arrow_left && arrow_right){
		arrow_down.removeClass("hide");
		arrow_up.removeClass("hide");
		arrow_left.removeClass("hide");
		arrow_right.removeClass("hide");
		
		if(this.channels.last().visible){
			arrow_down.addClass("hide");
		}
		if(this.channels[0].visible){
			arrow_up.addClass("hide");
		}
		if(this.firstDay == this.minDay && this.activeItem == this.getOpenChannel().programs[0]){
			arrow_left.addClass("hide");
		}
		if(this.lastDay == this.maxDay && this.activeItem == this.getOpenChannel().programs.last()){
			arrow_right.addClass("hide");
		}
	}
}

/* This function populates programs and timeline only and leaves the leftbar as it is */
GridEPG.prototype.populatePrograms = function(callback){
	self = this;
	self.epgRowsElement.innerHTML = "";
	$.each(self.channels, function(i, channel){
		channel.setVisiblePrograms(self.timelinestart, self.timelineend);
		channel.populate();
		self.epgRowsElement.appendChild(channel.element);
	});
	self.populateTimeline();
	if(typeof(callback) == "function"){
		callback.call();
	}
}

GridEPG.prototype.populateTimeline = function(){
	var timeline = document.getElementById("timeline");
	if(!timeline){
		timeline = document.createElement("div");
		timeline.setAttribute("id", "timeline");
		this.containerFrame.appendChild(timeline);
	}
	timeline.innerHTML = "";
	var hours = Math.ceil((this.timelineend.getTime() - this.timelinestart.getTime()) / 1000 / 60 / 60);
	var hour = this.timelinestart.getHours();
	var minutes = this.timelinestart.getMinutes();

	var CLOCK_FORMATS = {
		TWELVE_HOUR_CLOCK: 0,
		TWENTYFOUR_HOUR_CLOCK: 1
	};

	var clock_format = CLOCK_FORMATS.TWENTYFOUR_HOUR_CLOCK;

	if(hours){
		for(var h = 0; h < hours; h++){
			var hour12 = hour % 12;

			var time = document.createElement("div");
			var time_text = document.createElement("div");
			if(clock_format == CLOCK_FORMATS.TWELVE_HOUR_CLOCK){
				time_text.innerHTML = (hour12 ? hour12 : 12) + ("."+addZeroPrefix(minutes)) + ((hour >= 12) ? "PM" : "AM");
			}
			else{
				time_text.innerHTML = hour + (":"+addZeroPrefix(minutes));
			}
			addClass(time_text, "time_text");
			addClass(time, "timeline_fullhour");
			addClass(time, "timeline_line");
			time.style.width = 30 * MINUTE_WIDTH + "px";
			minutes += 30;
			
			if(minutes == 60){
				minutes = 0;
				hour++;
				hour12 = hour % 12;
			}
			if(hour == 24){
				hour = 0;
			}

			var time2 = document.createElement("div");
			var time_text2 = document.createElement("div");
			if(clock_format == CLOCK_FORMATS.TWELVE_HOUR_CLOCK){
				time_text2.innerHTML = (hour12 ? hour12 : 12) + ("."+addZeroPrefix(minutes)) + ((hour >= 12) ? "PM" : "AM");
			}
			else{
				time_text2.innerHTML = hour + (":"+addZeroPrefix(minutes));
			}

			addClass(time_text2, "time_text");
			addClass(time2, "timeline_halfhour");
			addClass(time2, "timeline_line");
			time2.style.width = 30 * MINUTE_WIDTH + "px";
			time.appendChild(time_text);
			time2.appendChild(time_text2);
			timeline.appendChild(time);
			timeline.appendChild(time2);

			minutes += 30;
			if(minutes == 60){
				minutes = 0;
				hour++;
				hour12 = hour % 12;
			}
			if(hour == 24){
				hour = 0;
			}
		}
	}
	this.updateVerticalTimeLine();
}

GridEPG.prototype.getFirstVisibleChannel = function(){
	for(var i = 0; i < this.channels.length; i++){
		if(this.channels[i].visible){
			return this.channels[i];
		}
	}
}

GridEPG.prototype.getLastVisibleChannel = function(){
	for(var i = this.channels.length-1; i >= 0; i--){
		if(this.channels[i].visible){
			return this.channels[i];
		}
	}
}


GridEPG.prototype.getChannelByKeyValue = function(key, value){
	var self = this;
	for(var j = 0; j < self.channels.length; j++){
		if(self.channels[j][key]){
			if(self.channels[j][key] == value){
				return self.channels[j];
			}
		}
	}
	return null;
}

GridEPG.prototype.getProgramByKeyValue = function(key, value){
	for(var j = 0; j < this.channels.length; j++){
		if(this.channels[j].visiblePrograms){
			for(var k = 0; k < this.channels[j].visiblePrograms.length; k++){
				if(this.channels[j].visiblePrograms[k] && this.channels[j].visiblePrograms[k][key]){
					if(this.channels[j].visiblePrograms[k][key] == value){
						return this.channels[j].visiblePrograms[k];
					}
				}
			}
		}
		if(this.channels[j].programs){
			for(var k = 0; k < this.channels[j].programs.length; k++){
				if(this.channels[j].programs[k] && this.channels[j].programs[k][key]){
					if(this.channels[j].programs[k][key] == value){
						return this.channels[j].programs[k];
					}
				}
			}
		}
	}
}

GridEPG.prototype.populateProgramDetail = function(program){
	var self = this;
	self.clearTimeouts();

	if(program instanceof Program){
		try{
			var title = document.getElementById("detail_program_title");
			var description = document.getElementById("detail_description");
			var description_text = document.getElementById("detail_description_text");
			$(description_text).clearQueue();
			$(description_text).stop(true);
			description_text.scrollTop = 0;
			var program_time = document.getElementById("detail_program_time");
			var genre = document.getElementById("detail_genre");
				genre.innerHTML = "";
			var audio = document.getElementById("detail_audio");
				audio.innerHTML = "";
			var rating = document.getElementById("rating");
				rating.className = "";
				rating.innerHTML = "";
			if(program.ratingreason){
				rating.innerHTML = "<span id=\"ratingReason\">"+program.ratingreason.replace(/[()]/g, "") +"</span>";
			}

			var programimage = document.getElementById("detail_programimage");
				programimage.removeClass("hidden");

			var programimageWrapper = document.getElementById("detail_programimage_wrapper");

			var detailDescriptionVbar = document.getElementById("detailDescriptionVbar");
			var detailDescriptionScroller = document.getElementById("detailDescriptionScroller");
			var minsLeft = null;

			if(program.noprogram){
				if(program.now()){
					minsLeft = Math.round((program.end_date_obj.getTime() - curTime.getTime()) / 60000);
				}
				program_time.innerHTML = program.start_date_obj.format("H:i") + " - ";
				program_time.innerHTML += program.end_date_obj.format("H:i");
				if(minsLeft != null && minsLeft >= 0){
					var timeLeftText = (minsLeft == 0) ? "Ending soon" : minsLeft + " mins remaining";
					program_time.innerHTML += ", " + timeLeftText;
				}
				description_text.innerHTML = "No programinfo available";
				title.innerHTML = "No programinfo available";
			}
			else{
				if(program.start_date_obj.getTime() <= curTime.getTime() && curTime.getTime() <= program.end_date_obj.getTime()){
					minsLeft = Math.round((program.end_date_obj.getTime() - curTime.getTime()) / 60000);
				}
				program_time.innerHTML = program.start_date_obj.format("H:i") + " - ";
				program_time.innerHTML += program.end_date_obj.format("H:i");
				if(minsLeft != null && minsLeft >= 0){
					var timeLeftText = (minsLeft == 0) ? "Ending soon" : minsLeft + " mins remaining";
					program_time.innerHTML += ", " + timeLeftText;
				}
				if(title.innerHTML != program.getTitle()){
					title.innerHTML = htmlDecode(program.getTitle());
					if(program.bilingual){
						title.innerHTML += " " + htmlDecode(program.getAltTitle()); 
					}
					if(program["season"] && program["season"].length > 0){
						title.innerHTML += " - EP" + program["season"].substring(program["season"].indexOf("_")+1);
					}
				}
				description_text.innerHTML = htmlDecode(program.getSynopsisText());
				
				if(description_text.scrollHeight > description_text.offsetHeight){
					this.autoScrollDescriptionText();
				}
				if(title.scrollWidth > title.offsetWidth){
					this.autoScrollDetailProgramTitle();
				}
			}

			var imageurls = [];
			if(program["serieimage"]){ imageurls.push(program["serieimage"]); }
			if(program["mediaimage"]){ imageurls.push(program["mediaimage"]); }
			if(program["mediaimage2"]){ imageurls.push(program["mediaimage2"]); }
			if(program["channelimage"]){ imageurls.push(program["channelimage"]); }
			var imageurl_idx = 0;
			if(imageurls.length > 0){
				programimage.setAttribute("src", "");
				var img = new Image();
				img.onload = function(){
					programimage.setAttribute("src", this.src);
				}
				img.onerror = function(){
					if(imageurl_idx < imageurls.length-1){
						imageurl_idx++;
						this.src = imageurls[imageurl_idx];
						this.setAttribute("alt", "");
					}
					else{
						programimage.addClass("hidden");
					}
				}
				img.src = imageurls[imageurl_idx];
			}
			else{
				programimage.setAttribute("src", "");
				programimage.addClass("hidden");
			}

			if(program["rating"] != null && program["rating"].length > 0){
				rating.addClass("rating_"+program["rating"]);
				rating.removeClass("hide");
			}
			else{
				rating.addClass("hide")
			}
			if(program.genre && program.genre.length > 0){
				genre.innerHTML = "Genre" + ": " + program.genre;
				genre.removeClass("hide");
			}
			else{
				genre.addClass("hide");
			}
			if(program.audios && program.audios.length > 0){
				audio.innerHTML = "Audio" + ": " + program.audios[0].lang;
				audio.removeClass("hide");
			}
			else{
				audio.addClass("hide");
			}

			if([genre, audio].hasClass("hide")){
				rating.addClass("no_border");
			}

			this.setProgramDate(program.start_date_obj);
		}
		catch(e){
			console.log(e);
		}
	}
}

GridEPG.prototype.autoScrollDescriptionText = function(){
	var delay = 5000;
	var description_text = document.getElementById("detail_description_text");
	var self = this;

	self.clearTimeouts("autoScrollDescriptionTimeouts");

	$(description_text).stop(true);
	$(description_text).clearQueue();

	var scrollDistance = (description_text.scrollHeight - description_text.offsetHeight);
	var pixelsPerSecond = 20;
	var durationInSeconds = scrollDistance / pixelsPerSecond;
	var durationInMilliseconds = durationInSeconds * 1000;

	self.timeouts.autoScrollDescriptionTimeouts.push(setTimeout(function(){
		$(description_text).animate(
			{scrollTop: scrollDistance}, 
			{
				duration: durationInMilliseconds, 
				easing: "linear", 
				complete: function(){
					self.timeouts.autoScrollDescriptionTimeouts.push(setTimeout(function(){
						$(description_text).addClass("fadeOut");
						self.timeouts.autoScrollDescriptionTimeouts.push(setTimeout(function(){
							$(description_text).scrollTop(0);
							$(description_text).removeClass("fadeOut");
							$(description_text).addClass("fadeIn");
							self.timeouts.autoScrollDescriptionTimeouts.push(setTimeout(function(){
								$(description_text).removeClass("fadeIn");
								self.autoScrollDescriptionText(delay);
							},500));
						}, 500));
					}, 3000));
				}
			}
		);
	}, delay));
}

GridEPG.prototype.autoScrollDetailProgramTitle = function(){
	var self = this;
	var delay = 2000;
	var element = this.detail_program_title;
	var scrollDistance = (element.scrollWidth - element.offsetWidth);
	var pixelsPerSecond = 20;
	var durationInSeconds = scrollDistance / pixelsPerSecond;
	var durationInMilliseconds = durationInSeconds * 1000;

	self.clearTimeouts("autoScrollDetailProgramTitleTimeouts");

	if(scrollDistance > 0){
		$(element).scrollLeft(0);
		self.timeouts.autoScrollDetailProgramTitleTimeouts.push(setTimeout(function(){
			$(element).animate(
				{scrollLeft: scrollDistance}, 
				{
					duration: durationInMilliseconds, 
					easing: "linear", 
					complete: function(){
						self.timeouts.autoScrollDetailProgramTitleTimeouts.push(setTimeout(function(){
							$(element).animate({opacity: 0}, {
								duration: 500,
								complete: function(){
									$(element).animate(
										{scrollLeft: 0}, 
										{
											duration: 0,
											complete: function(){
												self.timeouts.autoScrollDetailProgramTitleTimeouts.push(setTimeout(function(){
													$(element).animate({opacity: 1},
													{
														duration: 500,
														easing: "linear",
														complete: function(){
															autoScrollDetailProgramTitle();
														}
													});
												}, 500));
											}
										}
									);
								}
							});
						}, delay));
					}
				}
			);
		},delay));
	}
}

GridEPG.prototype.clearTimeouts = function(timeoutgroup){
	var self = this;
	if(timeoutgroup){
		while(self.timeouts[timeoutgroup].length > 0){
			clearTimeout(self.timeouts[timeoutgroup].pop());
		}
	}
	else{
		$.each(self.timeouts, function(timeoutgroupname, _timeoutgroup){
			while(self.timeouts[timeoutgroupname].length > 0){
				clearTimeout(self.timeouts[timeoutgroupname].pop());
			}
		});
	}
}

GridEPG.prototype.setProgramDate = function(dateobj){
	var date = document.getElementById("date");
	if(date){
		if(dateobj.getDate() == curTime.getDate()){
			date.innerHTML = "Today";
		}
		else{
			date.innerHTML = DAYS_ENGL[dateobj.getDay()].substring(0,3);
		}
		date.innerHTML += ", " + Number(dateobj.getDate()) + "/" +  Number(dateobj.getMonth()+1);
	}
}



GridEPG.prototype.populateInfo = function(str){
	var noDataInfo = document.createElement("div");
	noDataInfo.setAttribute("id", "noDataInfo");
	noDataInfo.innerHTML = str;
	if(this.container){
		this.container.appendChild(noDataInfo);
	}
}

GridEPG.prototype.setActiveItem = function(item){
	if(item){
		if(this.activeItem != null && this.activeItem instanceof Program){
			this.activeItem.unFocus();
		}
		this.activeItem = item;
		if(typeof(this.activeItem.setFocus == "function")){
			this.activeItem.setFocus();
		}
	}
}

GridEPG.prototype.firstLoadedChannelIdx = function(){
	if(_epg_.channels.length > 0){
		return _epg_.cids.indexOf(_epg_.channels[0].id.toString());
	}
	return null;
}

GridEPG.prototype.lastLoadedChannelIdx = function(){
	if(_epg_.channels.length > 0){
		return _epg_.cids.indexOf(_epg_.channels.last().id.toString());
	}
	return null;
}

GridEPG.prototype.loadPreviousDay = function(){
    setLoading(true);
    this.firstDay = new Date(this.firstDay.getTime() - TWENTY_FOUR_HOURS);
    this.channelsLoaded = 0;
    var start = this.firstDay.getTime()/1000;
    var end = start +(24*60*60);
    this.loadedCallback = this.dayLoaded.bind(this);
    this.timelineend = new Date(this.timelineend.getTime() - (1000 * 60 * 30));
    this.timelinestart = new Date(this.timelinestart.getTime() - (1000 * 60 * 30));
    console.log("loadPreviousDay");
    for(var i = 0;i < this.channels.length;i++) {
           this.channels[i].getSchedule(start,end,this.channelLoaded.bind(this),true);
    }

}

GridEPG.prototype.loadNextDay = function(){
   setLoading(true);
   this.lastDay =  new Date(this.lastDay.getTime() + TWENTY_FOUR_HOURS);
   this.channelsLoaded = 0;
   var start = this.lastDay.getTime()/1000;
   var end = start +(24*60*60);
   this.timelineend = new Date(this.timelineend.getTime() + (1000 * 60 * 30));
   this.timelinestart = new Date(this.timelinestart.getTime() + (1000 * 60 * 30));

   this.loadedCallback = this.dayLoaded.bind(this);
   for(var i = 0;i < this.channels.length;i++) {
         this.channels[i].getSchedule(start,end,this.channelLoaded.bind(this),false);
   }
   console.log("loadNextDay");
}

GridEPG.prototype.dayLoaded = function(){
        var ch = (this.channels.indexOf(this.getOpenChannel()) >= 0) ? this.channels.indexOf(this.getOpenChannel()) : 0;
		this.populatePrograms();
		this.channels[ch].setFocus();
		setLoading(false);
}



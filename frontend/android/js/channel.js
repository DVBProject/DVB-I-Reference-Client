function Channel( init_obj, element_id ){
	this.center = 1; 
	this.open = false;
	this.element_id = element_id;
	this.init(init_obj, element_id);
    this.selected = false;
}

Channel.prototype.getGenre = function(genre) {
    if(typeof genre === 'string' && genre.substring(0,  "urn:dvb:metadata:cs:ContentSubject:2019:".length) == "urn:dvb:metadata:cs:ContentSubject:2019:") {
        var genre = genre.substring(genre.lastIndexOf(":")+1);
        if(genre == "1") {
            return "Movie/Drama";
        }
        else if(genre == "2") {
            return "News/Current affairs";
        }
        else if(genre == "3") {
            return "Show/Game show";
        }
        else if(genre == "4") {
            return "Sports";
        }
        else if(genre == "5") {
            return "Children's/Youth programmes";
        }
        else if(genre == "6") {
            return "Music/Ballet/Dance";
        }
        else if(genre == "7") {
            return "Arts/Culture";
        }
        else if(genre == "8") {
            return "Social/Political issues/Economics";
        }
        else if(genre == "9") {
            return "Education/Science/Factual topics";
        }
        else if(genre == "10") {
            return "Leisure hobbies";
        }
        else if(genre == "11") {
            return "Special characteristics";
        }
        else if(genre == "12") {
            return "Adult";
        }


    }
    return null; 
}


Channel.prototype.getNowNext = function() {
    var self = this;
    if(self.contetGuideServiceRef) {
        var scheduleURI = "../../backend/schedule.php"; //TODO get the schedule url from the service list
         $.get( scheduleURI+"?sid="+self.contetGuideServiceRef+"&now_next=true", function( data ) { //TODO use ContentGuideServiceRef from the service
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/xml");
            var events = doc.getElementsByTagName("ScheduleEvent");
            var programs = doc.getElementsByTagName("ProgramInformation");
            var now_next = {};
            var boxes = [];
            for(var i=0;i<events.length;i++) {
                var program = {};
                var programId = events[i].getElementsByTagName("Program")[0].getAttribute("crid");
                program.start = events[i].getElementsByTagName("PublishedStartTime")[0].childNodes[0].nodeValue.toUTCDate();
                program.end  = iso6801end(events[i].getElementsByTagName("PublishedDuration")[0].childNodes[0].nodeValue, program.start);
                for(var j=0;j<programs.length;j++) {
                    if(programs[j].getAttribute("programId") == programId) {
                        var descriprion = programs[j].getElementsByTagName("BasicDescription")[0];
                        program.title = descriprion.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
                        var relatedMaterial =  descriprion.getElementsByTagName("RelatedMaterial");
                        for(var k=0;k<relatedMaterial.length;k++) {
                            var howRelated = relatedMaterial[k].getElementsByTagName("HowRelated")[0].getAttribute("href");
                            if(howRelated == "urn:tva:metadata:cs:HowRelatedCS:2012:19") { //Program still image
                                program.img = relatedMaterial[k].getElementsByTagName("MediaUri")[0].childNodes[0].nodeValue;
                                break;
                            }
                        }
                        break;
                    }
                }
                now_next[i == 0 ? "now" : "next"] = program;

            }
            self.now_next = now_next;
            if(self.selected) {
                self.updateChannelInfo();
            }
   
       },"text");
    }
}


Channel.prototype.getSchedule = function(callback) {
    var self = this;
    self.programs = [];
    if(self.contetGuideServiceRef) {
        var scheduleURI = "../../backend/schedule.php"; //TODO get the schedule url from the service list
         $.get( scheduleURI+"?sids[]="+self.contetGuideServiceRef+"&start="+self.epg.start+"&end="+self.epg.end, function( data ) { //TODO use ContentGuideServiceRef from the service
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/xml");
            var events = doc.getElementsByTagName("ScheduleEvent");
            var programs = doc.getElementsByTagName("ProgramInformation");
            for(var i=0;i<events.length;i++) {
                var program = {};
                var programId = events[i].getElementsByTagName("Program")[0].getAttribute("crid");
                program.start = events[i].getElementsByTagName("PublishedStartTime")[0].childNodes[0].nodeValue.toUTCDate();
                program.end  = iso6801end(events[i].getElementsByTagName("PublishedDuration")[0].childNodes[0].nodeValue, program.start);
                program.prglen = (program.end.getTime() - program.start.getTime())/(1000*60);
                for(var j=0;j<programs.length;j++) {
                    if(programs[j].getAttribute("programId") == programId) {
                        var description = programs[j].getElementsByTagName("BasicDescription")[0];
                        program.title = description.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
                        var synopsis = description.getElementsByTagName("Synopsis")
                        if(synopsis.length > 0) {
                            program.desc = synopsis[0].childNodes[0].nodeValue;
                        }
                        var genre = description.getElementsByTagName("Genre")
                        if(genre.length > 0) {
                            var genreValue = self.getGenre(genre[0].getAttribute("href"));
                            if(genreValue != null) {
                                program.genre = genreValue;
                            }
                        }
                        var relatedMaterial =  description.getElementsByTagName("RelatedMaterial");
                        for(var k=0;k<relatedMaterial.length;k++) {
                            var howRelated = relatedMaterial[k].getElementsByTagName("HowRelated")[0].getAttribute("href");
                            if(howRelated == "urn:tva:metadata:cs:HowRelatedCS:2012:19") { //Program still image
                                program.mediaimage = relatedMaterial[k].getElementsByTagName("MediaUri")[0].childNodes[0].nodeValue;
                                break;
                            }
                        }
                        break;
                    }
                }
                var program = new Program(program,self);
		            program.bilingual = self.bilingual;
		            program.channelimage = self.image;
		            program.channel_streamurl = self.streamurl;
		            self.programs.push(program);
                }
                if(typeof(callback) == "function"){
                    callback.call();
                }
         },"text");
    }
}

Channel.prototype.init = function( init_obj, channel_index){
		var self = this;
		$.each( init_obj, function( f, field ){
			self[f] = field;
		});
        self.getNowNext();
        //self.getSchedule();
		self.element = document.getElementById("channel_"+channel_index);
		if(self.element == null){			
            var newTextbox = document.createElement('a');
            newTextbox.href="javascript:channelSelected('"+self.id+"')";
            if(self.image) {
                var span = document.createElement('span');
                span.classList.add("chicon");
                var img = document.createElement('img');
                img.setAttribute("src",self.image);
                span.appendChild(img);
                newTextbox.appendChild(span);
            }
            var span = document.createElement('span');
            span.classList.add("chnumber");
            span.appendChild(document.createTextNode( self.lcn));
            newTextbox.appendChild(span);
            span = document.createElement('span');
            span.classList.add("chname","text-truncate");
            span.appendChild(document.createTextNode( self.name));
            newTextbox.appendChild(span);
            var li = document.createElement('li');
            li.classList.add("list-group-item");
            li.id = "channel_"+channel_index;
            li.appendChild(newTextbox);
			self.element = li;
		}
    
}

Channel.prototype.unselected = function () {
    var self = this;
    self.selected = false;
    self.element.classList.remove("active");
}

Channel.prototype.channelSelected = function () {
    var self = this;
    self.element.classList.add("active");
    var player = videojs('my-video');
    player.src([{type: "application/dash+xml", src: self.dashUrl}]);
    player.ready(function() {
      player.play();
    });
    self.selected = true;

    self.updateChannelInfo();
}

Channel.prototype.updateChannelInfo = function () {
     console.log("updateChannelInfo");
     var self = this;
     var channelInfo = document.getElementById("channel_info");
     var info = "";
     if(self.image) {
        info = "<span class=\"menuitem_chicon\"><img src=\""+self.image+"\"></span>";
     }
     info += "<span class=\"menuitem_chnumber\">" + self.lcn +".</span><span class=\"menuitem_chname\">" + self.name +"</span>";
     if(self.now_next) {
        curTime = new Date();
        var now = self.now_next["now"];
        if(now) {
            if(curTime >= now.end) {
               //Current program ended,update now/next information before updating info
               self.getNowNext();
               return;
            }
            info += "<span class=\"menuitem_now\">Now: "+now.title+" ";
            info +=  Math.max(0, Math.round((now.end.getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining</span>";
        }
        var next= self.now_next["next"];
        if(next) {
            info += "<span class=\"menuitem_next\">Next: "+next.title+" ";
            info +=  next.start.create24HourTimeString()+" ";
            info += "Duration " + Math.max(0, Math.round((next.end.getTime() - next.start.getTime()) / 1000 / 60)) + " mins</span>";
        }
     }
     info += "<span class=\"menuitem_epg btn btn-outline-light btn-small mt-1 p-1\"><a href=\"javascript:showEpg('"+self.contetGuideServiceRef+"')\" class=\"text-white\">Open EPG</a></span>"
     channelInfo.innerHTML = info;
}

Channel.prototype.showEPG = function () {
    var self = this;
    var programList = null;
	if(self.epg_element == null){
        var element = document.createElement("div");
        element.addClass("col-4");
        var header = document.createElement("div");
        header.addClass("epg_chinfo align-items-center");
        if(self.image) {
            var logo = document.createElement("img");
            logo.setAttribute("src",self.image);
            logo.setAttribute("alt","channel icon");
            logo.addClass("chicon img-fluid d-block");
            header.appendChild(logo);
        }
        var number = document.createElement("span");
        number.addClass("chnumber mr-1 d-inline-block float-left");
        number.innerHTML = self.lcn;
        header.appendChild(number);
        var name = document.createElement("span");
        name.addClass("chname text-truncate d-inline-block");
        name.innerHTML = self.name;
        header.appendChild(name);
        element.appendChild(header);
        this.programList = document.createElement("ul");
        this.programList.addClass("list list-group-flush list-programs container-fluid");
        element.appendChild(this.programList);
        self.epg_element = element;
    }
    else {
        $(this.programList).empty();
    }
    if(!self.programs) {
        this.getSchedule(self.populateEPG.bind(self));
    }
    else {
        this.populateEPG();
    }
    return self.epg_element;
}


Channel.prototype.populateEPG = function (self) {
    var self = this;
    if(self.programs) {
        for(var i = 0;i<self.programs.length;i++) {
            this.programList.appendChild(self.programs[i].populate());
        }
    }
}

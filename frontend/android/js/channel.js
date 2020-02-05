function Channel( init_obj, element_id ){
	this.center = 1; 
	this.open = false;
	this.element_id = element_id;
	this.init(init_obj, element_id);
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
            var epg = {};
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
                epg[i == 0 ? "now" : "next"] = program;

            }
            self.epg = epg;
   
       },"text");
    }
}


Channel.prototype.init = function( init_obj, channel_index){
		var self = this;
		$.each( init_obj, function( f, field ){
			self[f] = field;
		});
        self.getNowNext();
		self.element = document.getElementById("channel_"+channel_index);
		if(self.element == null){			
            var newTextbox = document.createElement('a');
            newTextbox.href="javascript:channelSelected("+channel_index+")";
            var span = document.createElement('span');
            span.appendChild(document.createTextNode( self.majorChannel));
            newTextbox.appendChild(span);
            span = document.createElement('span');
            span.appendChild(document.createTextNode( self.name));
            newTextbox.appendChild(span);
            var li = document.createElement('li');
            li.classList.add("list-group-item");
            li.id = "channel_"+channel_index;
            li.appendChild(newTextbox);
			self.element = li;
		}

        if(!self.epg) {

        }
    
}

Channel.prototype.unselected = function () {
    var self = this;
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
    self.updateChannelInfo();
}

Channel.prototype.updateChannelInfo = function () {
     console.log("updateChannelInfo");
     var self = this;
     var channelInfo = document.getElementById("channel_info");
     var info = "<span>" + self.majorChannel +".</span>|<span>" + self.name +"</span>";
     if(self.epg) {
        curTime = new Date();
        var now = self.epg["now"];
        if(now) {
            info += "|<span>Now:"+now.title+" ";
            info +=  Math.max(0, Math.round((now.end.getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining</span>";
        }
        var next= self.epg["next"];
        if(next) {
            info += "|<span>Next:"+next.title+" ";
            info +=  next.start.create24HourTimeString()+" ";
            info += "Duration " + Math.max(0, Math.round((next.end.getTime() - next.start.getTime()) / 1000 / 60)) + " mins</span>";
        }
     }
     channelInfo.innerHTML = info;
}


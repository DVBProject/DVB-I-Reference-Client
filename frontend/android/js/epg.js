function EPG(channels){ 
    this.channels = channels;
    for(var i = 0 ;i<this.channels.length;i++) {
        this.channels[i].epg = this;
    }
    this.displayIndex = 0;
    var date = new Date();
    date.setHours(0,0,0,0);
    this.start = Math.round(date.getTime() / 1000);
    this.end = this.start+24*60*60;
}

EPG.prototype.populate = function (start,end) {
    var self = this;
    var count = self.channels.length;
    if(self.element == null){
		self.element = document.createElement("div");
        self.element.addClass("row");
    }
    else {
        $(self.element).empty();
    }
    var serviceIndex = self.displayIndex;
    for(var i = serviceIndex ;i<(serviceIndex+3);i++) {
        self.element.appendChild(self.channels[i].showEPG(start,end));
    }

    return self.element;
}

EPG.prototype.showChannel = function(service,start,end) {
    var serviceIndex = 0;
    for(var i = 0 ;i<this.channels.length;i++) {
        if(this.channels[i].getServiceRef() === service ) {
            serviceIndex = i;
            break;
        } 
    }
    this.displayIndex = Math.min(serviceIndex,(this.channels.length-3));
    return this.populate(start,end);
}

EPG.prototype.showNextChannel = function(start,end) {
    if(this.displayIndex < this.channels.length-3) {
        this.displayIndex++;
        this.populate();
    }
    return this.displayIndex < this.channels.length-3;
}

EPG.prototype.showPreviousChannel = function(start,end) {
    if(this.displayIndex >0) {
        this.displayIndex--;
        this.populate();
       
    }
    return this.displayIndex > 0;
}

EPG.prototype.showNextDay = function() {
     for(var i = 0 ;i<this.channels.length;i++) {
        this.channels[i].programs = null;
     }
     this.start = this.start + (24*60*60);
     this.end = this.start+24*60*60;
     this.populate(this.start, (this.start+24*60*60));
}

EPG.prototype.showPreviousDay = function() {
     for(var i = 0 ;i<this.channels.length;i++) {
        this.channels[i].programs = null;
     }
     this.start = this.start - (24*60*60);
     this.end = this.start+24*60*60;
     this.populate();
}


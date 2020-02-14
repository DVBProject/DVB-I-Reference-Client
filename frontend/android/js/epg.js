function EPG(channels){ 
    this.channels = channels;
}

EPG.prototype.populate = function (service) {
    var self = this;
    var count = self.channels.length;
    if(self.element == null){
		var element = document.createElement("div");
        element.addClass("row");
        for(var i = 0;i<count;i++) {
            element.appendChild(self.channels[i].populateEPG());
        }
        self.element = element;
    }
    return self.element;
}

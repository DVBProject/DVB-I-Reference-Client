function channelSelected(channelIndex) {
    var newChannel = channels[channelIndex];
    if(newChannel == selectedChannel) {
        console.log("Same channel!");
        return;
    }
    else if(!newChannel) {
        return;
    }

    if(selectedChannel) {
        selectedChannel.unselected();
    }
    newChannel.channelSelected();
    selectedChannel = newChannel;    

}

window.onload = function(){
    loadServicelist("../../backend/servicelists/example.xml");
}
var selectedChannel = null;
var channels = []

function loadServicelist(list) {
    $.get( list, function( data ) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(data,"text/xml");
        var services = doc.getElementsByTagName("Service");
        var lcnList = doc.getElementsByTagName("LCNTable")[0].getElementsByTagName("LCN");
        var items = [];
        var channelIndex = 0;
        for (var i = 0; i < services.length ;i++) {
            var chan = {}; 
            chan.code = i;
            chan.name = services[i].getElementsByTagName("ServiceName")[0].childNodes[0].nodeValue;
            chan.id = services[i].getElementsByTagName("UniqueIdentifier")[0].childNodes[0].nodeValue;
            var cgRefs =  services[i].getElementsByTagName("ContentGuideServiceRef");
            if(cgRefs && cgRefs.length > 0) {
                chan.contetGuideServiceRef = cgRefs[0].childNodes[0].nodeValue;
            }
            var serviceInstances = services[i].getElementsByTagName("ServiceInstance");
            var sourceTypes = [];
            for(var j = 0;j < serviceInstances.length;j++) {
                var sourceType =serviceInstances[j].getElementsByTagName("SourceType")[0].childNodes[0].nodeValue;
                if(sourceType == "urn:dvb:metadata:source:dvb-dash") {
                       sourceTypes.push("DVB-DASH");
                       chan.dashUrl = serviceInstances[j].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
                }
            }
            if(sourceTypes.length == 0) {
                continue;
            }
            var channelNumber = 0;
            for(var j = 0;j < lcnList.length;j++) {
                if(lcnList[j].getAttribute("serviceRef") == chan.id) {
                    chan.majorChannel = parseInt(lcnList[j].getAttribute("channelNumber"));
                    break;
                }                
            }
            chan.sourceTypes =sourceTypes.join('/');
            var channel = new Channel(chan,channelIndex++);
            channels.push(channel);
        }

		populate();
    },"text");
}

function populate() {
    var listElement = document.getElementById("channel_list");
    for(var i = 0;i < channels.length;i++) {
        var channel = channels[i];
        listElement.appendChild(channel.element);
    } 
    setTimeout(refresh, (60-new Date().getSeconds())*1000);       
}

function refresh() {
	    updateOpenChannel();	
        setTimeout(refresh, (60-new Date().getSeconds())*1000);
}

function updateOpenChannel() {
    if(selectedChannel) {
        selectedChannel.updateChannelInfo();
    }
}



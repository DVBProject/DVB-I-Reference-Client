function channelSelected(channelId) {
    var newChannel = null;
    for (var i = 0; i < channels.length; i++) {
        if(channels[i].id == channelId) {
            newChannel =channels[i];
            break;
        }
    }
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
    uiHideTimeout = setTimeout(hideUI, 5000);
    $(".video_wrapper").on("click touchstart",resetHideTimeout);
}
var selectedChannel = null;
var channels = [];
var uiHideTimeout = null;

function resetHideTimeout() {
    $(".player-ui").removeClass("hide");
    clearTimeout(uiHideTimeout);
    uiHideTimeout = setTimeout(hideUI, 5000);
}

function hideUI() {
    $(".player-ui").addClass("hide");
}

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
            var relatedMaterial = services[i].getElementsByTagName("RelatedMaterial");
            for(var j = 0;j < relatedMaterial.length;j++) {
                var howRelated = relatedMaterial[j].getElementsByTagName("tva:HowRelated")[0].getAttribute("href");
                if(howRelated == "urn:dvb:metadata:cs:HowRelatedCS:2019:1001.2") {
                    chan.image = relatedMaterial[j].getElementsByTagName("tva:MediaLocator")[0].getElementsByTagName("tva:MediaUri")[0].childNodes[0].nodeValue;
                }
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
                    chan.lcn = parseInt(lcnList[j].getAttribute("channelNumber"));
                    break;
                }                
            }
            chan.sourceTypes =sourceTypes.join('/');
            var channel = new Channel(chan,channelIndex++);
            channels.push(channel);
        }
        channels.sort(compareLCN);
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

function compareLCN(a, b) {
  if (a.lcn > b.lcn) return 1;
  if (b.lcn > a.lcn) return -1;

  return 0;
}



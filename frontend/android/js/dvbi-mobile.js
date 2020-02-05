function playDASH(url,channelId) {
    $(".active").removeClass("active"); 
    document.getElementById(channelId).classList.add("active");
    var player = videojs('my-video');
    player.src([{type: "application/dash+xml", src: url}]);
    player.ready(function() {
      player.play();
    });
}

window.onload = function(){
    loadServicelist("../../backend/servicelists/example.xml");
}

function loadServicelist(list) {
    $.get( list, function( data ) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(data,"text/xml");
        var services = doc.getElementsByTagName("Service");
        var lcnList = doc.getElementsByTagName("LCNTable")[0].getElementsByTagName("LCN");
        var items = [];
        for (var i = 0; i < services.length ;i++) {
            var chan = {}; 
            
            chan.items =  [
                {
                    "title": "Now Showing",
                    "description": "Now Showing",
                    "name": "now",
                    "app": 0
                }
            ];
            chan.code = i;
            chan.eval = "miniepg("+ i +");";
            chan.center_name = services[i].getElementsByTagName("ServiceName")[0].childNodes[0].nodeValue;
            chan.name = chan.center_name;
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
            items.push(chan);
        }

		populate(items);
    },"text");
}

function populate(items) {
    var listElement = document.getElementById("channel_list");
    for(var i = 0;i < items.length;i++) {
        var channel = items[i];
        var newTextbox = document.createElement('a');
        newTextbox.href="javascript:playDASH('"+channel.dashUrl+"','channel_"+i+"')";
        var span = document.createElement('span');
        span.appendChild(document.createTextNode( channel.majorChannel));
        newTextbox.appendChild(span);
        span = document.createElement('span');
        span.appendChild(document.createTextNode( channel.name));
        newTextbox.appendChild(span);
        var li = document.createElement('li');
        li.classList.add("list-group-item");
        li.id = "channel_"+i;
        li.appendChild(newTextbox);
        listElement.appendChild(li);
    }        
}


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
    $(".epg").hide();
    $(".menubar").hide();
    loadServicelist("../../backend/servicelist.php");
    uiHideTimeout = setTimeout(hideUI, 5000);
    $(".video_wrapper").on("click touchstart",resetHideTimeout);
}
var selectedChannel = null;
var channels = [];
var epg = null;
var uiHideTimeout = null;

function resetHideTimeout() {
    if( $(".player-ui").hasClass("hide") && $(".epg").hasClass("hide")) {
        $(".player-ui").removeClass("hide");
    }
    clearTimeout(uiHideTimeout);
    uiHideTimeout = setTimeout(hideUI, 5000);
}

function hideUI() {
    if(!($(".player-ui").hasClass("hide"))) {
        $(".player-ui").addClass("hide");
    }
}

function showEpg(service) {
    $(".epg").removeClass("hide");
    $(".player-ui").addClass("hide");
    $(".epg").show();
    $(".grid").append(epg.showChannel(service));
    var epgdate = new Date(epg.start*1000);
    $("#epg_date").text(epgdate.getDate()+"."+(epgdate.getMonth()+1)+".");
    if(epg.displayIndex == 0) {
         $("#previous_channel").addClass("end");
    }
    else if(epg.displayIndex >= (epg.channels.length-3)) {
        $("#next_channel").addClass("end");
    }
}

function closeEpg() {
    $(".epg").hide();
    $(".menubar").hide();
    if(! $(".epg").hasClass("hide") ) {
        $(".epg").addClass("hide");
    }
    $(".player-ui").removeClass("hide");
}

function showNext() {
    if(!epg.showNextChannel()) {
        if(!$("#next_channel").hasClass("end")) {
           $("#next_channel").addClass("end");
        }
    }
    else if($("#previous_channel").hasClass("end")) {
        $("#previous_channel").removeClass("end");
    }
}

function showPrevious() {
     if(!epg.showPreviousChannel()) {
        if(!$("#previous_channel").hasClass("end")) {
           $("#previous_channel").addClass("end");
        }
    }
    else if($("#next_channel").hasClass("end")) {
        $("#next_channel").removeClass("end");
    }
}

function nextDay() {
    epg.showNextDay();
    var epgdate = new Date(epg.start*1000);
    $("#epg_date").text(epgdate.getDate()+"."+(epgdate.getMonth()+1)+".");
}

function previousDay() {
    epg.showPreviousDay();
    var epgdate = new Date(epg.start*1000);
    $("#epg_date").text(epgdate.getDate()+"."+(epgdate.getMonth()+1)+".");
}

function closeProgramInfo() {
    $(".programinfo").addClass("hide");
    $(".grid").show();
}

function openProgramInfo(program) {
    console.log("openProgramInfo");
    program.populateProgramInfo();
    $(".grid").hide();
    $(".programinfo").removeClass("hide");
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
                var howRelated = relatedMaterial[j].getElementsByTagNameNS("urn:tva:metadata:2019","HowRelated")[0].getAttribute("href");
                if(howRelated == "urn:dvb:metadata:cs:HowRelatedCS:2019:1001.2") {
                    chan.image = relatedMaterial[j].getElementsByTagNameNS("urn:tva:metadata:2019","MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0].childNodes[0].nodeValue;
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
        epg = new EPG(channels);
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



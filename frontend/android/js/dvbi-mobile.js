function channelSelected(channelId) {
    var newChannel = null;
    for (var i = 0; i < channels.length; i++) {
        if(channels[i].id == channelId) {
            newChannel =channels[i];
            break;
        }
    }
    if(newChannel == selectedChannel) {
        return;
    }
    else if(!newChannel) {
        return;
    }

    if(selectedChannel) {
        selectedChannel.unselected();
    }
    closeEpg();
    player.attachSource(newChannel.dashUrl);
    newChannel.channelSelected();
    selectedChannel = newChannel;    

}

window.onload = function(){
    $(".epg").hide();
    $(".menubar").hide();
    var serviceList = getLocalStorage("servicelist");
    if(serviceList) {
        listSelected(serviceList);
    }
    else {
        $("#servicelist_registry").show();
        loadServicelistProviders(PROVIDER_LIST,true);
    }
    uiHideTimeout = setTimeout(hideUI, 5000);
    $(".video_wrapper").on("click touchstart",resetHideTimeout);
    var video = document.getElementById("video");
    player = dashjs.MediaPlayer().create();
    player.initialize(video);
    player.setAutoPlay(true);
    var ll_settings = getLocalStorage("ll_settings");
    if(ll_settings) {
        document.getElementById("lowLatencyEnabled").checked = ll_settings.lowLatencyEnabled;
        document.getElementById("liveDelay").value = parseFloat(ll_settings.liveDelay);
        document.getElementById("liveCatchUpMinDrift").value = parseFloat(ll_settings.liveCatchUpMinDrift);
        document.getElementById("liveCatchUpPlaybackRate").value = parseFloat(ll_settings.liveCatchUpPlaybackRate);
        player.updateSettings({
            'streaming': {
                'lowLatencyEnabled': ll_settings.lowLatencyEnabled,
                'liveDelay': ll_settings.liveDelay,
                'liveCatchUpMinDrift': ll_settings.liveCatchUpMinDrift,
                'liveCatchUpPlaybackRate': ll_settings.liveCatchUpPlaybackRate
            }
        });
    }
}
var selectedChannel = null;
var channels = [];
var epg = null;
var uiHideTimeout = null;
var player;
var streamInfoUpdate = null;

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

function showEpg() {
    $(".epg").removeClass("hide");
    $(".player-ui").addClass("hide");
    $(".epg").show();
    $(".grid").show();
    $(".grid").append(epg.showChannel(selectedChannel));
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
    if(! $(".epg").hasClass("hide") ) {
        $(".epg").addClass("hide");
    }
    if(! $(".programinfo").hasClass("hide") ) {
        $(".programinfo").addClass("hide");
    }
    $(".player-ui").removeClass("hide");
}


function closeProgramInfo() {
    $(".programinfo").addClass("hide");
    $(".grid").show();
}

function openProgramInfo(program) {
    program.populateProgramInfo();
    $(".grid").hide();
    $(".programinfo").removeClass("hide");
}

function loadServicelist(list) {
    $.get( list, function( data ) {
        var services = parseServiceList(data,null);  
        var channelIndex = 0;
        for (var i = 0; i < services.length ;i++) {
            var channel = new Channel(services[i],channelIndex++);
            channels.push(channel);
        }
        channels.sort(compareLCN);
		populate();
        epg = new EPG(channels);
    },"text");
}

function selectServiceList() {
    $("#settings").hide();
    $("#servicelist_registry").show();
    $("#buttons").hide();
    loadServicelistProviders(PROVIDER_LIST);
}

function filterServiceLists() {
    var providers = $("#providers").val().split(",");
    var language = $("#language").val().split(",");
    var genre = $("#genre").val().split(",");
    var targetCountry = $("#country").val().split(",");
    var regulatorListFlag = $("#regulator").is(':checked');
    loadServicelistProviders(generateServiceListQuery(PROVIDER_LIST,providers,language,genre,targetCountry,regulatorListFlag));
}

function loadServicelistProviders(list,hideCloseButton) {
    if(hideCloseButton) {
        $("#close_service_providers").hide();
    }
    else {
        $("#close_service_providers").show();
    }
    $.get( list, function( data ) {
        var servicelists = parseServiceListProviders(data);
        var listElement = document.getElementById("servicelists");
        $(listElement).empty();
        var provider = document.createElement('h2');
        provider.appendChild(document.createTextNode("Select service list"));
        listElement.appendChild(provider);
        for (var i = 0; i < servicelists.length ;i++) {
            var provider = document.createElement('h4');
            provider.appendChild(document.createTextNode(servicelists[i]["name"]));
            listElement.appendChild(provider);
                for (var j = 0; j < servicelists[i]["servicelists"].length;j++) {
                    var container = document.createElement('div');
                    var provider = document.createElement('a');
                    provider.appendChild(document.createTextNode(servicelists[i]["servicelists"][j]["name"]));
                    provider.href="javascript:listSelected('"+servicelists[i]["servicelists"][j]["url"]+"')";
                    container.appendChild(provider);
                    listElement.appendChild(container);
                }
        }
    },"text");
}

function closeServiceLists() {
    $("#servicelist_registry").hide();
    $("#buttons").show();
}

function listSelected(list) {
    $("#servicelist_registry").hide();
    $("#buttons").show();
    $("#channel_list").empty();
    setLocalStorage("servicelist",list);
    channels = [];
    epg = null;
    loadServicelist(list);
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

function toggleStreamInfo() {
    if($("#streaminfo").is(":visible")){
        clearInterval(streamInfoUpdate);
        $("#streaminfo").hide();
    }
    else {
        $("#streaminfo").show();
        updateStreamInfo();
        streamInfoUpdate = setInterval(updateStreamInfo, 1000);
    }
}

function updateStreamInfo() {
    if(player) {
        try {
         var settings = player.getSettings();
         document.getElementById("live_settings").innerHTML = "Low latency mode:"+settings.streaming.lowLatencyEnabled + " Delay:"+ settings.streaming.liveDelay + 
                "<br/>Min drift:"+settings.streaming.liveCatchUpMinDrift + " Catchup Rate" + settings.streaming.liveCatchUpPlaybackRate;
         var audioTrack = player.getBitrateInfoListFor("audio")[player.getQualityFor("audio")];
         var videoTrack = player.getBitrateInfoListFor("video")[player.getQualityFor("video")];
         var bestAudio = player.getTopBitrateInfoFor("audio");
         var bestVideo = player.getTopBitrateInfoFor("video");
         if(audioTrack) {
          document.getElementById("audio_bitrate").innerHTML = audioTrack.bitrate / 1000 + "kbits (max:"+ bestAudio.bitrate / 1000+"kbits)";
         }
         if(videoTrack) {
            document.getElementById("video_bitrate").innerHTML = videoTrack.bitrate / 1000 + "kbits (max:"+ bestVideo.bitrate / 1000+"kbits)";
            document.getElementById("video_resolution").innerHTML = videoTrack.width+"x"+videoTrack.height +" (max:"+ bestVideo.width+"x"+bestVideo.height+")";
         }
         document.getElementById("live_latency").innerHTML = player.getCurrentLiveLatency()+"s";
        }
        catch(e) {
            document.getElementById("audio_bitrate").innerHTML = "error";
            document.getElementById("video_bitrate").innerHTML = "error";
            document.getElementById("video_resolution").innerHTML = "error";
            document.getElementById("live_latency").innerHTML = "";
        }
    }
    else {
        document.getElementById("audio_bitrate").innerHTML = "unavailable";
        document.getElementById("video_bitrate").innerHTML = "unavailable";
        document.getElementById("video_resolution").innerHTML = "unavailable";
        document.getElementById("live_latency").innerHTML = "unavailable";
    }
}

function compareLCN(a, b) {
  if (a.lcn > b.lcn) return 1;
  if (b.lcn > a.lcn) return -1;

  return 0;
}


function showSettings() {
    $("#settings").show();
}

function hideSettings() {
    $("#settings").hide();
    saveLLParameters();
}

function updateLLSettings(element) {
    var id = element.id;
    if(element.id == "lowLatencyEnabled") {
         player.updateSettings({'streaming': { "lowLatencyEnabled": element.checked}});
    }
    else if(element.id == "liveDelay") {
         player.updateSettings({'streaming': { "liveDelay": parseFloat(element.value, 10)}});
    }
    else if(element.id == "liveCatchUpMinDrift") {
         player.updateSettings({'streaming': { "liveCatchUpMinDrift": parseFloat(element.value, 10)}});
    }
    else if(element.id == "liveCatchUpPlaybackRate") {
         player.updateSettings({'streaming': { "liveCatchUpPlaybackRate": parseFloat(element.value, 10)}});
    }
}

function saveLLParameters() {
    var lowLatencyEnabled =  document.getElementById("lowLatencyEnabled").checked;
    var targetLatency = parseFloat(document.getElementById("liveDelay").value, 10);
    var minDrift = parseFloat(document.getElementById("liveCatchUpMinDrift").value, 10);
    var catchupPlaybackRate = parseFloat(document.getElementById("liveCatchUpPlaybackRate").value, 10);
    setLocalStorage("ll_settings", {
            'lowLatencyEnabled': lowLatencyEnabled,
            'liveDelay': targetLatency,
            'liveCatchUpMinDrift': minDrift,
            'liveCatchUpPlaybackRate': catchupPlaybackRate
        });
}

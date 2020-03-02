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
    closeEpg();
    player.attachSource(newChannel.dashUrl);
    newChannel.channelSelected();
    selectedChannel = newChannel;    

}

window.onload = function(){
    $(".epg").hide();
    $(".menubar").hide();
    loadServicelist("../../backend/servicelist.php");
    uiHideTimeout = setTimeout(hideUI, 5000);
    $(".video_wrapper").on("click touchstart",resetHideTimeout);
    var video = document.getElementById("video");
    player = dashjs.MediaPlayer().create();
    player.initialize(video);
    player.setAutoPlay(true);
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

function showEpg(service) {
    $(".epg").removeClass("hide");
    $(".player-ui").addClass("hide");
    $(".epg").show();
    $(".grid").show();
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
    if(! $(".epg").hasClass("hide") ) {
        $(".epg").addClass("hide");
    }
    if(! $(".programinfo").hasClass("hide") ) {
        $(".programinfo").addClass("hide");
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

function showStreamInfo() {
    $("#streaminfo").show();
    updateStreamInfo();
    streamInfoUpdate = setInterval(updateStreamInfo, 1000);
}

function hideStreamInfo() {
    clearInterval(streamInfoUpdate);
    $("#streaminfo").hide();
}

function updateStreamInfo() {
    if(player) {
        try {
         var audioTrack = player.getBitrateInfoListFor("audio")[player.getQualityFor("audio")];
         var videoTrack = player.getBitrateInfoListFor("video")[player.getQualityFor("video")];
         var bestAudio = player.getTopBitrateInfoFor("audio");
         var bestVideo = player.getTopBitrateInfoFor("video");;
         if(audioTrack) {
          document.getElementById("audio_bitrate").innerHTML = audioTrack.bitrate / 1000 + "kbits (max:"+ bestAudio.bitrate / 1000+"kbits)";
         }
         if(videoTrack) {
            document.getElementById("video_bitrate").innerHTML = videoTrack.bitrate / 1000 + "kbits (max:"+ bestVideo.bitrate / 1000+"kbits)";
            document.getElementById("video_resolution").innerHTML = videoTrack.width+"x"+videoTrack.height +" (max:"+ bestVideo.width+"x"+bestVideo.height+")";
         }
        }
        catch(e) {
            document.getElementById("audio_bitrate").innerHTML = "error";
            document.getElementById("video_bitrate").innerHTML = "error";
            document.getElementById("video_resolution").innerHTML = "error";
        }
    }
    else {
        document.getElementById("audio_bitrate").innerHTML = "unavailable";
        document.getElementById("video_bitrate").innerHTML = "unavailable";
        document.getElementById("video_resolution").innerHTML = "unavailable";
    }
}

function compareLCN(a, b) {
  if (a.lcn > b.lcn) return 1;
  if (b.lcn > a.lcn) return -1;

  return 0;
}



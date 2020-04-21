var selectedChannel = null;
var channels = [];
var epg = null;
var uiHideTimeout = null;
var player;
var streamInfoUpdate = null;
var minimumAge = 0;
var programChangeTimer = null;
var trackSelection = null;
var i18n = null;
var DEFAULT_LANGUAGE = "en";

function channelSelected(channelId) {
    $("#notification").hide();
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
    closeEpg();
    if(selectedChannel) {
        selectedChannel.unselected();
    }
    $("#tracklist").empty();
    $("#tracklist").hide();
    $("#subtitle").hide();
    $("#audio").hide();
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
    video.addEventListener('play', (event) => {
       var subtitles = player.getTracksFor("fragmentedText");
       if(subtitles && subtitles.length > 0) {
          $("#subtitle").show();
       }
       var audio = player.getTracksFor("audio");
       if(audio && audio.length > 1) {
          $("#audio").show();
       }
    });
    
    player = dashjs.MediaPlayer().create();
    player.initialize(video);
    player.setAutoPlay(true);
    player.attachTTMLRenderingDiv( document.getElementById("subtitles"));
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
    var parental_settings = getLocalStorage("parental_settings");
    if(parental_settings) {
        minimumAge = parseFloat(parental_settings.minimumAge);
        document.getElementById("parentalControl").value = minimumAge;
    }
    var language_settings = getLocalStorage("language_settings");
    if(language_settings) {
        document.getElementById("audio_language").value = language_settings.audio_language;
        document.getElementById("subtitle_language").value = language_settings.subtitle_language;
        document.getElementById("ui_language").value = language_settings.ui_language;
        player.setTextDefaultLanguage(language_settings.subtitle_language);
        i18n = new I18n();
        if(!i18n.loadLanguage(language_settings.ui_language,updateUILanguage)) {
            i18n.loadLanguage(DEFAULT_LANGUAGE,updateUILanguage);
        }
    }
    else {
       i18n.loadLanguage(DEFAULT_LANGUAGE,updateUILanguage);
    }
    var languages = i18n.getSupportedLanguages();
    var select = document.getElementById("ui_language");
    for (var i = 0; i < languages.length ;i++) {
        var option = document.createElement('option');
        option.value = languages[i].lang;
        option.appendChild(document.createTextNode(languages[i].name));
        if(i18n.getCurrentLanguage() == languages[i].lang) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

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


function toggleSettings() {
    if($("#settings").is(":visible")){
        $("#settings").hide();
        saveLLParameters();
    }
    else {
        $("#settings").show();
    }
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

function updateParental() {
    minimumAge = parseFloat(document.getElementById("parentalControl").value, 10);
    setLocalStorage("parental_settings", { "minimumAge":minimumAge});
    if(selectedChannel) {
        selectedChannel.parentalRatingChanged();
    }
}

function showSubtitles() {
    if(trackSelection == "subtitle" && $("#tracklist").is(":visible")){
        $("#tracklist").empty();
        $("#tracklist").hide();
        trackSelection = null;
        return;
    }
    var list = document.getElementById("tracklist");
    var current = null;
    if(player.isTextEnabled()) {
        current = player.getCurrentTrackFor("fragmentedText");
    }
    $(list).empty();
    $(list).show();
    var header = document.createElement('h4');
    header.appendChild(document.createTextNode("Subtitles"));
    list.appendChild(header);
    var subtitles = player.getTracksFor("fragmentedText");
    for(var i = 0;i < subtitles.length;i++) {
        var container = document.createElement('div');
        container.classList.add("row");
        if(subtitles[i] == current) {
            container.classList.add("selected_track");
        }
        var track = document.createElement('a');
        track.classList.add("col-5","d-inline-block");
        track.appendChild(document.createTextNode(subtitles[i].lang +" ("+ subtitles[i].roles.join(",")+")"));
        track.href="javascript:selectSubtitle("+i+")";
        container.appendChild(track);
        list.appendChild(container);
   }
   var container = document.createElement('div');
   container.classList.add("row");
    if(null == current) {
            container.classList.add("selected_track");
   }
   var track = document.createElement('a');
   track.classList.add("col-5","d-inline-block");
   track.appendChild(document.createTextNode("Off"));
   track.href="javascript:selectSubtitle(-1)";
   container.appendChild(track);
   list.appendChild(container);
   trackSelection = "subtitle";
}

function selectSubtitle(track) {
    player.setTextTrack(track);
    $("#tracklist").empty();
    $("#tracklist").hide();
}

function showAudio() {
    if(trackSelection == "audio" && $("#tracklist").is(":visible")){
        $("#tracklist").empty();
        $("#tracklist").hide();
        trackSelection = null;
        return;
    }
    var list = document.getElementById("tracklist");
    var current = player.getCurrentTrackFor("audio");
    $(list).empty();
    $(list).show();
    var header = document.createElement('h4');
    header.appendChild(document.createTextNode("Audio tracks"));
    list.appendChild(header);
    var audio = player.getTracksFor("audio");
    for(var i = 0;i < audio.length;i++) {
        var container = document.createElement('div');
        container.classList.add("row");
        if(audio[i] == current) {
            container.classList.add("selected_track");
        }
        var track = document.createElement('a');
        track.classList.add("col-5","d-inline-block");
        track.appendChild(document.createTextNode(audio[i].lang +" ("+ audio[i].roles.join(",")+")"));
        track.href="javascript:selectAudio("+i+")";
        container.appendChild(track);
        list.appendChild(container);
   }
   trackSelection = "audio";
}

function selectAudio(track) {
    var audio = player.getTracksFor("audio");
    player.setCurrentTrack(audio[track]);
    $("#tracklist").empty();
    $("#tracklist").hide();
}

function updateLanguage() {
    var subtitleLanguage = document.getElementById("subtitle_language").value;
    var audioLanguage = document.getElementById("audio_language").value;
    var uiLanguage = document.getElementById("ui_language").value;
    if(uiLanguage != i18n.getCurrentLanguage()) {
       i18n.loadLanguage(uiLanguage, updateUILanguage);
    }
    setLocalStorage("language_settings", { "subtitle_language":subtitleLanguage,"audio_language":audioLanguage,"ui_language":uiLanguage});
    player.setTextDefaultLanguage(subtitleLanguage);    
}

function updateUILanguage() {
    for(var i = 0;i < i18n.texts.length;i++) {
        var elements = document.getElementsByClassName(i18n.texts[i]);
        for(var j = 0;j<elements.length;j++) {
          elements[j].innerHTML = i18n.getString(i18n.texts[i]);
        }
    }
}

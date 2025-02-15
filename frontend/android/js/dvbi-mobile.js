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
var parentalEnabled = false;
var parentalPin = null;
var pinSuccessCallback = null;
var pinFailureCallback = null;
var serviceList = null;
var language_settings = null;
var modalClosedCallback = null;

//TODO use MSE-EME to determine actual DRM support, although
//support also depends on the audio and video codecs.
//For now, use hardcoded widevine for android client
var supportedDrmSystems = ["edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"];

function channelSelected(channelId) {
  $("#notification").hide();
  var newChannel = null;
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].id == channelId) {
      newChannel = channels[i];
      break;
    }
  }
  if (!newChannel) {
    return;
  }
  if (newChannel.serviceInstances.length == 0) {
    $("#notification").text("Service not supported");
    $("#notification").show();
    setTimeout(function () {
      $("#notification").hide();
    }, 5000);
    return;
  }
  closeEpg();
  if (selectedChannel) {
    selectedChannel.unselected();
  }
  $("#tracklist").empty();
  $("#tracklist").hide();
  $("#subtitle").hide();
  $("#audio").hide();
  $("#pause").hide();
  $("#play").hide();
  newChannel.channelSelected();
  selectedChannel = newChannel;
}

window.onload = function () {
  try {
    if (typeof android_interface != "undefined") {
      $("#testmsg").append("available<br/>");
      window.nip = {};
      window.nip.serviceDiscovered = function (data) {
        console.log(
          "Service  discovered:",
          data.service_name,
          data.dvbi_sep,
          data.dvbi_sl,
          data.orb_pos_A,
          data.orb_pos_B,
          data.orb_pos_C,
          data.orb_pos_D
        );
        $("#testmsg").append(
          "NIP Service  discovered: instance: " +
            data.service_name +
            " " +
            (data.dvbi_sep ? "SEP:" + data.dvbi_sep : "") +
            (data.dvbi_sl ? "SL:" + data.dvbi_sl : "") +
            "<br/>"
        );
      };
      android_interface.startNIPDiscovery();
    }
  } catch (e) {
    $("#testmsg").append("not found<br/>");
    console.log(e);
  }
  var i;
  $(".epg").hide();
  $(".menubar").hide();
  language_settings = getLocalStorage("language_settings");
  i18n = new I18n();
  if (language_settings) {
    document.getElementById("audio_language").value = language_settings.audio_language;
    document.getElementById("subtitle_language").value = language_settings.subtitle_language;
    document.getElementById("ui_language").value = language_settings.ui_language;
    document.getElementById("accessible_audio").checked = language_settings.accessible_audio;
    if (!i18n.loadLanguage(language_settings.ui_language, updateUILanguage)) {
      i18n.loadLanguage(DEFAULT_LANGUAGE, updateUILanguage);
    }
  } else {
    language_settings = {};
    language_settings.ui_language = DEFAULT_LANGUAGE;
    i18n.loadLanguage(DEFAULT_LANGUAGE, updateUILanguage);
  }
  var paramList = getUrlParameter("servicelist");
  var serviceList = getLocalStorage("servicelist");
  if (paramList) {
    paramList = decodeURIComponent(paramList);
    showModalDialog(
      "<img src='images/icons-128.png'/><br/>" +
        "Welcome to the DVB Project's DVB-I reference application.<br/>" +
        "You are using " +
        paramList +
        "<br/>" +
        "You can select another service list from the settings.",
      function () {
        listSelected(paramList);
      }
    );
  } else if (serviceList) {
    listSelected(serviceList, true);
  } else {
    showModalDialog(
      "<img src='images/icons-128.png'/><br/>" +
        "Welcome to the DVB Project's DVB-I reference application.<br/>" +
        "You have no service list selected.<br/>" +
        "After clicking ok, please select a service list from the list",
      function () {
        $("#settings").show();
        showSettings("servicelist_registry");
        loadServicelistProviders(PROVIDER_LIST, true);
        loadNIPProviders(true);
      }
    );
  }
  uiHideTimeout = setTimeout(hideUI, 5000);
  $(".video_wrapper").on("click touchstart", resetHideTimeout);
  var video = document.getElementById("video");
  video.addEventListener("play", (event) => {
    var subtitles = player.getTracksFor("text");
    if (subtitles && subtitles.length > 0) {
      $("#subtitle").show();
    }
    var audio = player.getTracksFor("audio");
    if (audio && audio.length > 1) {
      $("#audio").show();
    }
    //      $("#pause a").text("Pause");
    $("#pause").show();
    $("#play").hide();
  });

  player = dashjs.MediaPlayer().create();
  player.initialize(video);
  player.setAutoPlay(true);
  player.on("error", function (e) {
    console.log(e);
    $("#notification").show();
    if (e.error && e.error.message) {
      var errMessage = "Error playing stream ";
      if (e.error.data && e.error.data.response) {
        errMessage += "(" + e.error.data.response.status;
        if (e.error.data.response.statusText.length > 0) errMessage += ":" + e.error.data.response.statusText;
        errMessage += ") ";
      }
      errMessage += e.error.message;
      $("#notification").text(errMessage);
    } else {
      $("#notification").text("Error playing stream!");
    }
  });
  player.attachTTMLRenderingDiv(document.getElementById("subtitles"));
  var ll_settings = getLocalStorage("ll_settings");
  if (ll_settings) {
    document.getElementById("lowLatencyEnabled").checked = ll_settings.lowLatencyEnabled;
    document.getElementById("liveDelay").value = parseFloat(ll_settings.liveDelay);
    document.getElementById("liveCatchUpMinDrift").value = parseFloat(ll_settings.liveCatchUpMinDrift);
    document.getElementById("liveCatchUpPlaybackRate").value = parseFloat(ll_settings.liveCatchUpPlaybackRate);
    player.updateSettings({
      streaming: {
        lowLatencyEnabled: ll_settings.lowLatencyEnabled,
        liveDelay: ll_settings.liveDelay,
        liveCatchUpMinDrift: ll_settings.liveCatchUpMinDrift,
        liveCatchUpPlaybackRate: ll_settings.liveCatchUpPlaybackRate,
      },
    });
  }
  var parental_settings = getLocalStorage("parental_settings");
  if (parental_settings) {
    parentalEnabled = parental_settings.parentalEnabled || false;
    minimumAge = parseFloat(parental_settings.minimumAge);
    parentalPin = parental_settings.parentalPin;
    document.getElementById("parentalControl").value = minimumAge;
  }
  video.addEventListener("loadedmetadata", function () {
    if (language_settings.audio_language) {
      var audio = player.getTracksFor("audio");
      var track = null;
      for (i = 0; i < audio.length; i++) {
        if (audio[i].lang == language_settings.audio_language) {
          if (language_settings.accessible_audio && audio[i].roles.includes("supplementary")) {
            player.setCurrentTrack(audio[i]);
            track = null;
            break;
          }
          if (track == null) {
            track = audio[i];
          }
        }
      }
      if (track) {
        player.setCurrentTrack(track);
      }
    }
    if (language_settings.subtitle_language) {
      var subtitles = player.getTracksFor("text");
      for (i = 0; i < subtitles.length; i++) {
        if (subtitles[i].lang == language_settings.subtitle_language) {
          player.setTextTrack(subtitles[i]);
          break;
        }
      }
    }
  });
  var languages = i18n.getSupportedLanguages();
  var select = document.getElementById("ui_language");
  for (i = 0; i < languages.length; i++) {
    var option = document.createElement("option");
    option.value = languages[i].lang;
    option.appendChild(document.createTextNode(languages[i].name));
    if (i18n.getCurrentLanguage() == languages[i].lang) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  $("#slpostcode").on("change", function (e) {
    var val = $("#slpostcode").val();
    $("#postcode_query").text(val ? "'?postcode=" + val + "'" : "");
  });
};

function resetHideTimeout() {
  if ($(".player-ui").hasClass("hide") && $(".epg").hasClass("hide")) {
    $(".player-ui").removeClass("hide");
  }
  clearTimeout(uiHideTimeout);
  uiHideTimeout = setTimeout(hideUI, 5000);
}

function hideUI() {
  if (!$(".player-ui").hasClass("hide")) {
    $(".player-ui").addClass("hide");
  }
}

function showEpg() {
  $(".epg").removeClass("hide");
  $(".player-ui").addClass("hide");
  $(".epg").show();
  $(".grid").show();
  $(".epgchannels").remove();
  epg.open = true;
  $(".grid").append(epg.showChannel(selectedChannel));
  var epgdate = new Date(epg.start * 1000);
  $("#epg_date").text(epgdate.getDate() + "." + (epgdate.getMonth() + 1) + ".");
  if (epg.displayIndex == 0) {
    $("#previous_channel").addClass("end");
  } else if (epg.displayIndex >= epg.channels.length - 3) {
    $("#next_channel").addClass("end");
  }
}

function closeEpg() {
  $(".epg").hide();
  epg.open = false;
  if (!$(".epg").hasClass("hide")) {
    $(".epg").addClass("hide");
  }
  if (!$(".programinfo").hasClass("hide")) {
    $(".programinfo").addClass("hide");
  }
  $(".player-ui").removeClass("hide");
}

function closeProgramInfo() {
  $(".programinfo").addClass("hide");
  if (epg.open) {
    $(".grid").show();
  } else {
    closeEpg();
  }
}

function openProgramInfo(program) {
  $(".epg").removeClass("hide");
  $(".epg").show();
  program.populateProgramInfo();
  $(".grid").hide();
  $(".programinfo").removeClass("hide");
}

function loadServicelist(list) {
  $.get(
    list,
    function (data) {
      serviceList = parseServiceList(data, null, supportedDrmSystems);
      if (serviceList.regions) {
        var selectable = 0;
        for (var i = 0; i < serviceList.regions.length; i++) {
          if (serviceList.regions[i].selectable) {
            selectable++;
          }
          if (selectable > 1) {
            selectRegion();
            return;
          }
        }
        serviceListSelected();
      } else {
        serviceListSelected();
      }
    },
    "text"
  ).fail(function () {
    $("#notification").text("Error loading service list. You can select a new service list from the settings.");
    $("#notification").show();
    setTimeout(function () {
      $("#notification").hide();
    }, 5000);
    return;
  });
}

function serviceListSelected() {
  $("#servicelist_registry").hide();
  $("#settings").hide();
  if (serviceList.image) {
    $("#list_logo").attr("src", serviceList.image);
  } else {
    $("#list_logo").attr("src", "images/logo_dvbi_sofia.png");
  }
  var channelIndex = 0;
  for (var i = 0; i < serviceList.services.length; i++) {
    var channel = new Channel();
    channel.init(serviceList.services[i], channelIndex++);
    channels.push(channel);
  }
  channels.sort(compareLCN);
  populate();
  epg = new EPG(channels);
  channelSelected(channels[0].id);
}

function selectRegion() {
  var region = getLocalStorage("region");
  if (region) {
    selectServiceListRegion(serviceList, region);
    serviceListSelected();
    return;
  }
  $("#settings").show();
  showSettings("region_selection");
  var listElement = document.getElementById("regions");
  $(listElement).empty();
  var provider = document.createElement("h2");
  provider.appendChild(document.createTextNode(i18n.getString("select_region")));
  listElement.appendChild(provider);
  for (var i = 0; i < serviceList.regions.length; i++) {
    var container = document.createElement("div");
    var provider3 = document.createElement("a");
    provider3.appendChild(document.createTextNode(serviceList.regions[i]["regionName"]));
    provider3.href = "javascript:regionSelected('" + serviceList.regions[i]["regionID"] + "')";
    container.appendChild(provider3);
    listElement.appendChild(container);
  }
  for (var j = 0; j < serviceList.lcnTables.length; j++) {
    var table = serviceList.lcnTables[j];
    if (table.defaultRegion == true) {
      var container2 = document.createElement("div");
      var provider2 = document.createElement("a");
      var label = i18n.getString("default_region");
      provider2.appendChild(document.createTextNode(label));
      provider2.href = "javascript:regionSelected('!" + label + "!')";
      container2.appendChild(provider2);
      listElement.appendChild(container2);
    }
  }
}

function filterRegions() {
  var listElement = document.getElementById("regions");
  $(listElement).empty();
  var provider = document.createElement("h2");
  provider.appendChild(document.createTextNode(i18n.getString("select_region")));
  listElement.appendChild(provider);
  var postCode = $("#postcode").val();
  if (!postCode) {
    for (var i = 0; i < serviceList.regions.length; i++) {
      var container1 = document.createElement("div");
      var provider1 = document.createElement("a");
      provider1.appendChild(document.createTextNode(serviceList.regions[i]["regionName"]));
      provider1.href = "javascript:regionSelected('" + serviceList.regions[i]["regionID"] + "')";
      container1.appendChild(provider1);
      listElement.appendChild(container1);
    }
  } else {
    var region = findRegionFromPostCode(serviceList, postCode);
    if (region) {
      var container = document.createElement("div");
      var provider2 = document.createElement("a");
      provider2.appendChild(document.createTextNode(region["regionName"]));
      provider2.href = "javascript:regionSelected('" + region["regionID"] + "')";
      container.appendChild(provider2);
      listElement.appendChild(container);
    } else {
      var provider3 = document.createElement("h3");
      provider3.appendChild(document.createTextNode("No region found!"));
      listElement.appendChild(provider3);
    }
  }
}

function regionSelected(regionId) {
  setLocalStorage("region", regionId);
  selectServiceListRegion(serviceList, regionId);
  serviceListSelected();
}

function selectServiceList() {
  showSettings("servicelist_registry");
  loadServicelistProviders(PROVIDER_LIST);
  try {
    loadNIPProviders();
  } catch (e) {
    console.log(e);
  }
}

function loadNIPProviders(hideCloseButton, filter) {
  if (typeof android_interface == "undefined") {
    return;
  }
  try {
    var nip = document.getElementById("nip");
    $(nip).empty();
    $(nip).append('<div class="text-white p-1 rounded"><h2>' + i18n.getString("select_nip") + "</h2></div>");
    var servicesString = android_interface.getServices();
    var services = JSON.parse(servicesString);

    var sls = [];
    var seps = [];
    if (!filter) {
      filter = {};
    }
    var positionList = ["A", "B", "C", "D"];
    for (var i = 0; i < services.length; i++) {
      var positions = [];
      for (var j = 0; j < positionList.length; j++) {
        if (services[i]["orb_pos_" + positionList[j]]) {
          positions.push(services[i]["orb_pos_" + positionList[j]]);
        }
      }
      if (services[i].dvbi_sep) {
        var container = document.createElement("div");
        var title = document.createElement("h4");
        title.appendChild(document.createTextNode("Instance name: " + services[i].service_name));
        container.appendChild(title);
        if (positions.length > 0) {
          var positionElement = document.createElement("div");
          positionElement.appendChild(document.createTextNode("Orbital position:" + positions.join(", ")));
          container.appendChild(positionElement);
        }
        var sep = document.createElement("div");
        container.appendChild(sep);
        sep.classList.add("text-white", "p-1", "rounded");
        loadServicelistProviders(
          generateServiceListQuery(
            services[i].dvbi_sep,
            filter.providers,
            filter.language,
            filter.genre,
            filter.targetCountry,
            filter.regulatorListFlag,
            filter.delivery
          ),
          hideCloseButton,
          sep
        );
        seps.push(container);
      }
      if (services[i].dvbi_sl) {
        var container = document.createElement("div");
        var title = document.createElement("h4");
        title.appendChild(document.createTextNode("Instance name:" + services[i].service_name));
        container.appendChild(title);
        var provider2 = document.createElement("a");
        provider2.appendChild(document.createTextNode(services[i].dvbi_sl));
        provider2.href = "javascript:listSelected('" + services[i].dvbi_sl + "')";
        container.appendChild(provider2);
        if (positions.length > 0) {
          var positionElement = document.createElement("div");
          positionElement.appendChild(document.createTextNode("Orbital position:" + positions.join(", ")));
          container.appendChild(positionElement);
        }
        sls.push(container);
      }
    }
    if (seps.length > 0) {
      var header = document.createElement("h3");
      header.appendChild(document.createTextNode("NIP service list providers"));
      nip.appendChild(header);
      for (var i = 0; i < seps.length; i++) {
        nip.appendChild(seps[i]);
      }
    }
    if (sls.length > 0) {
      header = document.createElement("h3");
      header.appendChild(document.createTextNode("NIP service lists"));
      nip.appendChild(header);
      for (var i = 0; i < sls.length; i++) {
        nip.appendChild(sls[i]);
      }
    }
  } catch (e) {
    $("#testmsg").append(e.message + "<br/>");
  }
}

function filterServiceLists() {
  var providers = $("#providers").val().split(",");
  var language = $("#language").val().split(",");
  var genre = $("#genre").val().split(",");
  var targetCountry = $("#country").val().split(",");
  var regulatorListFlag = $("#regulator").is(":checked");
  var delivery = $(".delivery:checked")
    .map(function (i, e) {
      return e.value;
    })
    .toArray();
  var inlineImages = $("#inlineImages").is(":checked");
  loadServicelistProviders(
    generateServiceListQuery(
      PROVIDER_LIST,
      providers,
      language,
      genre,
      targetCountry,
      regulatorListFlag,
      delivery,
      inlineImages
    )
  );
  loadNIPProviders(false, {
    providers: providers,
    language: language,
    genre: genre,
    targetCountry: targetCountry,
    regulatorListFlag: regulatorListFlag,
    delivery: delivery,
  });
}

function loadServicelistProviders(list, hideCloseButton, listElement) {
  if (hideCloseButton) {
    $("#close_service_providers").hide();
  } else {
    $("#close_service_providers").show();
  }
  $.get(
    list,
    function (data) {
      var providers = parseServiceListProviders(data);
      var servicelists = providers.providerList;
      if (!listElement) {
        listElement = document.getElementById("servicelists");
      }
      $(listElement).empty();
      if (providers.registryInfo) {
        var registry = document.createElement("h3");
        registry.appendChild(document.createTextNode(i18n.getString("registry_provider") + ": "));
        if (providers.registryInfo.icons) {
          for (var j = 0; j < providers.registryInfo["icons"].length; j++) {
            if (providers.registryInfo["icons"][j].mediaUri) {
              var icon = document.createElement("img");
              icon.className = "providerIcon";
              icon.src = providers.registryInfo["icons"][j].mediaUri;
              registry.appendChild(icon);
            } else if (providers.registryInfo["icons"][j].mediaData64) {
              var icon = document.createElement("img");
              icon.className = "providerIcon";
              icon.src =
                "data:" +
                providers.registryInfo["icons"][j].type +
                ";base64," +
                providers.registryInfo["icons"][j].mediaData64;
              registry.appendChild(icon);
            }
          }
        }
        registry.appendChild(document.createTextNode(providers.registryInfo["name"]));
        listElement.appendChild(registry);
      }

      for (var i = 0; i < servicelists.length; i++) {
        var provider3 = document.createElement("h4");
        if (servicelists[i]["icons"]) {
          for (var j = 0; j < servicelists[i]["icons"].length; j++) {
            if (servicelists[i]["icons"][j].mediaUri) {
              var icon = document.createElement("img");
              icon.className = "providerIcon";
              icon.src = servicelists[i]["icons"][j].mediaUri;
              provider3.appendChild(icon);
            } else if (servicelists[i]["icons"][j].mediaData64) {
              var icon = document.createElement("img");
              icon.className = "providerIcon";
              icon.src =
                "data:" + servicelists[i]["icons"][j].type + ";base64," + servicelists[i]["icons"][j].mediaData64;
              provider3.appendChild(icon);
            }
          }
          provider3.appendChild(document.createTextNode(servicelists[i]["name"]));
        }
        listElement.appendChild(provider3);
        for (var j = 0; j < servicelists[i]["servicelists"].length; j++) {
          var container = document.createElement("div");
          var provider2 = document.createElement("a");
          if (servicelists[i]["servicelists"][j].icons) {
            for (var k = 0; k < servicelists[i]["servicelists"][j].icons.length; k++) {
              var iconData = servicelists[i]["servicelists"][j].icons[k];
              if (iconData.mediaUri) {
                var icon = document.createElement("img");
                icon.className = "listIcon";
                icon.src = iconData.mediaUri;
                provider2.appendChild(icon);
              } else if (iconData.mediaData64) {
                var icon = document.createElement("img");
                icon.className = "listIcon";
                icon.src = "data:" + iconData.type + ";base64," + iconData.mediaData64;
                provider2.appendChild(icon);
              }
            }
          }
          provider2.appendChild(document.createTextNode(servicelists[i]["servicelists"][j]["name"]));
          provider2.href = "javascript:listSelected('" + servicelists[i]["servicelists"][j]["url"] + "')";
          container.appendChild(provider2);
          listElement.appendChild(container);
        }
      }
    },
    "text"
  );
}

function listSelected(list, keepRegion) {
  $("#servicelist_registry").hide();
  $("#settings").hide();
  $("#buttons").show();
  $("#channel_list").empty();
  if (!keepRegion) {
    getLocalStorage("region", true); //clear region selection
  }
  channels = [];
  epg = null;
  var postcode = $("#slpostcode").val();
  if (postcode && postcode.length > 0) {
    list += "?posctode=" + postcode;
  }
  setLocalStorage("servicelist", list);
  loadServicelist(list);
}

function populate() {
  var listElement = document.getElementById("channel_list");
  for (var i = 0; i < channels.length; i++) {
    var channel = channels[i];
    listElement.appendChild(channel.element);
  }
  setTimeout(refresh, (60 - new Date().getSeconds()) * 1000);
}

function refresh() {
  updateOpenChannel();
  setTimeout(refresh, (60 - new Date().getSeconds()) * 1000);
}

function updateOpenChannel() {
  if (selectedChannel) {
    selectedChannel.updateChannelInfo();
  }
}

function hideStreamInfo() {
  clearInterval(streamInfoUpdate);
  $("#streaminfo").hide();
}

function showStreamInfo() {
  $("#streaminfo").show();
  clearInterval(streamInfoUpdate);
  updateStreamInfo();
  streamInfoUpdate = setInterval(updateStreamInfo, 1000);
  toggleSettings();
}

function updateStreamInfo() {
  if (player) {
    try {
      document.getElementById("DASHjs_version").innerHTML = player.getVersion();
      var settings = player.getSettings();

      if (DASHjsVersion5(player)) {
        document.getElementById("live_settings").innerHTML =
          "Low latency mode:" +
          player.getLowLatencyModeEnabled() +
          " Delay:" +
          "INDEVv5" +
          "<br/>Min drift:" +
          "INDEVv5" +
          " Catchup Rate:" +
          "INDEVv5";

        var audioTrack = player.getCurrentRepresentationForType("audio");
        var highestAudio = 0,
          audioReps = player.getRepresentationsByType("audio");
        for (var i = 0; i < audioReps.length; i++) {
          if (audioReps[i].bitrateInKbit > highestAudio) highestAudio = audioReps[i].bitrateInKbit;
        }
        document.getElementById("audio_bitrate").innerHTML = audioTrack
          ? audioTrack.bitrateInKbit + "kbits (max:" + highestAudio + "kbits)"
          : "no-audio";

        var videoTrack = player.getCurrentRepresentationForType("video");
        var highestVideo = 0,
          highestRes = null,
          videoReps = player.getRepresentationsByType("video");
        for (var j = 0; j < videoReps.length; j++) {
          if (videoReps[j].bitrateInKbit > highestVideo) {
            highestVideo = videoReps[j].bitrateInKbit;
            highestRes = videoReps[j].width + "x" + videoReps[j].height;
          }
        }
        document.getElementById("video_bitrate").innerHTML = videoTrack
          ? videoTrack.bitrateInKbit + "kbits (max:" + highestVideo + "kbits)"
          : "no-video";
        document.getElementById("video_resolution").innerHTML =
          videoTrack.width + "x" + videoTrack.height + (highestRes ? " (max:" + highestRes + ")" : "");

        document.getElementById("live_latency").innerHTML = player.getCurrentLiveLatency() + "s";
      } else {
        document.getElementById("live_settings").innerHTML =
          "Low latency mode:" +
          settings.streaming.lowLatencyEnabled +
          " Delay:" +
          settings.streaming.liveDelay +
          "<br/>Min drift:" +
          settings.streaming.liveCatchUpMinDrift +
          " Catchup Rate:" +
          settings.streaming.liveCatchUpPlaybackRate;
        var audioTrack = player.getBitrateInfoListFor("audio")[player.getQualityFor("audio")];
        var videoTrack = player.getBitrateInfoListFor("video")[player.getQualityFor("video")];
        var bestAudio = player.getTopBitrateInfoFor("audio");
        var bestVideo = player.getTopBitrateInfoFor("video");
        if (audioTrack) {
          document.getElementById("audio_bitrate").innerHTML =
            audioTrack.bitrate / 1000 + "kbits (max:" + bestAudio.bitrate / 1000 + "kbits)";
        }
        if (videoTrack) {
          document.getElementById("video_bitrate").innerHTML =
            videoTrack.bitrate / 1000 + "kbits (max:" + bestVideo.bitrate / 1000 + "kbits)";
          document.getElementById("video_resolution").innerHTML =
            videoTrack.width + "x" + videoTrack.height + " (max:" + bestVideo.width + "x" + bestVideo.height + ")";
        }
        document.getElementById("live_latency").innerHTML = player.getCurrentLiveLatency() + "s";
      }
    } catch (e) {
      document.getElementById("audio_bitrate").innerHTML = "error";
      document.getElementById("video_bitrate").innerHTML = "error";
      document.getElementById("video_resolution").innerHTML = "error";
      document.getElementById("live_latency").innerHTML = "";
    }
  } else {
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
  if ($("#settings").is(":visible")) {
    $("#settings").hide();
    saveLLParameters();
  } else {
    $("#settings").show();
    showSettings("main_settings");
  }
}

function updateLLSettings(element) {
  var id = element.id;
  if (element.id == "lowLatencyEnabled") {
    player.updateSettings({
      streaming: { lowLatencyEnabled: element.checked },
    });
  } else if (element.id == "liveDelay") {
    player.updateSettings({
      streaming: { liveDelay: parseFloat(element.value, 10) },
    });
  } else if (element.id == "liveCatchUpMinDrift") {
    player.updateSettings({
      streaming: { liveCatchUpMinDrift: parseFloat(element.value, 10) },
    });
  } else if (element.id == "liveCatchUpPlaybackRate") {
    player.updateSettings({
      streaming: { liveCatchUpPlaybackRate: parseFloat(element.value, 10) },
    });
  }
}

function saveLLParameters() {
  var lowLatencyEnabled = document.getElementById("lowLatencyEnabled").checked;
  var targetLatency = parseFloat(document.getElementById("liveDelay").value, 10);
  var minDrift = parseFloat(document.getElementById("liveCatchUpMinDrift").value, 10);
  var catchupPlaybackRate = parseFloat(document.getElementById("liveCatchUpPlaybackRate").value, 10);
  setLocalStorage("ll_settings", {
    lowLatencyEnabled: lowLatencyEnabled,
    liveDelay: targetLatency,
    liveCatchUpMinDrift: minDrift,
    liveCatchUpPlaybackRate: catchupPlaybackRate,
  });
}

function updateParental() {
  parentalEnabled = document.getElementById("parentalEnabled").checked;
  minimumAge = parseFloat(document.getElementById("parentalControl").value, 10);
  setLocalStorage("parental_settings", {
    parentalEnabled: parentalEnabled,
    minimumAge: minimumAge,
    parentalPin: parentalPin,
  });
  if (selectedChannel) {
    selectedChannel.parentalRatingChanged();
  }
}

function showSubtitles() {
  if (trackSelection == "subtitle" && $("#tracklist").is(":visible")) {
    $("#tracklist").empty();
    $("#tracklist").hide();
    trackSelection = null;
    return;
  }
  var list = document.getElementById("tracklist");
  var current = null;
  if (player.isTextEnabled()) {
    current = player.getCurrentTrackFor("text");
  }
  $(list).empty();
  $(list).show();
  var header = document.createElement("h4");
  header.appendChild(document.createTextNode("Subtitles"));
  list.appendChild(header);
  var subtitles = player.getTracksFor("text");
  for (var i = 0; i < subtitles.length; i++) {
    var container = document.createElement("div");
    container.classList.add("row");
    if (subtitles[i].id == current.id) {
      container.classList.add("selected_track");
    }
    var track = document.createElement("a");
    track.classList.add("col-5", "d-inline-block");
    track.appendChild(document.createTextNode(subtitles[i].lang + " (" + subtitles[i].roles.join(",") + ")"));
    track.href = "javascript:selectSubtitle(" + i + ")";
    container.appendChild(track);
    list.appendChild(container);
  }
  var container2 = document.createElement("div");
  container2.classList.add("row");
  if (null == current) {
    container2.classList.add("selected_track");
  }
  var track2 = document.createElement("a");
  track2.classList.add("col-5", "d-inline-block");
  track2.appendChild(document.createTextNode("Off"));
  track2.href = "javascript:selectSubtitle(-1)";
  container2.appendChild(track2);
  list.appendChild(container2);
  trackSelection = "subtitle";
}

function selectSubtitle(track) {
  player.setTextTrack(track);
  $("#tracklist").empty();
  $("#tracklist").hide();
}

function showAudio() {
  if (trackSelection == "audio" && $("#tracklist").is(":visible")) {
    $("#tracklist").empty();
    $("#tracklist").hide();
    trackSelection = null;
    return;
  }
  var list = document.getElementById("tracklist");
  var current = player.getCurrentTrackFor("audio");
  $(list).empty();
  $(list).show();
  var header = document.createElement("h4");
  header.appendChild(document.createTextNode("Audio tracks"));
  list.appendChild(header);
  var audio = player.getTracksFor("audio");
  for (var i = 0; i < audio.length; i++) {
    var container = document.createElement("div");
    container.classList.add("row");
    if (audio[i] == current) {
      container.classList.add("selected_track");
    }
    var track = document.createElement("a");
    track.classList.add("col-5", "d-inline-block");
    track.appendChild(document.createTextNode(audio[i].lang + " (" + audio[i].roles.join(",") + ")"));
    track.href = "javascript:selectAudio(" + i + ")";
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
  language_settings.subtitle_language = document.getElementById("subtitle_language").value;
  language_settings.audio_language = document.getElementById("audio_language").value;
  language_settings.ui_language = document.getElementById("ui_language").value;
  language_settings.accessible_audio = document.getElementById("accessible_audio").checked;
  if (language_settings.ui_language != i18n.getCurrentLanguage()) {
    i18n.loadLanguage(language_settings.ui_language, updateUILanguage);
  }
  for (var i = 0; i < channels.length; i++) {
    channels[i].languageChanged();
  }
  setLocalStorage("language_settings", language_settings);
}

function updateUILanguage() {
  for (var i = 0; i < i18n.texts.length; i++) {
    var elements = document.getElementsByClassName(i18n.texts[i]);
    for (var j = 0; j < elements.length; j++) {
      elements[j].innerHTML = i18n.getString(i18n.texts[i]);
    }
  }
}

function showSettings(settingspage) {
  $(".settingspage").hide();
  $(document.getElementById(settingspage)).show();
}

function showParentalSettings() {
  checkParentalPIN(
    "Enter PIN to access parental settings",
    function () {
      showSettings("parental_settings");
    },
    function () {
      console.log("Incorrect PIN entered");
    }
  );
}

function checkParentalPIN(message, successCallback, failCallback) {
  if (!parentalEnabled || parentalPin == null) {
    if (typeof successCallback == "function") {
      successCallback.call();
    }
  } else {
    pinSuccessCallback = successCallback;
    pinFailureCallback = failCallback;
    $("#pin_message").text(message);
    $("#parentalpin").show();
  }
}

function updatePin() {
  var pin1 = $("#pin1").val();
  if (pin1.length < 4) {
    $("#pin_status").text("PIN too short");
    return;
  }
  var pin2 = $("#pin2").val();
  if (pin1 != pin2) {
    $("#pin_status").text("PINs do not match!");
  } else {
    $("#pin_status").text("PIN ok!");
    parentalPin = pin1;
    setLocalStorage("parental_settings", {
      parentalEnabled: parentalEnabled,
      minimumAge: minimumAge,
      parentalPin: parentalPin,
    });
  }
}

function pinEntered() {
  var pin = $("#pin").val();
  if (pin.length < 4) {
    return;
  }
  if (pin === parentalPin) {
    if (typeof pinSuccessCallback == "function") {
      pinSuccessCallback.call();
    }
  } else {
    if (typeof pinFailureCallback == "function") {
      pinFailureCallback.call();
    }
  }
  $("#pin").val("");
  $("#parentalpin").hide();
}

function parseXmlAit(data) {
  var list = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(data, "text/xml");
  var applications = doc.getElementsByTagNameNS("urn:dvb:mhp:2009", "Application");
  for (var i = 0; i < applications.length; i++) {
    var app = {};
    var appDescriptor = applications[i].getElementsByTagNameNS("urn:dvb:mhp:2009", "applicationDescriptor")[0];
    app.priority = appDescriptor.getElementsByTagNameNS("urn:dvb:mhp:2009", "priority")[0].childNodes[0].nodeValue;
    app.controlCode = appDescriptor.getElementsByTagNameNS(
      "urn:dvb:mhp:2009",
      "controlCode"
    )[0].childNodes[0].nodeValue;
    var appTransport = applications[i].getElementsByTagNameNS("urn:dvb:mhp:2009", "applicationTransport")[0];
    app.transportType = appTransport.getAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "type");
    app.urlbase = appTransport.getElementsByTagNameNS("urn:dvb:mhp:2009", "URLBase")[0].childNodes[0].nodeValue;
    app.location = applications[i].getElementsByTagNameNS(
      "urn:dvb:mhp:2009",
      "applicationLocation"
    )[0].childNodes[0].nodeValue;
    list.push(app);
  }
  return list;
}

function isDRMSystemSupported(drmSystemId) {
  for (var i = 0; i < supportedDrmSystems.length; i++) {
    if (drmSystemId == supportedDrmSystems[i]) {
      return true;
    }
  }
  return false;
}

function togglePause() {
  if (player.isPaused()) {
    player.play();
    //    $("#pause a").text(i18n.getString("pause_button"));
    $("#pause").show();
    $("#play").hide();
  } else {
    player.pause();
    //    $("#pause a").text("Play");
    //    $("#pause a").text(i18n.getString("play_button"));

    $("#pause").hide();
    $("#play").show();
  }
}

function showModalDialog(text, callBack) {
  modalClosedCallback = callBack;
  $("#modal_content").html(text);
  $("#modal").show();
}

function modalClosed() {
  $("#modal").hide();
  if (modalClosedCallback && typeof modalClosedCallback == "function") {
    modalClosedCallback.call();
    modalClosedCallback = null;
  }
}

function setpostcode(code) {
  $("#slpostcode").val(code);
  $("#postcode_query").text(code ? "'?postcode=" + code + "'" : "");
}

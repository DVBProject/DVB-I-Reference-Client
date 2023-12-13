var lang_json_array = [];
lang_json_array.sort();
var loc = null;

var VERTICAL_MENU = 0;
var HORIZONTAL_MENU = 1;
var BOXITEM = 2;
var TWENTY_FOUR_HOURS = 86400000;
var container = null;
var menus = [{}];
var prevs, prevm;
var refTime = null;
var tz = null;
var loc = null;
var execWhenPlaying = null;
var execWhenStop = null;
var menuOffset;
var analogClock;
var progressWidth = 0;
var progressOpenWidth = 0;
var minimumAge = 255;
var parentalEnabled = false;
var parentalPin = null;
var pin1 = "";
var pin2 = "";
var selectedService = null;
var playerType = "html5";

//Low latency settings
var llEnabled = false;
var liveDelay = 3;
var minimumDrift = 0.05;
var catchupRate = 0.5;
var showStreamInfo = false;
var streamInfoUpdater = null;
var languages = null;
var _epg_ = null;
var epgServiceList = null;
var epg_visible = false;

var lang = "en";

var miniepg = null;
var _menu_ = null;
var _application_ = null;
var i18n = new I18n();

//TODO parse supported DRM systems from XMLCapabilities, for now hardcoded Playready
var supportedDrmSystems = ["9a04f079-9840-4286-ab92-e65be0885f95"];

function showApplication() {
  try {
    var app = document.getElementById("appmgr").getOwnerApplication(document);
    _application_ = app;
    app.show();
    app.activate();
  } catch (e) {
    // ignore
  }
}

function onLoad() {
  menuOffset = $("#menu_0").css("top");
  menuOffset = menuOffset.substring(0, menuOffset.length - 2);

  registerKeys();
  registerKeyListener();

  init();
}

function init() {
  console.log("init called");

  initClock();

  showApplication();

  var date = new Date(curTime.getTime());
  if (curTime.getHours() >= 0 && curTime.getHours() < 4) {
    date = new Date(curTime.getTime() - TWENTY_FOUR_HOURS);
  }
  var datestr = date.getFullYear() + addZeroPrefix(date.getMonth() + 1) + addZeroPrefix(date.getDate());
  var days = 1;

  // Get the maximum width for the progress bar
  var progressframe = getStyleSheetPropertyValue(".progress_bar_frame", "width");
  progressWidth = progressframe.substring(0, progressframe.length - 2);
  var progressframeopen = getStyleSheetPropertyValue(".progress_bar_frame.open", "width");
  progressOpenWidth = progressframeopen.substring(0, progressframeopen.length - 2);
  var parental_settings = getLocalStorage("parental_settings");
  if (parental_settings && parental_settings.minimumAge) {
    minimumAge = parseInt(parental_settings.minimumAge);
  }
  if (parental_settings && parental_settings.parentalPin) {
    parentalPin = parental_settings.parentalPin;
  }
  if (parental_settings && parental_settings.parentalEnabled) {
    parentalEnabled = parental_settings.parentalEnabled;
  }

  var player_settings = getLocalStorage("player_settings");
  if (player_settings && player_settings.player) {
    playerType = player_settings.player;
  }
  var ll_settings = getLocalStorage("ll_settings");
  if (ll_settings) {
    llEnabled = ll_settings.lowLatencyEnabled;
    liveDelay = ll_settings.liveDelay;
    minimumDrift = ll_settings.liveCatchUpMinDrift;
    catchupRate = ll_settings.liveCatchUpPlaybackRate;
  }
  languages = getLocalStorage("languages");
  if (!languages) {
    languages = {};
    languages.ui_language = "en";
  }
  i18n.loadLanguage(languages.ui_language);
  var serviceList = getLocalStorage("servicelist");

  if (serviceList) {
    getServiceList(
      serviceList,
      function (data) {
        selectServiceList(data);
      },
      function () {
        console.log("Error in fetching service data");
      }
    );
  } else {
    loadServicelistProviders(PROVIDER_LIST, false);
  }
}

function loadServicelistProviders(url, cancelAllowed) {
  $.get(
    url,
    function (data) {
      var servicelists = parseServiceListProviders(data);
      var buttons = [];
      var urls = [];
      var serviceList = getLocalStorage("servicelist");
      var selected = null;
      for (var i = 0; i < servicelists.length; i++) {
        for (var j = 0; j < servicelists[i]["servicelists"].length; j++) {
          var servicelist = "";
          servicelist += servicelists[i]["servicelists"][j]["name"];
          servicelist += "(" + servicelists[i]["name"] + ")";
          buttons.push(servicelist);
          if (servicelists[i]["servicelists"][j]["url"] == serviceList) {
            selected = urls.length;
          }
          urls.push(servicelists[i]["servicelists"][j]["url"]);
        }
      }
      showDialog(
        "Select service provider",
        buttons,
        selected,
        selected,
        function (checked) {
          setLocalStorage("servicelist", urls[checked]);
          getLocalStorage("region", true); //New service list selected, clear region
          getServiceList(
            urls[checked],
            function (servicelist) {
              $("#dialog").html("");
              $("#dialog").removeClass("show");
              $("#dialog").addClass("hide");
              selectServiceList(servicelist);
            },
            function () {
              console.log("Error in fetching service data");
            }
          );
        },
        cancelAllowed
      );
    },
    "text"
  );
}
function selectServiceList(servicelistXML) {
  var currentChannel = null;
  var channelList = null;
  try {
    var vid = document.getElementById("broadcast");
    var config = vid.getChannelConfig();
    channelList = config.channelList;
    currentChannel = _application_.privateData.currentChannel;
  } catch (e) {}
  serviceList = parseServiceList(servicelistXML, channelList, supportedDrmSystems);
  epgServiceList = serviceList;
  if (serviceList.regions) {
    selectRegion(serviceList, currentChannel, channelList);
  } else {
    createMenu(serviceList, currentChannel, channelList);
  }
}

function selectRegion(serviceList, currentChannel, channelList) {
  var region = getLocalStorage("region");
  if (region) {
    selectServiceListRegion(serviceList, region);
    createMenu(serviceList, currentChannel, channelList);
    return;
  }
  var buttons = [];
  for (var i = 0; i < serviceList.regions.length; i++) {
    if (serviceList.regions[i].regionName) {
      buttons.push(serviceList.regions[i].regionName);
    }
  }
  for (var j = 0; j < serviceList.lcnTables.length; j++) {
    var table = serviceList.lcnTables[j];
    if (table.defaultRegion == true) {
      var label = i18n.getString("default_region");
      console.log("default_region", label);
      buttons.push(label);
    }
  }
  var selected = null;
  showDialog(
    "Select region",
    buttons,
    null,
    null,
    function (checked) {
      if (checked >= serviceList.regions.length) {
        getLocalStorage("region", true);
      } else {
        setLocalStorage("region", serviceList.regions[checked].regionID);
        selectServiceListRegion(serviceList, serviceList.regions[checked].regionID);
      }
      createMenu(serviceList, currentChannel, channelList);
      $("#dialog").html("");
      $("#dialog").removeClass("show");
      $("#dialog").addClass("hide");
    },
    false,
    null,
    i18n.getString("select_region")
  );
}

function createMenu(services, currentChannel, channelList) {
  var current_channel_obj = null;
  var listedChannels = [];

  $("#menu_0").empty();
  _menu_ = new Menu("menu_0");
  _menu_.center = 0;
  menuOffset = 0;
  if (services.image) {
    $("#list_logo").attr("src", services.image);
    $("#service_list_logo").attr("src", services.image);
  } else {
    $("#list_logo").attr("src", "CommonUI/logo_dvbi_sofia.png");
    $("#service_list_logo").attr("src", "CommonUI/logo_dvbi_sofia.png");
  }
  for (var i = 0; i < services.services.length; i++) {
    var chan = services.services[i];
    chan.items = [
      {
        title: "Now Showing",
        description: "Now Showing",
        name: "now",
        app: 0,
      },
    ];
    chan.eval = "miniepg(" + i + ");";
    var channel_obj = new Channel();
    channel_obj.init(chan, "menuitem" + i);
    for (var b = 0; b < channel_obj.boxes.length; b++) {
      channel_obj.boxes[b].description = "";
      break;
    }
    var serviceInstance = channel_obj.getServiceInstance();
    if (
      serviceInstance &&
      serviceInstance.dvbChannel != null &&
      currentChannel &&
      serviceInstance.dvbChannel.ccid == currentChannel.ccid
    ) {
      current_channel_obj = channel_obj;
    }

    for (var j = 0; j < channel_obj.serviceInstances.length; j++) {
      if (channel_obj.serviceInstances[j].dvbChannel) {
        listedChannels.push(channel_obj.serviceInstances[j].dvbChannel);
      }
    }
    _menu_.items.push(channel_obj);
  }
  if (channelList != null) {
    var number = 1000;
    for (var k = 0; k < channelList.length; k++) {
      var dvbChannel = channelList.item(k);
      var listed = false;
      for (var l = 0; l < listedChannels.length; l++) {
        if (listedChannels[l].ccid == dvbChannel.ccid) {
          listed = true;
          break;
        }
      }
      if (!listed) {
        var chan = {};
        chan.items = [
          {
            title: "Now Showing",
            description: "Now Showing",
            name: "now",
            app: 0,
          },
        ];
        chan.title = dvbChannel.name;
        chan.titles = [{ lang: "default", text: dvbChannel.name }];
        chan.unlisted = true;
        chan.serviceInstances = [];
        chan.serviceInstances.push({ dvbChannel: dvbChannel });
        chan.dvbChannel = dvbChannel;
        chan.lcn = number++;
        var channel_obj = new Channel();
        channel_obj.init(chan, "menuitem" + (k + services.services.length));
        for (var b = 0; b < channel_obj.boxes.length; b++) {
          channel_obj.boxes[b].description = "";
          break;
        }
        if (currentChannel && dvbChannel.ccid == currentChannel.ccid) {
          current_channel_obj = channel_obj;
        }
        _menu_.items.push(channel_obj);
      }
    }
  }
  _menu_.items.sort(compareLCN);
  if (current_channel_obj == null) {
    current_channel_obj = _menu_.items[0];
    _menu_.center = 0;
  } else {
    _menu_.center = _menu_.getChannelIndex(current_channel_obj);
  }
  currentChIndex = current_channel_obj.lcn;
  selectedService = current_channel_obj;
  _menu_.populate();
  showMenu();
  document.getElementById("info_num").innerHTML = current_channel_obj.lcn + ".";
  document.getElementById("info_name").innerHTML = getLocalizedText(
    current_channel_obj.titles,
    languages.ui_language
  ).replace("&", "&amp;");
  hideTimer = setTimeout(function () {
    hideMenu();
  }, 5000);
  var channelStr = getUrlParameter("ch");
  if (channelStr) {
    var menuItem = null;
    for (var i = 0; i < _menu_.items.length; i++) {
      if (_menu_.items[i].id == channelStr) {
        menuItem = _menu_.items[i];
        break;
      }
    }
    if (menuItem != null) {
      jumpToMenuItem(menuItem);
      keyEnter();
    }
  } else {
    checkParental();
  }
}

function updateProggressbars() {
  $.each(_menu_.items, function (i, channel) {
    var status_wrapper = channel.element.childNodes.getByClass("status_wrapper")[0];
    var pb_width = 0;
    if (channel.boxes[0].start && channel.boxes[0].end) {
      var start = channel.boxes[0].start;
      var end = channel.boxes[0].end;
      pb_width = Math.floor(
        (Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) /
          Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60))) *
          progressWidth
      );
    }

    // Update all closed channels progressbars
    var progress_bar_frame = status_wrapper.childNodes.getByClass("progress_bar_frame")[0];
    var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
    progress_bar.style.width = pb_width + "px";
  });
  console.log("All progresbars updated");
}

function getServiceList(list, succesCallback, errorCallback) {
  $.get(
    list,
    function (data) {
      succesCallback(data);
    },
    "text"
  );
}

function initClock() {
  curTime = new Date();
  refresh();
}

function updateOpenChannel() {
  var channel = _menu_.getOpenChannel();

  if (channel) {
    $.each(channel.boxes, function (b, box) {
      var timeremainingElems = box.element.getElementsByClassName("timeremaining");
      if (timeremainingElems.length > 0) {
        var timeremaining = timeremainingElems[0];
        timeremaining.innerHTML =
          Math.max(0, Math.round((box.end.getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining";
      }
    });

    var pb_width = 0;
    if (channel.boxes[0].start && channel.boxes[0].end) {
      var start = channel.boxes[0].start;
      var end = channel.boxes[0].end;
      pb_width = Math.floor(
        (Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) /
          Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60))) *
          progressOpenWidth
      );
      console.log("progressbar updated");
    }

    var progress_bar_frame = channel.boxes[0].element.childNodes
      .getByClass("boxitem_info")[0]
      .childNodes.getByClass("progress_bar_frame")[0];
    if (progress_bar_frame) {
      var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
      progress_bar.style.width = pb_width + "px";
    }
  }
}

function refresh() {
  curTime = new Date();

  if (curTime.getMinutes() != prevm) {
    prevm = curTime.getMinutes();
    if (_epg_) {
      _epg_.updateVerticalTimeLine();
    }

    displayTime();

    var hidden = document.hidden != undefined && document.hidden ? true : false;
    if (_menu_ && _menu_.items && !hidden) {
      for (var i = 0; i < _menu_.items.length; i++) {
        if (_menu_.items[i].epg && _menu_.items[i].epg.now && _menu_.items[i].epg.now.end) {
          if (curTime >= _menu_.items[i].epg.now.end) {
            // update miniepg
            _menu_.items[i].update();
          }
        }
      }

      // Update every channel progressbars every minute
      updateProggressbars();

      // Update the currently opened channel
      updateOpenChannel();
    }
  }
  setTimeout(refresh, 1000);
}

function registerKeyListener() {
  document.addEventListener("keydown", eventFunction, false);
}

function eventFunction(e) {
  if (onKey(e.keyCode)) {
    e.preventDefault();
  }
}

function disableKeyListener() {
  document.removeEventListener("keydown", eventFunction, false);
}

function displayTime() {
  document.getElementById("clock_time").innerHTML = curTime.create24HourTimeString();
  document.getElementById("epg_clock_time").innerHTML = curTime.create24HourTimeString();
}

function getTitle(obj, lang) {
  if (obj.texts) {
    for (var i = 0; i < obj.texts.length; i++) {
      if (obj.texts[i].lang == lang) {
        if (obj.texts[i].title) {
          return obj.texts[i].title;
        }
      }
    }
  } else {
    return obj.title || "";
  }
  return "";
}

function getStyleSheetPropertyValue(selectorText, propertyName) {
  // search backwards because the last match is more likely the right one
  for (var s = document.styleSheets.length - 1; s >= 0; s--) {
    var cssRules = document.styleSheets[s].cssRules || document.styleSheets[s].rules || []; // IE support
    for (var c = 0; c < cssRules.length; c++) {
      if (cssRules[c].selectorText === selectorText) return cssRules[c].style[propertyName];
    }
  }
  return null;
}

function initEPG() {
  initClock();
  var yesterday = new Date(curTime.getTime());
  var days = 3;
  for (var i = 0; i < epgServiceList.services.length; i++) {
    var cid = encodeURIComponent(epgServiceList.services[i].id);
    cids.push(cid);
  }

  setLoading(true);
  _epg_ = new GridEPG("epgwrapper", epgServiceList, 0, VISIBLE_ROWS, yesterday, curTime, days, epgLoaded);
  //});
}

function epgLoaded() {
  if (_epg_.channels.length > 0) {
    _epg_.populate(function () {
      document.getElementById("epgRows").addClass("notransition");
      document.getElementById("channels").addClass("notransition");
      CSSscrollDown(
        document.getElementById("epgRows"),
        _epg_.channels.indexOf(_epg_.getFirstVisibleChannel()) *
          (_epg_.channel_element_height + _epg_.channel_margin_bottom),
        ANIMATION_DURATION,
        null
      );
      CSSscrollDown(
        document.getElementById("channels"),
        _epg_.channels.indexOf(_epg_.getFirstVisibleChannel()) *
          (_epg_.channel_element_height + _epg_.channel_margin_bottom),
        ANIMATION_DURATION,
        null
      );
      setTimeout(function () {
        document.getElementById("epgRows").removeClass("notransition");
        document.getElementById("channels").removeClass("notransition");
      }, 10);
    });
    _epg_.setActiveChannel(getCurrentChannel().id);
  }
  setLoading(false);

  _epg_.element.removeClass("hide");
  if (typeof callback == "function") {
    callback();
  }
  _epg_.activeItem.setFocus();
  $("#epgwrapper").removeClass("hide");
  hideMenu();
  epg_visible = true;
}

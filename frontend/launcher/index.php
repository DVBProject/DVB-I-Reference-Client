<?php
    header( "Expires: Mon, 20 Dec 1998 01:00:00 GMT" );
    header( "Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT" );
    header( "Cache-Control: no-cache, must-revalidate" );
    header( "Pragma: no-cache" );
    date_default_timezone_set("Europe/Helsinki");

	header( "Content-Type: application/vnd.hbbtv.xhtml+xml;charset=utf-8" );
	echo "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";
	
?>
<!DOCTYPE html PUBLIC "-//HbbTV//1.1.1//EN" "http://www.hbbtv.org/dtd/HbbTV-1.1.1.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Launcher</title>
	<meta http-equiv="content-type" content="application/vnd.hbbtv.xhtml+xml; charset=utf-8" />
    <link rel="stylesheet" href="../CommonUI/commonui.css" />
    <link rel="stylesheet" href="navi.css"/>
	<link rel="stylesheet" href="../CommonUI/dialog.css"/>
    <link rel="stylesheet" href="chinfo.css"/>
    <script src="../../jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="menu.js"></script>
   	<script type="text/javascript" src="channel.js"></script>
   	<script type="text/javascript" src="box.js"></script>
	<script type="text/javascript" src="navigation.js"></script>
	<script type="text/javascript" src="../session.js"></script>
    <script type="text/javascript" src="../common.js"></script>
    <script type="text/javascript" src="../buttonbar.js"></script>
	<script type="text/javascript" src="../alertDialog.js"></script>
    <script type="text/javascript" src="videoplayer_basic.js"></script>
    <script type="text/javascript" src="videoplayer_html5.js"></script>

	<script type="text/javascript">

	</script>
	<script type="text/javascript" language="javascript">
	//<![CDATA[

    var selectedChNumber = "";
    var selectedChannel = "";
    var broadcastChannel = "";
    var chNumber = "";
   	// LANGUAGE
    var lang_json_array = [];
	lang_json_array.sort();
	var loc = null;
	var languageNames = {
        	"eng.json":"English",
	        "mandarin.json":"Mandarin"
	};

	var COOKIE_LANG_NAME = "locLangATLAS";
	var VERTICAL_MENU = 0;
	var HORIZONTAL_MENU = 1;
	var BOXITEM = 2;
	var TWENTY_FOUR_HOURS = 86400000;
	var server_name = "SofiaPVR(ipts)";
	var container = null;
	var menus = [{}]  ;
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
	var localizationLangFile = null;

    
	localizationLangFile = readCookie(COOKIE_LANG_NAME);
	if( !localizationLangFile || localizationLangFile == "") {
		localizationLangFile = "eng.json";  //"../eng.json"
	}

	var lang = "eng";
	if(localizationLangFile != "eng.json"){
		lang = "alt";
	}

	var miniepg = null;
	var _menu_ = null;
    var _application_ = null;

	function showApplication() {
	  try {
	    var app = document.getElementById('appmgr').getOwnerApplication(document);
         _application_ = app;
	    app.show();
	    app.activate();

	  } catch (e) {
           // ignore
	  }
	}
	
	function onLoad() {
        console.log("onload called");
		menuOffset = $("#menu_0").css("top");
		console.log("menuOffset" + menuOffset);
		menuOffset = menuOffset.substring(0, menuOffset.length-2);
		console.log("menuOffset" + menuOffset);
		
		registerKeys(1);
	    registerKeyListener();
	   
		init();
	}

	function init(){
	    console.log("init called");
        
        initClock();
        
        showApplication();

        var date = new Date(curTime.getTime());
        if(curTime.getHours() >= 0 && curTime.getHours() < 4){
            date = new Date(curTime.getTime()-TWENTY_FOUR_HOURS);
        }
        var datestr = date.getFullYear()+addZeroPrefix(date.getMonth()+1)+addZeroPrefix(date.getDate());
        var days = 1;
	
       // Get the maximum width for the progress bar
        var progressframe = getStyleSheetPropertyValue(".progress_bar_frame", "width");
        progressWidth = progressframe.substring(0, progressframe.length-2);
        var progressframeopen = getStyleSheetPropertyValue(".progress_bar_frame.open", "width");
        progressOpenWidth = progressframeopen.substring(0, progressframeopen.length-2);
        
        getServiceList("../../backend/servicelists/example.xml", function( epg ){
                createMenu(epg);
                
                if(chNumber){
                    currentChIndex = parseInt(chNumber);
                    broadcastChannel = _menu_.getChannelAtIndex(chNumber);
                }
                openCurrentChannel();
			if (window.location.search.indexOf("mode=open") != -1) {
				onKey(VK_UP);
			}
        }, function(){
            console.log("Error in fetching service data");
        });
  
	}
	
	function createMenu(data){
		_menu_ = new Menu("menu_0");
		_menu_.center = 0;

        try {
            var searchSelected;
            if(selectedChNumber.length > 0){
                searchSelected = true;
            }
            else if(selectedChannel.length > 0){
                searchSelected = true;
            }
            else if(broadcastChannel.length > 0){
                searchSelected = false;
            }
            var vid = document.getElementById('broadcast');
            var config = vid.getChannelConfig();
            var channelList = config.channelList;
            var currentChannel = _application_.privateData.currentChannel;
          
        } catch (e) {
            console.log("Getting data");

            showInfo(e.message);
        }        

        var parser = new DOMParser();
        var doc = parser.parseFromString(data,"text/xml");
        var services = doc.getElementsByTagName("Service");
        var lcnList = doc.getElementsByTagName("LCNTable")[0].getElementsByTagName("LCN");
        serviceList = [];
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
            var serviceInstances = services[i].getElementsByTagName("ServiceInstance");
            var sourceTypes = [];
            for(var j = 0;j < serviceInstances.length;j++) {
                var sourceType =serviceInstances[j].getElementsByTagName("SourceType")[0].childNodes[0].nodeValue;
                if(sourceType == "urn:dvb:metadata:source:dvb-dash") {
                       sourceTypes.push("DVB-DASH");
                       chan.dashUrl = serviceInstances[j].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
                }
                if(channelList && (sourceType == "urn:dvb:metadata:source:dvb-t" || 
                   sourceType == "urn:dvb:metadata:source:dvb-c" ||
                   sourceType == "urn:dvb:metadata:source:dvb-s" ) ) {
                    //Just search for the triplet in the channel list;
                    var triplet = serviceInstances[j].getElementsByTagName("DVBTriplet")[0];
                    
                    for(var k = 0;k<channelList.length;k++) {
                        var dvbChannel = channelList.item(k);
                        if(dvbChannel.sid == triplet.getAttribute("serviceId") &&
                           dvbChannel.onid == triplet.getAttribute("origNetId") &&
                           dvbChannel.tsid == triplet.getAttribute("tsId")) {
                             chan.dvbChannel = dvbChannel;
                             sourceTypes.push("DVB-"+ sourceType.charAt(sourceType.length-1).toUpperCase());
                             break;
                           }                            
                    }
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
            var channel_obj = new Channel(chan, "menuitem"+ i);
            for(var b = 0; b < channel_obj.boxes.length; b++){
				channel_obj.boxes[b].description = "";
				break;
			}
			_menu_.items.push(channel_obj);
        }

		_menu_.populate();
        console.log("menu created");
        
	}

	function updateMenu(epg){
        if(epg){
            console.log("updateMenu called");

            curTime = new Date();
            console.log(curTime);
            
            $.each(_menu_.items, function(i, channel){

                if(channel.number){
                    var epgchannel = epg.channels[channel.number - 1];
                    if(!epgchannel.number){
                        console.log("epgchannel.number undefined, menu update stopped");
                        return;
                    }
                }else{
                    console.log("channel.number undefined, menu update stopped");
                    return;
                }
                var status_wrapper = channel.element.childNodes.getByClass("status_wrapper")[0];
                
                if(channel instanceof Channel && channel.number == epgchannel.number && (channel.epg.now.end != undefined && curTime >= channel.epg.now.end.toDate())){
                    
                   try{
                  
                      channel.update(epgchannel);
          
                   }catch(e){
                       console.log("Exception in updating channel " + e.message );
                   }                    
                  
                    // Title
                    
                    var program_title = status_wrapper.childNodes.getByClass("program_title")[0];
                    var now = channel.boxes[0];
                    var title = now.getTitle("def");
                    if(title.length == 0) title = now.getTitle("alt");
                    program_title.innerHTML = XMLEscape(title);

                    // Clock
                    if(channel.boxes[0].start != undefined) {
                            var start = channel.boxes[0].start.toDate().create24HourTimeString() +" ";
                            var starttime = status_wrapper.childNodes.getByClass("start_time")[0];
                            starttime.innerHTML = XMLEscape(start) || "";
                    }
                                
                }
                
                var pb_width = 0;
                if(channel.boxes[0].start && channel.boxes[0].end){
                    var start = channel.boxes[0].start.toDate();
                    var end = channel.boxes[0].end.toDate();
                    pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60)) * progressWidth);
                }
                
                // Update all closed channels progressbars
                var progress_bar_frame = status_wrapper.childNodes.getByClass("progress_bar_frame")[0];
                var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
                progress_bar.style.width = pb_width + "px";
            
           });
            console.log("menu updated");
        }else{
            console.log("Epg not defined, menu not updated");
        }
	}
    
    function updateProggressbars(){   
         $.each(_menu_.items, function(i, channel){ 
            var status_wrapper = channel.element.childNodes.getByClass("status_wrapper")[0];
            var pb_width = 0;
            if(channel.boxes[0].start && channel.boxes[0].end){
                var start = channel.boxes[0].start.toDate();
                var end = channel.boxes[0].end.toDate();
                pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60)) * progressWidth);
            }

            // Update all closed channels progressbars
            var progress_bar_frame = status_wrapper.childNodes.getByClass("progress_bar_frame")[0];
            var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
            progress_bar.style.width = pb_width + "px";
         });
         console.log("All progresbars updated");
    } 

    function getServiceList(list,succesCallback, errorCallback) {
        $.get( list, function( data ) {
            succesCallback(data); 
        },"text");
       
    }
    
	function initClock() {
        curTime = new Date();
        refresh();
    }

    function updateOpenChannel() {
        
        var channel = _menu_.getOpenChannel();
        
        if(channel){
            $.each(channel.boxes, function(b, box){
                var timeremainingElems = box.element.getElementsByClassName("timeremaining");
                if(timeremainingElems.length > 0){
                    var timeremaining = timeremainingElems[0];
                    timeremaining.innerHTML = Math.max(0, Math.round((box.end.toDate().getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining";
                }
            });

            var pb_width = 0;
            if(channel.boxes[0].start && channel.boxes[0].end){
                var start = channel.boxes[0].start.toDate();
                var end = channel.boxes[0].end.toDate();
                pb_width = Math.floor(Math.max(0, Math.round((curTime.getTime() - start.getTime()) / 1000 / 60)) / Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60)) * progressOpenWidth);
                console.log("progressbar updated");
            }
            
            var progress_bar_frame = channel.boxes[0].element.childNodes.getByClass("boxitem_info")[0].childNodes.getByClass("progress_bar_frame")[0];
            if(progress_bar_frame) {
                var progress_bar = progress_bar_frame.childNodes.getByClass("progress_bar")[0];
                progress_bar.style.width = pb_width + "px";
            
            }
            
        }
    }

    function refresh() {


        curTime = new Date();
		

        if(curTime.getMinutes() != prevm){
        	prevm = curTime.getMinutes();
            
			displayTime();
			
			if ((prevm == 10) || (prevm == 40))
				console.log(curTime);

			var hidden = (document.hidden != undefined && document.hidden) ? true : false;
        	if(miniepg && !hidden){
			var needToUpdate = false;
        		for(var i = 0; i < miniepg.channels.length; i++){
        			if(miniepg.channels[i].epg.now && miniepg.channels[i].epg.now.end){
	    				if(curTime >= miniepg.channels[i].epg.now.end.toDate()){
	    					// update miniepg
	    					console.log("update miniepg");
							needToUpdate = true;
							break;
	    				}
	    			}
        		}

            // Update every channel progressbars every minute
            updateProggressbars();
                
			// Update the currently opened channel
			updateOpenChannel();

        		if(needToUpdate){
                   
                   
                    console.log("needToUpdate menu");
                    var date = new Date(curTime.getTime());
                    if(curTime.getHours() >= 0 && curTime.getHours() < 4){
                        date = new Date(curTime.getTime()-TWENTY_FOUR_HOURS);
                    }
                    var datestr = date.getFullYear()+addZeroPrefix(date.getMonth()+1)+addZeroPrefix(date.getDate());
                        
                    try{
                        getMiniEPG(datestr, lang, function(epg){
                            if(_menu_ == null){
                                createMenu(epg);
                            }
                            else{
                                updateMenu(epg);
                            }
                            
                            
                            var channel = _menu_.getOpenChannel();
                        
                            if(channel){
                                 channel.update();
                            }
                            
                        }, function(){
                            console.log("Error in fetching miniepg data");
                        });
                    }catch(e){
                      console.log(e.message);  
                    }
					
					
				}
        	}
        }
        setTimeout(refresh, 1000);
    }

	function registerKeyListener() {
		document.addEventListener('keydown', eventFunction, false);
	}
	
	function eventFunction(e){
		if (onKey(e.keyCode)) {
			e.preventDefault();
		}
	}
	
	function disableKeyListener() {
		document.removeEventListener('keydown', eventFunction, false);
	}

	function displayTime() {
		
		var cury = curTime.getFullYear();
        var curmo = curTime.getMonth()+1;
        var curd = curTime.getDate();
        var curh = curTime.getHours();
        var curm = curTime.getMinutes();
        var curs = curTime.getSeconds();
		
        document.getElementById("clock_date_date").innerHTML = addZeroPrefix(curd);
        document.getElementById("clock_date_month").innerHTML = "." + addZeroPrefix(curmo);
        document.getElementById("clock_date_year").innerHTML = "." + cury;
		
		document.getElementById("clock_time").innerHTML = curTime.create24HourTimeString();
    }

    
	function getTitle(obj, lang){
		if(obj.texts){
			for(var i = 0; i < obj.texts.length; i++){
				if(obj.texts[i].lang == lang){
					if(obj.texts[i].title){
						return obj.texts[i].title;
					}
				}
			}
		}
		else{
			return obj.title || "";
		}
		return "";
	}

	function getStyleSheetPropertyValue(selectorText, propertyName) {
		// search backwards because the last match is more likely the right one
		for (var s= document.styleSheets.length - 1; s >= 0; s--) {
			var cssRules = document.styleSheets[s].cssRules ||
			document.styleSheets[s].rules || []; // IE support
			for (var c=0; c < cssRules.length; c++) {
				if (cssRules[c].selectorText === selectorText) return cssRules[c].style[propertyName];
			}
		}
		return null;
	}
	
	//]]>
	</script>

</head>
<body id="body" onload="onLoad();">
	<div style="visibility:hidden;width:0px;height:0px;">
		<object id="appmgr" type="application/oipfApplicationManager" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
		<object id="oipfcfg" type="application/oipfConfiguration" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
        <object id="broadcast" type="video/broadcast" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
	</div>

    <!-- <div id="debug" style="position:absolute; left:100px; top:100px; display:block;"></div> -->
	<div id="dialog" class="hide"></div>
	
	<div id="wrapper" class="hide">

		<!-- <div id="debug" style="position:absolute; top:100px; left:100px;"></div> -->

		<div id="menu_0"></div>
		
		<div id="clock">
			<canvas id="analog_clock" width="40" height="40"></canvas> 
			<div id="clock_date">
				<span id="clock_date_date"></span>
				<span id="clock_date_month"></span>
				<span id="clock_date_year"></span>
			</div> 
            <div id="clock_time">
            </div>
		</div>
		
	</div>
	

	
	<div id="channel_info" class="channel_info hide"><span id="info_num"></span><span id="info_name"></span></div>
    <div  id="chinfo" class="hide">
        <div id="chinfo_chname"></div>
        <div id="chinfo_chnumber"></div>
        <div id="chinfo_chicon"><img id="chinfo_chicon_img" src="" alt=""/></div>
        <div id="chinfo_logo"><img src="images/launcher_logo.png" alt=""/></div>
      
        <div id="chinfo_now">
            <div id="chinfo_now_header">NOW SHOWING</div>
            <div id="chinfo_now_title"></div>
            <div id="chinfo_now_starttime"></div>
            <div id="chinfo_now_endtime"></div>
            <div id="chinfo_now_image"><img id="chinfo_now_image_img" src="" alt=""/></div>
            <div id="chinfo_progressbar">
                <div id="chinfo_progressbarbg"></div>
                <div id="chinfo_progressbarTime" style="width: 0%;"></div>
            </div>            
            
        </div>

        <div id="chinfo_next">
            <div id="chinfo_next_header">FOLLOWING</div>
            <div id="chinfo_next_title"></div>
            <div id="chinfo_next_starttime"></div>
            <div id="chinfo_next_endtime"></div>
            
            <div id="chinfo_next_image"><img id="chinfo_next_image_img" src="" alt=""/></div>
        </div>

	</div>
	<div id="info" class="transition03all hide"></div>
	<div class="hide" id="loading"></div>
</body>
</html>

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
    <script src="../../../jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="menu.js"></script>
   	<script type="text/javascript" src="channel.js"></script>
    <script type="text/javascript" src="program.js"></script>
   	<script type="text/javascript" src="box.js"></script>
	<script type="text/javascript" src="navigation.js"></script>
	<script type="text/javascript" src="../session.js"></script>
    <script type="text/javascript" src="../../isoduration.js"></script>
    <script type="text/javascript" src="../../channel-common.js"></script>
    <script type="text/javascript" src="../../common.js"></script>
    <script type="text/javascript" src="../buttonbar.js"></script>
	<script type="text/javascript" src="../alertDialog.js"></script>
    <script type="text/javascript" src="clientError.js"></script>
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

	var VERTICAL_MENU = 0;
	var HORIZONTAL_MENU = 1;
	var BOXITEM = 2;
	var TWENTY_FOUR_HOURS = 86400000;
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
		menuOffset = $("#menu_0").css("top");
		menuOffset = menuOffset.substring(0, menuOffset.length-2);
		
		registerKeys();
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
        
        getServiceList("../../../backend/servicelist.php", function( epg ){
                createMenu(epg);
        }, function(){
            console.log("Error in fetching service data");
        });
  
	}
	
	function createMenu(data){
		_menu_ = new Menu("menu_0");
		_menu_.center = 0;
        var currentChannel = null;
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
            currentChannel  = _application_.privateData.currentChannel;
          
        } catch (e) {
        }        
        var current_channel_obj = null;
        var listedChannels = [];
        var services = parseServiceList(data,channelList);  
        for (var i = 0; i < services.length ;i++) {
            var chan = services[i];
            chan.items =  [
                {
                    "title": "Now Showing",
                    "description": "Now Showing",
                    "name": "now",
                    "app": 0
                }
            ];
            chan.eval = "miniepg("+ i +");";
            var channel_obj = new Channel(chan, "menuitem"+ i);
            for(var b = 0; b < channel_obj.boxes.length; b++){
				channel_obj.boxes[b].description = "";
				break;
			}
            if(chan.dvbChannel != null && currentChannel && chan.dvbChannel.ccid == currentChannel.ccid ) {
                current_channel_obj = channel_obj;
            }
            if(chan.dvbChannel != null) {
                listedChannels.push(chan.dvbChannel);
            }
			_menu_.items.push(channel_obj);
        }
        var number = 1000;
        for(var k = 0;k<channelList.length;k++) {
            var dvbChannel = channelList.item(k);
            var listed = false;
            for(var l = 0;l<listedChannels.length;l++) {
                if(listedChannels[l].ccid == dvbChannel.ccid) {
                    listed = true;
                    break;
                }
            }
            if(!listed) {
                var chan = {};
                chan.items =  [
                    {
                        "title": "Now Showing",
                        "description": "Now Showing",
                        "name": "now",
                        "app": 0
                    }
                ];
                chan.title = dvbChannel.name;
                chan.dvbChannel = dvbChannel;
                chan.lcn = number++;
                var channel_obj = new Channel(chan, "menuitem"+ (k + services.length));
                for(var b = 0; b < channel_obj.boxes.length; b++){
				    channel_obj.boxes[b].description = "";
				    break;
			    }
                if(currentChannel && chan.dvbChannel.ccid == currentChannel.ccid ) {
                     current_channel_obj = channel_obj;
                }
			    _menu_.items.push(channel_obj);
            }

        }
        _menu_.items.sort(compareLCN);
        if(current_channel_obj == null) {
            current_channel_obj = _menu_.items[0];
             _menu_.center = 0;
        }
        else {
            _menu_.center = _menu_.getChannelIndex(current_channel_obj);
        }
        currentChIndex = current_channel_obj.lcn;
		_menu_.populate();
        showMenu();
        document.getElementById("info_num").innerHTML = current_channel_obj.lcn+".";
        document.getElementById("info_name").innerHTML = current_channel_obj.title.replace('&', '&amp;');
        hideTimer = setTimeout(function(){ hideMenu(); }, 5000);
        var channelStr = getUrlParameter("ch");
        if(channelStr) {
            var menuItem = null;
		    for(var i = 0; i < _menu_.items.length; i++){
                if(_menu_.items[i].id == channelStr ){
                    menuItem = _menu_.items[i];
                    break;
                }
	        }
		    if(menuItem != null){
			    jumpToMenuItem(menuItem);
			    keyEnter();
            }
        }
        
	}

    function updateProggressbars(){   
         $.each(_menu_.items, function(i, channel){ 
            var status_wrapper = channel.element.childNodes.getByClass("status_wrapper")[0];
            var pb_width = 0;
            if(channel.boxes[0].start && channel.boxes[0].end){
                var start = channel.boxes[0].start;
                var end = channel.boxes[0].end;
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
                    timeremaining.innerHTML = Math.max(0, Math.round((box.end.getTime() - curTime.getTime()) / 1000 / 60)) + " mins remaining";
                }
            });

            var pb_width = 0;
            if(channel.boxes[0].start && channel.boxes[0].end){
                var start = channel.boxes[0].start;
                var end = channel.boxes[0].end;
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

			var hidden = (document.hidden != undefined && document.hidden) ? true : false;
        	if(_menu_ && _menu_.items && !hidden){

        		for(var i = 0; i < _menu_.items.length; i++){
                    if(_menu_.items[i].epg && _menu_.items[i].epg.now && _menu_.items[i].epg.now.end){
	    				if(curTime >= _menu_.items[i].epg.now.end){
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
       
	</div>

    <!-- <div id="debug" style="position:absolute; left:100px; top:100px; display:block;"></div> -->
	<div id="dialog" class="hide"></div>
	<object id="broadcast" type="video/broadcast" ></object>
	<div id="wrapper" class="hide">

		<!-- <div id="debug" style="position:absolute; top:100px; left:100px;"></div> -->

		<div id="menu_0"></div>
		
		<div id="clock">
            <div id="clock_time">
            </div>
		</div>
		
	</div>
	

    <div id="channel_change" class="channel_change"></div>
	<div id="channel_info" class="channel_info hide"><span id="info_num"></span><span id="info_name"></span></div>
    <div  id="chinfo" class="hide">
        <div id="chinfo_chname"></div>
        <div id="chinfo_chnumber"></div>
        <div id="chinfo_chicon"><img id="chinfo_chicon_img" src="" alt=""/></div>
        <div id="chinfo_logo"><img src="images/logo_dvb-i.png" alt=""/></div>
      
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

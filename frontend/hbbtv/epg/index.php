<?php
    header( "Content-Type: text/html; charset=UTF-8" );
	echo "<?xml version=\"1.0\" encoding=\"utf-8\" ?>";
?>
<!DOCTYPE html PUBLIC "-//HbbTV//1.1.1//EN" "http://www.hbbtv.org/dtd/HbbTV-1.1.1.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head> 
    <title>gridEPG</title>
	<meta http-equiv="content-type" content="application/vnd.hbbtv.xhtml+xml; charset=utf-8" />
    <link rel="stylesheet" href="../CommonUI/commonui.css">
    <link rel="stylesheet" href="epg.css"/>
    <script type="text/javascript" src="../../../jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="gridepg.js"></script>
    <script type="text/javascript" src="channel.js"></script>
    <script type="text/javascript" src="program.js"></script>
    <script type="text/javascript" src="navigation.js"></script>
    <script type="text/javascript" src="scripts.js"></script>
    <script type="text/javascript" src="../../common.js"></script>
    <script type="text/javascript" src="../session.js"></script>
    <script type="text/javascript" src="../../isoduration.js"></script>
    <script type="text/javascript" src="../../channel-common.js"></script>

	<script type="text/javascript" language="javascript">
	//<![CDATA[

    var lang_json_array = [];
    lang_json_array.sort();
    var channelList = [];
    var DAYS_ENGL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS_ENGL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var VISIBLE_ROWS = 5;
    var IDLE_TIME_THRESHOLD = 600000; // 10 minutes
    var TWENTY_FOUR_HOURS = 86400000;
	var curTime, diffTime, prevs, prevm;
	var refTime = <?php echo round(microtime(true)*1000); ?>;
    var tz = <?php echo date('Z')*1000; ?>; 
    var animating = false;
    var containerFrame = null;
    var container = null;
    var cids = [];
    var firstVisibleRow = 0;
    var lastVisibleRow = VISIBLE_ROWS-1;
    var loading = false;
    var videodiv = null;
    var video = null;
    var chlistdvb = null;
    var _epg_ = null;
    var channelToOpen = 0;
    var firstChannel =  "";
    


    if(channelList){
        if(typeof(channelList) == "string"){
            channelList = JSON.parse(channelList);
        }
    }

	function showApplication() {
	  try {
	    var app = document.getElementById('appmgr').getOwnerApplication(document);
	    app.show();
	    app.activate();
	  } catch (e) {
	    // ignore
	  }
	}

	function onLoad() 
	{
        // Initialize variables
        loading = false;
        showDetailTimeout = null;
        showDetailDelay = 300;
        refreshView = false;
        backstack = [];

        arrow_left = document.getElementById("arrow_left");
        arrow_right = document.getElementById("arrow_right");
        arrow_down = document.getElementById("arrow_down");
        arrow_up = document.getElementById("arrow_up");
        bluebutton = document.getElementById("blueb");
        player = document.getElementById("player");
        containerFrame = document.getElementById("containerFrame");
        container = document.getElementById("container");
        container.innerHTML = "";
        document.getElementById("channels").innerHTML = "";
        
        registerKeys(1);
    	registerKeyListener();
        showApplication();

        videodiv = document.getElementById("videodiv");
        video = document.getElementById("video");
        loadChannelList();

	}

    function compareLCN(a, b) {
      if (a.lcn > b.lcn) return 1;
      if (b.lcn > a.lcn) return -1;

      return 0;
    }

    function loadChannelList(){
        $.get( "../../../backend/servicelist.php", function( data ) {
            var vid = document.getElementById('broadcast');
            var config = vid.getChannelConfig();
            var dvbChannels = config.channelList;
            var list = parseServiceList(data,dvbChannels);
            list.sort(compareLCN);
            channelList = {"channels" :list};
            init();
        },"text");

    }

    function init(callback){
        console.log("app init");
        initClock();
        var yesterday = new Date(curTime.getTime());
        var datestr = yesterday.getFullYear()+addZeroPrefix(yesterday.getMonth()+1)+addZeroPrefix(yesterday.getDate());
        var days = 3;

        cids = [];
        for(var i = 0; i < channelList.channels.length; i++){
            var cid = encodeURIComponent(channelList.channels[i].id);
            cids.push(cid);
        }
        var firstChannel = getUrlParameter("ch");
        if(firstChannel) {
            channelToOpen = cids.indexOf(firstChannel);
            if(channelToOpen == -1) {
                channelToOpen = 0;
            }
        }
        
        setLoading(true);
        _epg_ = new GridEPG("epgwrapper", channelList,channelToOpen, VISIBLE_ROWS, yesterday, curTime, days,epgLoaded);
        //});
    }

    function epgLoaded() {
            if(_epg_.channels.length > 0){
                _epg_.populate(function(){
                    document.getElementById("epgRows").addClass("notransition");
                    document.getElementById("channels").addClass("notransition");
                    CSSscrollDown(document.getElementById("epgRows"), (_epg_.channels.indexOf(_epg_.getFirstVisibleChannel())) * (_epg_.channel_element_height + _epg_.channel_margin_bottom), ANIMATION_DURATION, null);
                    CSSscrollDown(document.getElementById("channels"), (_epg_.channels.indexOf(_epg_.getFirstVisibleChannel())) * (_epg_.channel_element_height + _epg_.channel_margin_bottom), ANIMATION_DURATION, null);
                    setTimeout(function(){
                        document.getElementById("epgRows").removeClass("notransition");
                        document.getElementById("channels").removeClass("notransition");
                    },10);
                });
                _epg_.setActiveItem(_epg_.channels[channelToOpen]);
            }
            setLoading(false);
            
            _epg_.element.removeClass("hide");
            if( typeof( callback ) == "function" ){
                callback();
            }
            _epg_.activeItem.setFocus();
    }

	function registerKeyListener() {
        document.addEventListener('keydown', function(e) {
            if (onKey(e.keyCode)) {
                e.preventDefault();
            }
        }, false);
	}

	function initClock() {
        var tempTime = new Date(); 
        var timems = tempTime.getTime();
        diffTime = refTime-timems+tempTime.getTimezoneOffset()*60000+tz;
        curTime = new Date(timems+diffTime);
        refresh();
    }

    function refresh() {
        var tempTime = new Date();
        var timems = tempTime.getTime();
        curTime = new Date(timems+diffTime);  
        if( curTime.getMinutes() != prevm){
            displayTime();
            prevm = curTime.getMinutes();
            if(_epg_){
                _epg_.updateVerticalTimeLine();
            }
        }
        setTimeout(function(){
            refresh();
        },1000);
    }

    function displayTime() {
        var cury = curTime.getFullYear();
        var curmo = curTime.getMonth()+1;
        var curd = curTime.getDate();
        var curh = curTime.getHours();
        var curm = curTime.getMinutes();
        var curs = curTime.getSeconds();
        document.getElementById("clock_date").innerHTML = addZeroPrefix(curd) + "." + addZeroPrefix(curmo) + "." + cury;
        document.getElementById("clock_time").innerHTML = curTime.format("H:i");
    }

	//]]>
	</script>

</head>
<body id="body" onload="onLoad();" class="bg_plain">

    <div id="videodiv" class="video_fullscreen">
    </div>


    <div id="info" class="transition03all hide"></div>

    <div id="playerTitle"></div>
    <div id="player">
        <div id="playposition"></div>
		<div id="playtime"></div>
		<div id="progress_currentTime" style="left:130px"></div>
        <div id="progressbarbg"></div><div id="progressbar" style="transition03all"></div>
        <div id="prew"></div>
        <div id="ppauseplay" class="pause"><div class="vcrbtn"></div><span id="pauseplay"></span></div> 
        <div id="pff"></div>
    </div>

    <div id="wrapper">
		<div style="visibility:hidden;width:0px;height:0px;">
			<object id="appmgr" type="application/oipfApplicationManager" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
			<object id="oipfcfg" type="application/oipfConfiguration" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
            <object id="broadcast" type="video/broadcast" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></object>
		</div>
    	<div class="app_header">
		</div>
		<div id="clock">
			<div id="clock_date"></div> 
            <div id="clock_time"></div>
		</div>

        <div id="app_title"></div>


         <!-- Faders -->
        <div class="screenFader" id="leftFader" style="display:block"></div>
        <div class="screenFader" id="rightFader"  style="display:block"></div> 

        <div id="epgwrapper" class="hide">
            <div id="arrow_up" class="hide"></div>
            <div id="arrow_down" class="hide"></div>
            <div id="arrow_left" class="hide"></div>
            <div id="arrow_right" class="hide"></div>

            <div id="date"></div>

            <div id="leftbarFrame">
                <div id="channels"></div>
            </div>
            
            <div id="containerFrame">
                <div id="container"></div>
            </div>

            <div id="detail">
                <div id="detailMenu"></div>
                <div id="detail_programtext">
                    <div id="detail_description" class="verticalAutoscroll">
                        <div id="detail_progressBarFrame" class="progressBarFrame">
                            <div id="detail_progressBar" class="progressBar"></div>
                        </div>
                        <div id="detail_header">
                            <span id="detail_program_title"></span>
                            <span id="detail_program_time"></span>
                            <div>
                                <span id="detail_genre">
                                </span><span id="detail_audio"></span>
                            </div>
                            <div id="detail_year"></div>
                            <div id="rating"></div>
                        </div>
                        <div id="detail_programimage_container">                        
                            <img id="detail_programimage" src="" alt="" />
                        </div>
                        <div id="detail_description_text"></div>
                    </div>
                    <div id="detailDescriptionVbar"></div>
                    <div id="detailDescriptionScroller"></div>

                </div>
                <div id="detailMenuVbar"></div>
                <div id="detailMenuScroller"></div>
            </div>

            <div id="buttonbar">
                <div class="btn" id="okb"> <span class="icon ok"></span> <span class="bb_label" id="ok">Select</span></div>
                <div id="fbwb" class="btn"><span class="icon fbw"></span><span id="fbw" class="bb_label">-5</span></div>
                <div id="ffwb" class="btn"><span class="icon ffw"></span><span id="ffw" class="bb_label">+5</span></div>
                <div id="skpbwb" class="btn"><span class="icon skpbw"></span><span id="skpbw" class="bb_label">First</span></div>
                <div id="skpfwb" class="btn"><span class="icon skpfw"></span><span id="skpfw" class="bb_label">Last</span></div>
                <div class="btn" id="blueb"> <span class="icon blue"></span> <span class="bb_label" id="blue">Tune to channel</span></div>    
            </div>

        </div>

       
        <div id="notification_wrapper"></div>
        <div id="dialog" class="hide"></div>>

    </div>
	 <div class="hide" id="loading"></div>

</body>
</html>

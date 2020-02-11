//var ROW_HEIGHT = 38;
var ROW_HEIGHT = 88;
var ROW_VERTICAL_MARGIN = 0;
var BOXITEM_HORIZONTAL_MARGIN = 16;
var animating = false;
var activeBox = null;
var hideTimer = null;
var numKeyTimer = null;
var channelNumberStr = "";
var keyPresses = 0;
var menuTimer = null;
var menuTime = 0;
var updateTimer = null;
var updateTime = 50;
var currentChIndex = null;
var lastChIndex = null;
var scrolling = false;
var fastScrolling = false;
var firstPressed = false;
var scrollTimer = null;
var bufferScrollingTimer = null;
var fastScrollTimer = null;
var changingCh = false;
var chChangeTimer = null;
var selectionChangeTimer = null;
var menuOpen = false;
var supervisor = null;
var player = null;
var broadcast = null;

if (typeof(KeyEvent)!='undefined') {
	if (typeof(KeyEvent.VK_LEFT)!='undefined') {
		var VK_LEFT = KeyEvent.VK_LEFT;
		var VK_UP = KeyEvent.VK_UP;
		var VK_RIGHT = KeyEvent.VK_RIGHT;
		var VK_DOWN = KeyEvent.VK_DOWN;
		var VK_ENTER = KeyEvent.VK_ENTER;
		var VK_RED = KeyEvent.VK_RED;
		var VK_GREEN = KeyEvent.VK_GREEN;
		var VK_YELLOW = KeyEvent.VK_YELLOW;
		var VK_BLUE = KeyEvent.VK_BLUE;
		var VK_PLAY = KeyEvent.VK_PLAY;
		var VK_PAUSE = KeyEvent.VK_PAUSE;
		var VK_STOP = KeyEvent.VK_STOP;
		var VK_FAST_FWD = KeyEvent.VK_FAST_FWD;
		var VK_REWIND = KeyEvent.VK_REWIND;
		var VK_BACK =KeyEvent.VK_BACK;
		var VK_0 = KeyEvent.VK_0;
		var VK_1 = KeyEvent.VK_1;
		var VK_2 = KeyEvent.VK_2;
		var VK_3 = KeyEvent.VK_3;
		var VK_4 = KeyEvent.VK_4;
		var VK_5 = KeyEvent.VK_5;
		var VK_6 = KeyEvent.VK_6;
		var VK_7 = KeyEvent.VK_7;
		var VK_8 = KeyEvent.VK_8;
		var VK_9 = KeyEvent.VK_9;
		//ABox42
		var VK_HOME = KeyEvent.VK_HOME;
		var VK_INFO = KeyEvent.VK_INFO;
		var VK_GUIDE = KeyEvent.VK_GUIDE;
		var VK_EXIT = KeyEvent.VK_EXIT || 27;
		var VK_MENU = KeyEvent.VK_MENU;
		var VK_VOLUP = KeyEvent.VK_VOLUP;
		var VK_VOLDN = KeyEvent.VK_VOLDN;
        var VK_VOLUME_UP = KeyEvent.VK_VOLUME_UP;
        var VK_MUTE = KeyEvent.VK_MUTE;
		var VK_VOLUME_DOWN = KeyEvent.VK_VOLUME_DOWN;
		var VK_CHANNEL_DOWN = KeyEvent.VK_CHANNEL_DOWN;
		var VK_CHANNEL_UP = KeyEvent.VK_CHANNEL_UP;
		var VK_POWER = KeyEvent.VK_POWER;
		/*var VK_REFRESH = KeyEvent.VK_REFRESH;*/
		var VK_RELOAD = KeyEvent.VK_RELOAD;
        var VK_TRACK_PREV = KeyEvent.VK_TRACK_PREV;
        var VK_TRACK_NEXT = KeyEvent.VK_TRACK_NEXT;
		
	}
}
if (typeof (VK_LEFT) == "undefined") {
	var VK_RED      = 116; //403 humax
	var VK_GREEN    = 117; //404 humax
	var VK_YELLOW   = 118; //405 humax
	var VK_BLUE     = 119; //406 humax
	
	var VK_LEFT     = 37;
	var VK_UP       = 38;
	var VK_RIGHT    = 39;
	var VK_DOWN     = 40;
	var VK_ENTER    = 13;
    var VK_GUIDE = 458;
	
	var VK_0        = 48;
	var VK_1        = 49;
	var VK_2        = 50;
	var VK_3        = 51;
	var VK_4        = 52;
	var VK_5        = 53;
	var VK_6        = 54;
	var VK_7        = 55;
	var VK_8        = 56;
	var VK_9        = 57;
	
	var VK_PLAY     = 415;
	var VK_PAUSE    = 19;
	var VK_STOP     = 413;
	var VK_FAST_FWD = 417;
	var VK_REWIND   = 412;
	var VK_TRACK_PREV = 424;
    var VK_TRACK_NEXT = 425;
	
	var VK_HOME		= 771;
	var VK_MENU     = 77;
	var VK_END		= 35;
	var VK_BACK     = 461;
	var VK_EXIT    	= 27;
	var VK_TELETEXT = 113;
	
	// page up 427, page down 428
	
	var VK_TELETEXT = 459;
}

function registerKeys(mode) {
	var mask;
	// ui hidden, only red and green registered
	if (mode == 0) {
		mask = 0x400;
	} else {
		mask = 0x10+0x20+0x40+0x80+0x100+0x400;
	}
	try {
 
        var app = document.getElementById('appmgr').getOwnerApplication(document);
        var cfg = document.getElementById('oipfcfg');
        app.privateData.keyset.setValue(mask);
        broadcast = document.getElementById('broadcast');
        try {
	        supervisor = broadcast.getChannelConfig().getBroadcastSupervisor();
            supervisor.onChannelChangeSucceeded = onChannelChangeSucceeded;
            supervisor.onChannelChangeError = onChannelChangeError;
        } catch (e) {
            broadcast.bindToCurrentChannel();
        }

        var keys = [KeyEvent.VK_GUIDE,KeyEvent.VK_CHANNEL_UP,KeyEvent.VK_CHANNEL_DOWN,KeyEvent.VK_SUBTITLE,KeyEvent.VK_INFO,KeyEvent.VK_MENU];
        app.privateData.keyset.setValue(mask,keys);
        cfg.configuration.replaceUIElements([cfg.configuration.UI_TVMODE,cfg.configuration.UI_MENU,cfg.configuration.UI_EPG]);
        app.onOperatorApplicationStateChange = onOperatorApplicationStateChange;        
	} catch (e2) {
 	}
}

function onChannelChangeSucceeded(channel) {
    //showInfo("onChannelChangeSucceeded:"+channel.name);
}
function onChannelChangeError(channel,error) {
    //showInfo("onChannelChangeError:"+channel.name+ " Error:"+error);
}

function onOperatorApplicationStateChange(oldstate, newstate) {
    //showInfo("State changed from "+oldstate +" to "+newstate );
}


function onKey(keyCode)
{	
	if(!animating){
		
		if(alertDialog.open){
			return navigateAlertDialog(keyCode);
		}
		
		var num_key;
		switch (keyCode) {
		//case 82:
		//case 403:
		/*
		case VK_PORTAL:
		break;
		*/
		case VK_0 :  
			num_key = 0;
			openChannel(num_key);
			break;
		case VK_1 :   
			num_key = 1;
			openChannel(num_key);
			break;
		case VK_2 :
			num_key = 2;
			openChannel(num_key);
			break;
		case VK_3 : 
			num_key = 3;
			openChannel(num_key);
			break;
		case VK_4 :     
			num_key = 4;
			openChannel(num_key);
			break;
		case VK_5 :     
			num_key = 5;
			openChannel(num_key);
			break;
		case VK_6 :   
			num_key = 6;
			openChannel(num_key);
			break;
		case VK_7 : 
			num_key = 7;
			openChannel(num_key);
			break;
		case VK_8 :  
			num_key = 8;
			openChannel(num_key);
			break;
		case VK_9 :
			num_key = 9;
			openChannel(num_key);
			break;
		break;
		
		case VK_HOME:
		break;
		
		case VK_RED:
			// keyBrowser();
			//keyRed();
			if (menuOpen) {
				hideMenu();
			} else {
				showMenu();
			}
		break;

		//case 71:
		//case 404:
        case KeyEvent.VK_SUBTITLE:
        case KeyEvent.VK_MENU:
		case VK_GREEN:
            try {
             _application_.opAppRequestForeground();
            } catch (e) {}
			window.location = "../epg/index.php";
		break;
		
		case VK_ENTER:
			keyEnter();
		break;
		
		case VK_EXIT:
		case VK_BACK:
			keyBack();
		break;

		case VK_LEFT:
			keyLeft();
		break;

		case VK_RIGHT:
			keyRight();
		break;
		
		case VK_RELOAD:
			keyLastChannel();
		break;
		
		case VK_DOWN:
			clearTimeout(scrollTimer);
			scrollTimer = null;
			// At first time set fastScroll timer
			if(!firstPressed && !fastScrolling){
				firstPressed = true;
				fastScrollTimer = setTimeout(function(){fastScrolling = true;}, 5000);
			}
			
			if(fastScrolling){
					if(firstPressed)
						 firstPressed = false;
					if(!scrolling){
						onKey(VK_FAST_FWD);
					}
					// if channels selected fast enough then start fast scroll mode.
					// Otherwise stay in slow scroll mode
					scrollTimer = setTimeout(function(){
						fastScrolling = false; 			
					}, 300);
			}else{
				if(!scrolling){
					keyDown();
				}
				// if channels selected fast enough then start fast scroll mode.
				// Otherwise stay in slow scroll mode	
				scrollTimer = setTimeout(function(){
						fastScrolling = false; 
						firstPressed = false; 
						clearTimeout(fastScrollTimer);
						fastScrollTimer = null;
					}, 300);
			}
			
			
		break;

		case VK_UP:
		
			clearTimeout(scrollTimer);
			scrollTimer = null;
			// At first time set fastScroll timer
			if(!firstPressed && !fastScrolling){
				firstPressed = true;
				fastScrollTimer = setTimeout(function(){fastScrolling = true;}, 5000);
			}
			
			if(fastScrolling){
					if(firstPressed)
						firstPressed = false;
					if(!scrolling){
						onKey(VK_REWIND);	
					}	
				// if channels selected fast enough then start fast scroll mode.
				// Otherwise stay in slow scroll mode
				scrollTimer = setTimeout(function(){
					fastScrolling = false; 
				}, 300);	
			}else{
				if(!scrolling){
					keyUp();
				}
				// if channels selected fast enough then start fast scroll mode.
				// Otherwise stay in slow scroll mode
				scrollTimer = setTimeout(function(){
					fastScrolling = false; 
					firstPressed = false; 
					clearTimeout(fastScrollTimer);
					fastScrollTimer = null;
				}, 300);	
			}
			
			
		break;
		case 107:
		case VK_CHANNEL_UP:
				channelUp();
		break;
		
        //case 109:
		case VK_CHANNEL_DOWN:
				channelDown();
		break;
        case VK_VOLUME_UP:
				volumeUp();
		break;		
		case VK_VOLUME_DOWN:
				volumeDown();
		break;
        case VK_MUTE:
				mute();
		break;
		case VK_GUIDE:
            try {     
             _application_.opAppRequestForeground();
            } catch(e) {}
			window.location = "../epg/index.php";
		break;
        case 109:
        case VK_BLUE:
		case VK_INFO:
            if(menuOpen) {
                hideMenu();
            }
            if(document.getElementById("chinfo").hasClass("hide")){
                try {
                    _application_.opAppRequestForeground();
                } catch(e) {
                }  
		        showInfobanner();
            }
            else {
                try {
                  _application_.opAppRequestBackground();
                } catch(e) {;                    
                }                    
                hideInfobanner();
            }

		break;
		case VK_PAUSE:
		case VK_PLAY:
            
		case VK_STOP:
			return false;
		break;
		//case 34:
		case VK_FAST_FWD:
			if(!scrolling){
				var menuItem = _menu_.get5plusChannel();
				jumpToMenuItem(menuItem);
			}
		break;
		//case 33:
		case VK_REWIND:
			if(!scrolling){
				var menuItem = _menu_.get5minusChannel();
				jumpToMenuItem(menuItem);
			}
		break;
		
        case VK_TRACK_PREV : 
			var menuItem = _menu_.items[0];
			jumpToMenuItem(menuItem);
		break;
        
		case VK_TRACK_NEXT :
			var menuItem = _menu_.items[_menu_.items.length-1];
			jumpToMenuItem(menuItem);
		break;
		
		default:
			return false;
		}
		return true;
	}
}

function volumeUp() {
    changeVolume(5);
}
function volumeDown() {
    changeVolume(-5);
}

function changeVolume(amount) {
      
      var cfg = document.getElementById('oipfcfg');
      var  orig = cfg.localSystem.volume;
      cfg.localSystem.volume = cfg.localSystem.volume+amount;
}

function mute() {
     var cfg = document.getElementById('oipfcfg');
      cfg.localSystem.mute = !cfg.localSystem.mute;
}

function openChannel(ch_index){
	
	console.log("ch_index " + ch_index);
	console.log("keyPresses " + keyPresses);
	
	if(keyPresses < 3){
		document.getElementById("channel_change").removeClass("hide");
		keyPresses++;	
		clearTimeout(numKeyTimer);	
			
		numKeyTimer = setTimeout(function(){
			numKeyTimer = null;
			clearTimeout(numKeyTimer);
			var channel_num = parseInt(channelNumberStr);
			var menuItem = _menu_.getChannelAtIndex(channel_num);
			if(menuItem != null){
				jumpToMenuItem(menuItem);
				keyEnter();
				
				clearTimeout(hideTimer);
				hideTimer = null;
				hideTimer = setTimeout(function(){
									
									console.log("wrapper hide()");
                                    hideMenu();
                                    
                                    clearTimeout(hideTimer);
									hideTimer = null;
								},8000);
				
			}else{
                document.getElementById("channel_change").innerHTML = "<span></span>";
				//document.getElementById("change_num").innerHTML = "";
			}
			channelNumberStr = "";
			keyPresses = 0;
			console.log("timer closed");
			
			document.getElementById("channel_change").addClass("hide");
		}, 3000);
		
		if(numKeyTimer){
			channelNumberStr = channelNumberStr+String(ch_index);
			if(keyPresses < 3){
                document.getElementById("channel_change").innerHTML = "<span>" + channelNumberStr  +"_</span>";
				//document.getElementById("change_num").innerHTML = channelNumberStr  +"_";
			}else{
                document.getElementById("channel_change").innerHTML = "<span>" + channelNumberStr  +"</span>";
				//document.getElementById("change_num").innerHTML =  channelNumberStr;
			}
			console.log("channelNumberStr " + channelNumberStr);
		}
	}
}

function keyRed(){
	try{
        var url = getReturnLink(true);
        if(url){
            console.log( "got return link" );
            window.location = url;
        }
        else
        {
            window.location = "../launcher/index.php?ch="+broadcastChannel;
        }
    }
    catch(e){
        console.log(e);
    }
}
function updateBannerProgram(prefix,program) {
      if(program) {
          $("#"+prefix+'title').html(program.title);
          $("#"+prefix+'starttime').html(program.start ? program.start.create24HourTimeString()+" -" : "");
          $("#"+prefix+'endtime').html(program.end ? program.end.create24HourTimeString() : "");
          $("#"+prefix+'image_img').attr("src",program.img);
    }
    else {
        $("#"+prefix+'title').html("No program");
        $("#"+prefix+'starttime').html("");
        $("#"+prefix+'endtime').html("");
        $("#"+prefix+'image_img').attr("src","");
    }
}

function updateBannerProgramDVB(prefix,program) {
      if(program) {
          $("#"+prefix+'title').html(program.name);
          var startTime = new Date(program.startTime*1000);
          var endTime = new Date((program.startTime+program.duration)*1000);
          $("#"+prefix+'starttime').html( startTime.create24HourTimeString());
          $("#"+prefix+'endtime').html( endTime.create24HourTimeString());
          $("#"+prefix+'image_img').attr("src","fokapokfpok");
    }
}


function showInfobanner() {
    var hint = document.getElementById("hint"); 
     if(hint && !hint.hasClass("hide")){
	    document.getElementById("hint").addClass("hide");
        clearTimeout(hintTimer);
        hintTimer = null;
    }
    var channel = _menu_.getOpenChannel();
    $('#chinfo_chname').html(channel.name);
    $('#chinfo_chnumber').html(channel.majorChannel);
    $('#chinfo_chicon_img').attr("src",channel.image);
   
    if(channel.epg) {
     updateBannerProgram("chinfo_now_",channel.epg.now);       
     if (channel.epg.now && channel.epg.now.start && channel.epg.now.duration) { 
        var now = new Date();
        var elapsed = (now.getTime() -channel.epg.now.start_utc.toUTCDate().getTime())/10;
        $("#chinfo_progressbarTime").css("width",elapsed/channel.epg.now.duration+"%");
      }
      updateBannerProgram("chinfo_next_",channel.epg.next); 
    }
    else if(supervisor.currentChannel && channel.dvbChannel && supervisor.currentChannel.ccid == channel.dvbChannel.ccid){
        var programs = supervisor.programmes;
        if(programs.length > 0) {
            updateBannerProgramDVB("chinfo_now_",programs[0]);
            var now = new Date();
            var elapsed = (now.getTime() - programs[0].startTime*1000)/10;
            $("#chinfo_progressbarTime").css("width",elapsed/programs[0].duration+"%");       
        }
        else {
            updateBannerProgram("chinfo_now_",null);
        }
        if(programs.length > 1) {
          updateBannerProgramDVB("chinfo_next_",programs[1]); 
        }
        else {
            updateBannerProgram("chinfo_next_",null);
        }
    }
    else {
        updateBannerProgram("chinfo_now_",null);
        updateBannerProgram("chinfo_next_",null);
    }
	document.getElementById("chinfo").removeClass("hide");
    document.getElementById("chinfo").addClass("show");
    document.getElementById("channel_info").removeClass("hide");
}

function hideInfobanner() {
    document.getElementById("chinfo").addClass("hide");
    document.getElementById("chinfo").removeClass("show");
    document.getElementById("channel_info").addClass("hide");
}

function showMenu(){
	console.log("wrapper show()");
    menuOpen = true;
    try {
        _application_.opAppRequestForeground();
    } catch(e) {
    }
    var hint = document.getElementById("hint");
    if(hint && !hint.hasClass("hide")){
        document.getElementById("hint").addClass("hide");
        clearTimeout(hintTimer);
        hintTimer = null;
    }
    hideInfobanner();
	if(document.getElementById("wrapper").hasClass("hide")){
		document.getElementById("wrapper").removeClass("hide");
		document.getElementById("channel_info").removeClass("hide");
        if(selectionChangeTimer){
            clearTimeout(selectionChangeTimer);
            selectionChangeTimer = null;
        }
	}
}

function hideMenu(){
	console.log("wrapper hide()");
    menuOpen = false;
	if(!document.getElementById("wrapper").hasClass("hide")){
		document.getElementById("wrapper").addClass("hide");
		document.getElementById("channel_info").addClass("hide");
        if(currentChIndex){
            selectionChangeTimer = setTimeout(function(){
                var menuItem = _menu_.getChannelAtIndex(currentChIndex); 
                jumpToMenuItem(menuItem, true);
                selectionChangeTimer = null;
            }, 5000);
        }
	}
}

function exit() {
	window.location = "../portal/index.php";
}

function keyBack(){
    hideInfobanner();
    hideMenu();
    try {
    _application_.opAppRequestBackground();    
    } catch(e) {}
    /*try{
        var url = getReturnLink(true);
        if(url){
            console.log( "got return link" );
            window.location = url;
        }
        else
        {
            window.location = "../portal_new/index.php";
        }
    }
    catch(e){
        console.log(e);
    }*/
}

function channelUp(){
            try {
		    _application_.opAppRequestTransient();
            } catch(e) {           
            }
			clearTimeout(hideTimer);
			hideTimer = null;
			
            var nextChannel = _menu_.getNextChannel();
			if(!nextChannel || menuTimer){
				return;
			}
			clearTimeout(chChangeTimer);
			chChangeTimer = null;
			jumpToMenuItem(nextChannel,true);
			var channel_obj = _menu_.getOpenChannel();
			if(currentChIndex){
				lastChIndex = currentChIndex;
			}
			currentChIndex = channel_obj.majorChannel;
          
			document.getElementById("info_num").innerHTML = channel_obj.majorChannel+".";
            document.getElementById("info_name").innerHTML = channel_obj.name.replace('&', '&amp;');
                     showInfobanner();
			chChangeTimer = setTimeout(function(){
               try{
                    if(channel_obj.dvbChannel) {
                        selectDVBService(channel_obj.dvbChannel);
                    }
                    else if(channel_obj.dashUrl) {
                        playDASH(channel_obj.dashUrl);
                    }

				}
				catch(e){
					console.log(e);
				}	
				
				clearTimeout(chChangeTimer);
				chChangeTimer = null;
				
			}, 1500);
			
			hideTimer = setTimeout(function(){
							console.log("wrapper hide()");
                            hideMenu();
                            hideInfobanner();
                            clearTimeout(hideTimer);
							hideTimer = null;
						},8000);
						
}

function channelDown(){
            try {
		    _application_.opAppRequestTransient();
            } catch(e) {
            }

			clearTimeout(hideTimer);
			hideTimer = null;

            var previousChannel = _menu_.getPreviousChannel();
			if(!previousChannel || menuTimer){
				return;
			}
			
			clearTimeout(chChangeTimer);
			chChangeTimer = null;
			
			jumpToMenuItem(previousChannel,true);
			
			var channel_obj = _menu_.getOpenChannel();
			
			if(currentChIndex){
				lastChIndex = currentChIndex;
			}
            currentChIndex = channel_obj.majorChannel;
            document.getElementById("info_num").innerHTML = channel_obj.majorChannel+".";
            document.getElementById("info_name").innerHTML = channel_obj.name.replace('&', '&amp;');
            showInfobanner();

			chChangeTimer = setTimeout(function(){
                try{
                    if(channel_obj.dvbChannel) {
                        selectDVBService(channel_obj.dvbChannel) ;
                    }
                    else if(channel_obj.dashUrl) {
                        if(player) {
                            player.stop();
                        }
                        playDASH(channel_obj.dashUrl);
                    }

				}
				catch(e){
					console.log(e);
				}	
				
				clearTimeout(chChangeTimer);
				chChangeTimer = null;
				clearTimeout(chChangeTimer);
				chChangeTimer = null;
			}, 1500);
			
			hideTimer = setTimeout(function(){
				console.log("wrapper hide()");
                hideMenu();
                hideInfobanner();
                clearTimeout(hideTimer);
				hideTimer = null;
			},8000);
}

function playDASH(url) {
     try {
        if(player) {
            player.stop();
        }
        $( "#player" ).remove();
     }
     catch(e) {
     }

    try {
        if(supervisor != null) {
            if(supervisor.playState == 1 ) {
                supervisor.stop();
                supervisor.setChannel(null);
            }
        }
        else {
            broadcast = document.getElementById('broadcast');
            broadcast.stop();
            broadcast.addClass("hide_broadcast");
        }
     }
     catch(e) {
     }
     player = new VideoPlayerHTML5("player");
     player.populate();
     player.createPlayer();    
     player.setURL(url);
     player.startVideo(true);
}

function selectDVBService(channel) {
     try {
        if(player) {
            player.stop();
        }
        $( "#player" ).remove();
     }
     catch(e) {
     }
    try {
        if(supervisor != null) {
           supervisor.setChannel(channel,false,"");
        }
        else {
            broadcast = document.getElementById('broadcast');
            broadcast.bindToCurrentChannel();
            broadcast.setChannel(channel,false,"");
            broadcast.removeClass("hide_broadcast");
        }
     }
     catch(e) {
     }

}

function keyEnter(){
	
    if(!menuOpen){
        showMenu();
    }else{
		var focus = getFocus();
		var channel_obj = _menu_.getOpenChannel();
		if(currentChIndex == channel_obj.majorChannel) {
			hideMenu();
			return;
		}
		if(currentChIndex){
			lastChIndex = currentChIndex;
		}

			
			if(activeBox instanceof Box){
                if(channel_obj.dvbChannel) {
                   document.getElementById("info_num").innerHTML = channel_obj.majorChannel+".";
                   document.getElementById("info_name").innerHTML = channel_obj.name.replace('&', '&amp;');
                   currentChIndex = channel_obj.majorChannel;
                   try {
                       selectDVBService(channel_obj.dvbChannel);
                    }
                    catch(e) {
                       showInfo("Error selecting channel!");
                    }
                }
                else if(channel_obj.dashUrl) {
                    playDASH(channel_obj.dashUrl);
                    document.getElementById("info_num").innerHTML = channel_obj.majorChannel+".";
                    document.getElementById("info_name").innerHTML = channel_obj.name.replace('&', '&amp;');
                    currentChIndex = channel_obj.majorChannel;
                }
				else if(activeBox.mediaurl && activeBox.mediaurl.length > 0){
					var _item = {
						title : (activeBox.texts && activeBox.texts.length > 0) ? activeBox.texts[0].title : (activeBox.title && activeBox.title.length > 0) ? activeBox.title : (activeBox.serie && activeBox.serie.length > 0) ? activeBox.serie : "",
						serieTitle : ( activeBox.texts && activeBox.texts.length ? activeBox.texts[0].serietitle : "" ),
						serieid : activeBox.serie,
						img : activeBox.mediaimage || "files/icon_play.png",
						type : "list", 
						code : activeBox.code,
						desc : activeBox.desc,
						seriedesc : (activeBox.texts && activeBox.texts.length > 0) ? activeBox.texts[0].seriedesc : "",
						start : activeBox.start,
						end : activeBox.end,
						genre : activeBox.genre,
						url : activeBox.mediaurl,
						rating : activeBox.rating,
						sname : (video.sname ? video.sname : undefined ),
						ratingReasons : ( activeBox.ratingreason? activeBox.ratingreason.split(",") : [] ),
						adtags : { adtag1 : "", adtag1 : "" },
						attributes : activeBox.attributes
					};
					item = _item;
					//prepareVideoStart();
				}
				else if(focus.getAttribute("data-eval") != null){
					console.log("eval called");
					eval(focus.getAttribute("data-eval"));
				}
				else if(focus.getAttribute("data-url") != null){
					
					var root = "http://tvportal.sofiadigital.tv/atlas_dev";
					var url = "";
					if(focus.getAttribute("data-url").search("epg") != -1){
						url = focus.getAttribute("data-url").replace("..", root)+"?selected_ch=" + channel_obj.code;
					}else{
						url = focus.getAttribute("data-url").replace("..", root);
					}
					console.log("url " + url);	
					
					//setReturnLink( focus.getAttribute("data-url") ); 
					var returnUrl = "../launcher/index.php?ch="+ channel_obj.code + "&selected_ch=" + channel_obj.code;
					var appUrl = focus.getAttribute("data-url");
					console.log("returnUrl  " + returnUrl);
					console.log("appUrl  " + appUrl );
					
					setReturnLink( appUrl,  returnUrl ); 
					
					location.href = focus.getAttribute("data-url");
						
				}
			}
			
	refreshMenu();
	}
}


function getCurrentChannel(){
	var out = null;
	var item;
	for(var i = 0; i < _menu_.items.length; i++) {
		item = _menu_.items[i];
		if(item.majorChannel === currentChIndex){
			console.log("current channel found");
			out = item;
			break;
		}
	}
	return out;
}

function openCurrentChannel(ch_obj){

			
			var focus = getFocus();
			if(activeBox instanceof Box){
				if(activeBox.name == "catchup"){
					item = {url: activeBox.url, title: activeBox.title };
					//startVideo(item);
				}				
				else if(false && activeBox.mediaurl && activeBox.mediaurl.length > 0){
					var _item = {
						title : (activeBox.texts && activeBox.texts.length > 0) ? activeBox.texts[0].title : (activeBox.title && activeBox.title.length > 0) ? activeBox.title : (activeBox.serie && activeBox.serie.length > 0) ? activeBox.serie : "",
						serieTitle : ( activeBox.texts && activeBox.texts.length ? activeBox.texts[0].serietitle : "" ),
						serieid : activeBox.serie,
						img : activeBox.mediaimage || "files/icon_play.png",
						type : "list", 
						code : activeBox.code,
						desc : activeBox.desc,
						seriedesc : (activeBox.texts && activeBox.texts.length > 0) ? activeBox.texts[0].seriedesc : "",
						start : activeBox.start,
						end : activeBox.end,
						genre : activeBox.genre,
						url : activeBox.mediaurl,
						rating : activeBox.rating,
						sname : (video.sname ? video.sname : undefined ),
						ratingReasons : ( activeBox.ratingreason? activeBox.ratingreason.split(",") : [] ),
						adtags : { adtag1 : "", adtag1 : "" },
						attributes : activeBox.attributes
					};
					item = _item;
					//prepareVideoStart();
				}

				else if(focus.getAttribute("data-eval") != null){
					eval(focus.getAttribute("data-eval"));
				}
				else if(focus.getAttribute("data-url") != null){
					setReturnLink( focus.getAttribute("data-url") ); 
					location.href = focus.getAttribute("data-url");
				}
                else {
				
                	// Tune to channel
					try{
						var channel_obj;
						/*
						if(ch_obj){
							channel_obj = ch_obj;
						}
						*/
						if(broadcastChannel){
							console.log("broadcastChannel " + broadcastChannel);
							channel_obj = getCurrentChannel();
						}
						
						else{
							console.log("no broadcastChannel ");
							channel_obj = _menu_.getOpenChannel();
						}
						broadcastChannel = channel_obj.code;
				        currentChIndex = channel_obj.majorChannel;
                        document.getElementById("info_num").innerHTML = channel_obj.majorChannel+".";
                        document.getElementById("info_name").innerHTML = channel_obj.name.replace('&', '&amp;');
						document.getElementById("channel_info").removeClass("hide");
						clearTimeout(hideTimer);
						hideTimer = null;
						hideTimer = setTimeout(function(){
									if(!document.getElementById("channel_info").hasClass("hide")){
										document.getElementById("channel_info").addClass("hide");
									}
									clearTimeout(hideTimer);
									hideTimer = null;
								},8000);
					}
					catch(e){
						console.log(e);
					}
				}
			}
			refreshMenu();	
}


function keyLeft(){
	var focus = getFocus();
	if(activeBox){
		var prevItem = _menu_.getOpenChannel().getPreviousItem();
		if(focusBox(prevItem)){
			var newLeft = focus.parentNode.offsetLeft + (getFocus().offsetWidth + BOXITEM_HORIZONTAL_MARGIN);
			animating = true;
			$(focus.parentNode).animate(
				{left: newLeft},
				{
					duration:250,
					easing:"linear",
					complete:function(){
						animating = false;
						prevItem.autoScrollChildren();
					}
				}
			);
		}
	}
}

function keyRight(){
	var focus = getFocus();
	if(activeBox){
		var nextItem = _menu_.getOpenChannel().getNextItem();
		if(nextItem){
			if(focusBox(nextItem)){
				var newLeft = focus.parentNode.offsetLeft - (getFocus().offsetWidth + BOXITEM_HORIZONTAL_MARGIN);
				animating = true;
				$(focus.parentNode).animate(
					{left: newLeft},
					{
						duration:250,
						easing:"linear",
						complete:function(){
							animating = false;
							nextItem.autoScrollChildren();
						}
					}
				);
			}
		}
	}
}

function jumpToMenuItem(menuItem, menu_hidden){
    if(!menu_hidden && !menuOpen){
        showMenu();
    }
    var currentChannel = menuItem;
	var openChannel = _menu_.getOpenChannel();

	if(openChannel && currentChannel){
			var openMenu = openChannel.element;
			var currentMenu = currentChannel.element;
			var centerBox = currentChannel.getCenterBox();
			scrolling = true;
			clearTimeout(menuTimer);
			menuTimer = null;
			if(focusBox(centerBox)){
				openMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
					currentMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
						openChannel.setOpen(false);
						currentChannel.setOpen(true);
						var newTop;
						newTop = 300 - (currentChannel.code)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
						menuOffset = newTop; 
						
						console.log("newTop " + newTop, " menuOffset " + menuOffset);
						$("#menu_0").css("top", newTop);
						menuTimer = setTimeout(function(){
						
							currentMenu.childNodes.getByClass("items")[0].addClass("visible");
							
							clearTimeout(menuTimer);
							menuTimer = null;

							// Update the currently opened channel
							if(updateTimer != null) { clearTimeout(updateTimer); updateTimer = null; }
							updateTimer = setTimeout(function() { updateOpenChannel(); centerBox.autoScrollChildren(); }, updateTime);
						}, menuTime);
						
					});
				});
			}
			setTimeout(function(){scrolling = false;}, 0);
	}
}

function keyLastChannel(){
	console.log("keyLastChannel");
    if(!menuOpen){
        showMenu();
    }
    var lastChannel = _menu_.getChannelAtIndex(lastChIndex);
	if(lastChannel){
		jumpToMenuItem(lastChannel);
		keyEnter();
	}
	clearTimeout(hideTimer);
	hideTimer = null;
	hideTimer = setTimeout(function(){
					
					console.log("wrapper hide()");
                    hideMenu();
                    clearTimeout(hideTimer);
					hideTimer = null;
				},8000);
}

function keyDown(){
	if(!menuOpen){
        showMenu();
    }
	clearTimeout(hideTimer);
	hideTimer = null;
	
	var focus = getFocus();

	if(activeBox instanceof Box){
		var openChannel = _menu_.getOpenChannel();
		var nextChannel = _menu_.getNextChannel();
        var nextChannelIdx = _menu_.getNextChannelIndex();
		if(openChannel && nextChannel){
			scrolling = true;
			menuTimer = null;
			var openMenu = openChannel.element;
			var nextMenu = nextChannel.element;
				openMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
					nextMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
						openChannel.setOpen(false);
						nextChannel.setOpen(true);
						var newTop;
						newTop = 300 - (nextChannelIdx)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
						menuOffset = newTop;
						
						menuTimer = setTimeout(function(){
							openMenu.childNodes.getByClass("items")[0].removeClass("visible");
							nextMenu.childNodes.getByClass("items")[0].addClass("visible");

							clearTimeout(menuTimer);
							menuTimer = null;

							// Update the currently opened channel
							if(updateTimer != null) { clearTimeout(updateTimer); updateTimer = null; }
							updateTimer = setTimeout(function() { updateOpenChannel(); nextChannel.getCenterBox().autoScrollChildren(); }, updateTime);
						}, menuTime);
					
						$("#menu_0").css("top" , newTop);
					});
				});
			// This is for waiting rendering of the menu
			setTimeout(function(){scrolling = false;}, 0);
		}
	}
	
}



function keyUp(){
    if(!menuOpen){
        showMenu();
    }
 
    clearTimeout(hideTimer);
	hideTimer = null;
	
	var focus = getFocus();
	if(activeBox instanceof Box){
		var openChannel = _menu_.getOpenChannel();
		var previousChannel = _menu_.getPreviousChannel();
        var previousChannelIdx = _menu_.getPreviousChannelIndex();
		if(openChannel && previousChannel){
			scrolling = true;
			menuTimer = null;
			var openMenu = openChannel.element;
			var previousMenu = previousChannel.element;
				previousMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
					openMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
						openChannel.setOpen(false);
						previousChannel.setOpen(true);
						
						var newTop;
						newTop = 300 - (previousChannelIdx)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
						menuOffset = newTop; 
					   
					   menuTimer = setTimeout(function(){
						   previousMenu.childNodes.getByClass("items")[0].addClass("visible");
							
							clearTimeout(menuTimer);
							menuTimer = null;

							// Update the currently opened channel
							if(updateTimer != null) { clearTimeout(updateTimer); updateTimer = null; }
							updateTimer = setTimeout(function() { updateOpenChannel(); previousChannel.getCenterBox().autoScrollChildren(); }, updateTime);
						}, menuTime);

						$("#menu_0").css("top" , newTop);
						// This is for waiting rendering of the menu
						setTimeout(function(){scrolling = false;}, 0);
					});
				});
		}
	}
	
}

function refreshMenu(){
	var currentChannel = getCurrentChannel();
	var openChannel = _menu_.getOpenChannel();
	if(openChannel && currentChannel && (openChannel.majorChannel !== currentChannel.majorChannel) ){
			var openMenu = openChannel.element;
			var currentMenu = currentChannel.element;
			var centerBox = currentChannel.getCenterBox();
			
			if(focusBox(centerBox)){
				animating = true;
				currentMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
					openMenu.childNodes.getByClass("items")[0].removeClass("visible", function(){
						openChannel.setOpen(false);
						currentChannel.setOpen(true);
						var newTop;
							newTop = 300 - (currentChannel.code)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
							menuOffset = newTop;
							currentMenu.childNodes.getByClass("items")[0].addClass("visible");
							animating = false;
							centerBox.autoScrollChildren();	
							$("#menu_0").css("top", newTop);
					});
				});
			}
	}
}

function focusBox(_box){

	try{

		if(_box instanceof Box){
			if(focusElement(_box.element)){
				if(activeBox){
					activeBox.setUnactive();
				}

				// Buffer the start of scrolling so that fast scrolling doesn't unnecessarily start the process
				if(bufferScrollingTimer != null) { clearTimeout(bufferScrollingTimer); bufferScrollingTimer = null; }
				bufferScrollingTimer = setTimeout(function() {
					_box.autoScrollChildren();
				}, 30);

				if(_box.element.hasClass("catchup")){
					_box.element.childNodes.getByClass("boxitem_description")[0].removeClass("hide");
					var openChannel = _menu_.getOpenChannel();
					$.each(openChannel.boxes, function(b, box){
						if(box.element.hasClass("catchup") && box != _box){
							var desc = box.element.childNodes.getByClass("boxitem_description")[0];
							desc.addClass("hide");
						}
					});
				}
				else{
					var catchups = _box.element.childNodes.getByClass("catchup");
					if(catchups != null){
                        $.each(catchups, function(c, catchup){
                            var desc = box.element.childNodes.getByClass("boxitem_description")[0];
                            if(c == 0){
                                desc.removeClass("hide");
                            }
                            else{
                                desc.removeClass("hide");
                            }
                        });
                    }
				}

				if(_box.element.hasClass("related_video")){
					_box.element.childNodes.getByClass("boxitem_description")[0].removeClass("hide");
					var openChannel = _menu_.getOpenChannel();
					$.each(openChannel.boxes, function(b, box){
						if(box.element.hasClass("related_video") && box != _box){
							var desc = box.element.childNodes.getByClass("boxitem_description")[0];
							desc.addClass("hide");
							desc.addClass("related_video");
						}
					});
				}
				else{
					var related_videos = _box.element.childNodes.getByClass("related_video");
                    if(related_videos != null){
                        $.each(related_videos, function(c, rv){
                            var desc = box.element.childNodes.getByClass("boxitem_description")[0];
                            if(c == 0){
                                desc.removeClass("hide");
                            }
                            else{
                                desc.removeClass("hide");
                            }
                        });
                    }
				}

				activeBox = _box;

				return true;
			}
		}
		return false;
	}
	catch(e){
		console.log(e);
		return false;
	}
}

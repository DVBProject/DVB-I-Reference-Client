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
var playingDASH = false;
var playing = false;
var serviceApp = null;
var serviceInstance = null;
var availablityTimer = null;

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

function registerKeys() {
	var mask;

    //OpeApp mask, no color buttons
    mask = 0x10+0x20+0x40+0x80+0x100+0x400;

	try {
        var app = document.getElementById('appmgr').getOwnerApplication(document);
        var cfg = document.getElementById('oipfcfg');   
        broadcast = document.getElementById('broadcast');
        try {
	        supervisor = broadcast.getChannelConfig().getBroadcastSupervisor();
            supervisor.onChannelChangeSucceeded = onChannelChangeSucceeded;
            supervisor.onChannelChangeError = onChannelChangeError;

             cfg.configuration.replaceUIElements([cfg.configuration.UI_TVMODE,cfg.configuration.UI_MENU,cfg.configuration.UI_EPG]);
            app.onOperatorApplicationStateChange = onOperatorApplicationStateChange;   
             
            var keys = [KeyEvent.VK_GUIDE,KeyEvent.VK_CHANNEL_UP,KeyEvent.VK_CHANNEL_DOWN,KeyEvent.VK_SUBTITLE,KeyEvent.VK_INFO,KeyEvent.VK_MENU];
            app.privateData.keyset.setValue(mask,keys);
            app.opAppRequestForeground();
        } catch (e) {
            //Not an OpApp, register color buttons for HbbTV usage
            mask = 0x1+0x2+0x4+0x8+0x10+0x20+0x40+0x80+0x100;
            app.privateData.keyset.setValue(mask);
            broadcast.bindToCurrentChannel();
        }
	} catch (e2) {
 	}
}

function onChannelChangeSucceeded(channel) {
    console.log("onChannelChangeSucceeded:"+channel.name);
    if(languages.subtitleLanguage ) {
      var subtitles = getDVBTracks(broadcast.COMPONENT_TYPE_SUBTITLE);
      for(var i = 0;i < subtitles.length;i++) { 
          if(subtitles[i].lang == languages.subtitleLanguage) {
            selectDVBTrack(checked, supervisor.COMPONENT_TYPE_SUBTITLE);
            break;
          }
      }
    }
    if(languages.audioLanguage ) {
       var audioTracks = getDVBTracks(broadcast.COMPONENT_TYPE_AUDIO);
       for(var i = 0;i < audioTracks.length;i++) { 
          if(audioTracks[i].lang == languages.audioLanguage) {
            selectDVBTrack(checked, supervisor.COMPONENT_TYPE_AUDIO);
            break;
          }
      }
    }
}
function onChannelChangeError(channel,error) {
    //showInfo("onChannelChangeError:"+channel.name+ " Error:"+error);
}

function onOperatorApplicationStateChange(oldstate, newstate) {
     if(playingDASH && newstate != "foreground") {
        try {
            _application_.opAppRequestForeground();
        } catch(e) {
        }
    }
}


function onKey(keyCode)
{	
	if(!animating){
		
		if(alertDialog.open){
			return navigateAlertDialog(keyCode);
		}
        if(dialog && dialog.open){
            navigateDialog(keyCode);
            return true;
        }
		hideUItimer();
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
				hideMenu(true);
			} else {
				showMenu();
			}
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
		case VK_GREEN:
            try {     
             _application_.opAppRequestForeground();
            } catch(e) {}
			window.location = "../epg/index.php?ch="+getCurrentChannel().id;
		break;
        case 109:
        case VK_BLUE:
		case VK_INFO:
            if(menuOpen) {
                hideMenu(false);
            }
            if(document.getElementById("chinfo").hasClass("hide")){
                requestTransient();
		        showInfobanner();
            }
            else if(!playingDASH) {
                try {
                  _application_.opAppRequestBackground();
                } catch(e) {}
                hideInfobanner();
            }

		break;
    case VK_YELLOW:
    case KeyEvent.VK_SUBTITLE:
            showSettings();
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


function askPin(successCallback,failureCallback) {
  if(parentalPin == null || parentalEnabled == false) {
     if( successCallback && typeof(successCallback) == "function"){
      successCallback.call();
     }
     return;
  }
  var buttons = ["Enter PIN:"];
  var checked = 0;
  var pin = "";
  showDialog("", buttons,null,null,null,failureCallback,
  function(keyCode,button) {
      var stars = "****";
      if(keyCode == VK_BACK) {
           if(button == 0) {
              if(pin.length == 0) {
                return false;
              }
              else {
                pin = pin.substring(0,pin1.length-1);
                updateLabel(button,"Enter PIN:"+stars.substring(0,pin1.length));
                return true;
              }
           }
           else {
            return false;
           }
      }
      else {
        var num_key = null;
        switch(keyCode) {
         case VK_0 :  
			      num_key = "0";
			      break;
		      case VK_1 :   
			      num_key = "1";
			      break;
		      case VK_2 :
			      num_key = "2";
			      break;
		      case VK_3 : 
			      num_key = "3";
			      break;
		      case VK_4 :     
			      num_key = "4";
			      break;
		      case VK_5 :     
			      num_key = "5";
			      break;
		      case VK_6 :   
			      num_key = "6";
			      break;
		      case VK_7 : 
			      num_key = "7";
			      break;
		      case VK_8 :  
			      num_key = "8";
			      break;
		      case VK_9 :
			      num_key = "9";
			      break;
       }
       if(num_key != null) {
         pin += num_key;
         updateLabel(button,"Enter PIN:"+stars.substring(0,pin.length));
         if(pin.length == 4) {
            if(pin == parentalPin) {
              if( successCallback && typeof(successCallback) == "function"){
					      successCallback(); // call handler for response
				      }
            }
            else {
              if( failureCallback && typeof(failureCallback) == "function"){
					      failureCallback(); // call handler for response
				      }
            }
         }
       }
    } 
  },"Parental block");
}


function getDVBTracks(type) {
  var tracks = null;
  var broadcastElement = supervisor ? supervisor : broadcast;

  tracks = broadcastElement.getComponents(type);
  var trackList = [];  
  for(var i = 0;i<tracks.length;i++) {
    var track = {};
    track.lang = tracks[i].language;
    if(tracks[i].audioDescription) {
      track.type = "visual impaired";
    }
    else if(tracks[i].hearingImpaired) {
      track.type = "hearing impaired";
    }
    trackList.push(track);
  }
  return trackList;
}

function selectDVBTrack(componentIndex, type) {
  var tracks = null;
  var broadcastElement = supervisor ? supervisor : broadcast;
  
  tracks = broadcastElement.getComponents(type);
  broadcastElement.selectComponent(tracks[componentIndex]);

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

function hideUItimer() {
	clearTimeout(hideTimer);
	hideTimer = null;
	hideTimer = setTimeout(function(){
	    console.log("wrapper hide()");
        hideMenu(true);
        hideInfobanner();
        clearTimeout(hideTimer);
	    hideTimer = null;
	},10000);
}
function requestTransient() {
    if(!playingDASH) {
	    try {
            _application_.opAppRequestTransient();
        } catch(e) {
        }
    }
}
function openChannel(ch_index){

	console.log("ch_index " + ch_index);
	console.log("keyPresses " + keyPresses);
	
	if(keyPresses < 4){
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
			}else{
                document.getElementById("channel_change").innerHTML = "<span></span>";
				//document.getElementById("change_num").innerHTML = "";
			}
			channelNumberStr = "";
			keyPresses = 0;
			console.log("timer closed");
			
			document.getElementById("channel_change").addClass("hide");
		}, 2000);
		
		if(numKeyTimer){
			channelNumberStr = channelNumberStr+String(ch_index);
			if(keyPresses < 4){
                document.getElementById("channel_change").innerHTML = "<span>" + channelNumberStr  +"_</span>";
			}else{
                document.getElementById("channel_change").innerHTML = "<span>" + channelNumberStr  +"</span>";
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
          var parental = "";
          if(program.parentalRating && program.parentalRating.length > 0) {
            for(var i = 0;i < program.parentalRating.length;i++) {
              if(program.parentalRating[i].minimumage) {
                  parental = "("+program.parentalRating[i].minimumage+")";
                  break;
              }
            }
          }
          $("#"+prefix+'title').html(program.title+parental);
          $("#"+prefix+'starttime').html(program.start ? program.start.create24HourTimeString()+" -" : "");
          $("#"+prefix+'endtime').html(program.end ? program.end.create24HourTimeString() : "");
          $("#"+prefix+'image_img').attr("src",program.mediaimage);
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
          $("#"+prefix+'image_img').attr("src","");
    }
}


function showInfobanner() {
    var channel = getCurrentChannel();
    $('#chinfo_chname').html(channel.title);
    $('#chinfo_chnumber').html(channel.lcn);
    $('#chinfo_chicon_img').attr("src",channel.image ? channel.image : "" );
    var serviceInstance = channel.getServiceInstance();
    if(channel.epg) {
     updateBannerProgram("chinfo_now_",channel.epg.now);       
     if (channel.epg.now && channel.epg.now.start && channel.epg.now.prglen) { 
        var now = new Date();
        var elapsed = (now.getTime() -channel.epg.now.start.getTime())/10;
        $("#chinfo_progressbarTime").css("width",elapsed/(channel.epg.now.prglen*60)+"%");
      }
      updateBannerProgram("chinfo_next_",channel.epg.next); 
    }
    else if(supervisor && serviceInstance && supervisor.currentChannel && serviceInstance.dvbChannel && supervisor.currentChannel.ccid == serviceInstance.dvbChannel.ccid){
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
}

function hideInfobanner() {
    document.getElementById("chinfo").addClass("hide");
    document.getElementById("chinfo").removeClass("show");
}

function showMenu(){
    menuOpen = true;
    requestTransient();
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

function hideMenu(requestBackground){
    if(requestBackground && !playingDASH) {
        try {
             _application_.opAppRequestBackground();
        } catch(e) {}
    }
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
    hideMenu(true);
}

function channelUp(){
            requestTransient();			
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
			currentChIndex = channel_obj.lcn;
          
			document.getElementById("info_num").innerHTML = channel_obj.lcn+".";
            document.getElementById("info_name").innerHTML = channel_obj.title.replace('&', '&amp;');
            if(!menuOpen) {
                showInfobanner();
            }
			chChangeTimer = setTimeout(function(){
                selectService(channel_obj);
				clearTimeout(chChangeTimer);
				chChangeTimer = null;
				
			}, 1500);
}

function channelDown(){
            requestTransient();

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
            currentChIndex = channel_obj.lcn;
            document.getElementById("info_num").innerHTML = channel_obj.lcn+".";
            document.getElementById("info_name").innerHTML = channel_obj.title.replace('&', '&amp;');
            if(!menuOpen) {
                showInfobanner();
            }

			chChangeTimer = setTimeout(function(){
                selectService(channel_obj);
				clearTimeout(chChangeTimer);
				chChangeTimer = null;
			}, 1500);
}

function selectService(channel_obj) {
     selectService.selected = false;
     selectedService = channel_obj;
     selectedService.selected = true;
     if(serviceApp) {
        serviceApp.destroyApplication();
     }
     if(!channel_obj.isProgramAllowed()) {
            if(player) {
                player.stop();
            }
            playingDASH = false;
            playing = false;
            try {
            if(supervisor != null) {
                supervisor.setChannel(null);
            }
            else {
                broadcast = document.getElementById('broadcast');
                broadcast.stop();
                broadcast.addClass("hide_broadcast");
            }
            } catch(e) {}

        dialog.pin = true;
        askPin(function() {
              dialog.open = false;
              dialog.pin = false;
              $("#dialog").html("");
			        $("#dialog").removeClass("show");
      				$("#dialog").addClass("hide");
              doServiceSelection();
            },
            function() {
              dialog.open = false;
              dialog.pin = false;
              $("#dialog").html("");
			        $("#dialog").removeClass("show");
      				$("#dialog").addClass("hide");
              $("#info").removeClass("hide");
              $("#info").html( "Content blocked by parental rating!" );
            }
          );
        return;
     }
     if(dialog.open && dialog.pin) {
      dialog.open = false;
      dialog.pin = false;
      $("#dialog").html("");
      $("#dialog").removeClass("show");
			$("#dialog").addClass("hide");
     }
     doServiceSelection();
}

function checkAvailability() {
   console.log("checkAvailability",new Date());
   var instance = selectedService.getServiceInstance();
   if(instance != serviceInstance) {
       console.log("different service instace, select service");
      doServiceSelection();
   }
   availablityTimer = setTimeout(checkAvailability,60*1000);
}

function doServiceSelection() {
  try{
      playing= true;
      $("#info").addClass("hide");
      serviceInstance = selectedService.getServiceInstance();
      if(availablityTimer) {
        clearInterval(availablityTimer);
      }
      if(selectedService.hasAvailability()) {
        availablityTimer = setTimeout(checkAvailability,(60-new Date().getSeconds())*1000);
      }

      if(serviceInstance == null) {
        if(player) {
            player.stop();
            player = null;
        }
        else {
              try {
              broadcast = document.getElementById('broadcast');
              broadcast.stop();
              broadcast.addClass("hide_broadcast");
              }
              catch(e) {}
          }
        showInfo("Service not available");
        return;
      }
      if(serviceInstance.mediaPresentationApps) {
          for(var i = 0;i< serviceInstance.mediaPresentationApps.length;i++ ) {
            if(serviceInstance.mediaPresentationApps[i].contentType == "application/vnd.dvb.ait+xml") {
              serviceApp = _application_.createApplication(serviceInstance.mediaPresentationApps[i].url,true);
              return;
            }
          }
      }
      if(selectedService.mediaPresentationApps) {
          for(var i = 0;i< selectedService.mediaPresentationApps.length;i++ ) {
            if(selectedService.mediaPresentationApps[i].contentType == "application/vnd.dvb.ait+xml") {
              serviceApp = _application_.createApplication(selectedService.mediaPresentationApps[i].url,true);
              return;
            }
          }
      }
      if(serviceInstance.dvbChannel) {
          selectDVBService(serviceInstance.dvbChannel) ;
      }
      else if(serviceInstance.dashUrl) {
          playDASH(serviceInstance.dashUrl);
      }
      if(serviceInstance.parallelApps) {
        for(var i = 0;i< serviceInstance.parallelApps.length;i++ ) {
          if(serviceInstance.parallelApps[i].contentType == "application/vnd.dvb.ait+xml") {
            serviceApp = _application_.createApplication(serviceInstance.parallelApps[i].url,true);
            return;
          }
        }
      }
      if(selectedService.parallelApps) {
        for(var i = 0;i< selectedService.parallelApps.length;i++ ) {
          if(selectedService.parallelApps[i].contentType == "application/vnd.dvb.ait+xml") {
            serviceApp = _application_.createApplication(selectedService.parallelApps[i].url,true);
            return;
          }
        }
      }

	}
	catch(e){
		console.log(e);
	}
}

function checkParental() {
    if(selectedService) {
        if(selectedService.isProgramAllowed()) {
            $("#info").addClass("hide");
            if(dialog.open && dialog.pin) {
              dialog.open = false;
              dialog.pin = false;
              $("#dialog").html("");
			        $("#dialog").removeClass("show");
      				$("#dialog").addClass("hide");
            }
            if(!playing) {
                selectService(selectedService);
            }
        }
        else {
            //$("#info").removeClass("hide");
            //$("#info").html( "Content blocked by parental rating!" );
            if(player) {
                player.stop();
            }
            playingDASH = false;
            playing = false;

            if(supervisor != null) {
                supervisor.setChannel(null);
            }
            else {
                try {
                broadcast = document.getElementById('broadcast');
                broadcast.stop();
                broadcast.addClass("hide_broadcast");
                }
                catch(e) {}
            }
            dialog.pin = true;
            askPin(function() {
              dialog.open = false;
              dialog.pin = false;
              $("#dialog").html("");
			        $("#dialog").removeClass("show");
      				$("#dialog").addClass("hide");
              doServiceSelection();
            },
            function() {
              dialog.open = false;
              dialog.pin = false;
              $("#dialog").html("");
			        $("#dialog").removeClass("show");
      				$("#dialog").addClass("hide");
              $("#info").removeClass("hide");
              $("#info").html( "Content blocked by parental rating!" );
            });
        }
    }
}

function playDASH(url) {
     try {
        if(player) {
            player.stop();
        }
     }
     catch(e) {
     }
	 try {
        _application_.opAppRequestForeground();
        playingDASH = true;
        
    } catch(e) {
    }
    try {
        if(supervisor != null) {
            supervisor.setChannel(null);
        }
        else {
            broadcast = document.getElementById('broadcast');
            broadcast.stop();
            broadcast.addClass("hide_broadcast");
        }
     }
     catch(e) {
      }
     if(playerType == "mse-eme") {
       player = new VideoPlayerEME("videodiv");
       player.populate();
       player.createPlayer();
       player.player.updateSettings({
            'streaming': {
                'lowLatencyEnabled': llEnabled,
                'liveDelay': liveDelay,
                'liveCatchUpMinDrift': minimumDrift,
                'liveCatchUpPlaybackRate': catchupRate
            }
        });
     }
     else { //html5 as default
        player = new VideoPlayerHTML5("videodiv");
        player.populate();
        player.createPlayer();
     }
     player.setURL(url);
       player.startVideo(true);

}

function selectDVBService(channel) {
     try {
        if(player) {
            player.stop();
            player = null;
        }
      
     }
     catch(e) {
     }
    playingDASH = false;  
    requestTransient();
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
		if(channel_obj && currentChIndex == channel_obj.lcn) {
			hideMenu(true);
			return;
		}
		if(currentChIndex){
			lastChIndex = currentChIndex;
		}

			
			if(activeBox instanceof Box){
                document.getElementById("info_num").innerHTML = channel_obj.lcn+".";
                document.getElementById("info_name").innerHTML = channel_obj.title.replace('&', '&amp;');
                currentChIndex = channel_obj.lcn;
                selectService(channel_obj);
			}
			
	refreshMenu();
	}
}


function getCurrentChannel(){
	var out = null;
	var item;
	for(var i = 0; i < _menu_.items.length; i++) {
		item = _menu_.items[i];
		if(item.lcn === currentChIndex){
			console.log("current channel found");
			out = item;
			break;
		}
	}
	return out;
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
						newTop = 300 - _menu_.getChannelIndex(currentChannel)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
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
}

function keyDown(){
	if(!menuOpen){
        showMenu();
    }
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
	if(openChannel && currentChannel && (openChannel.lcn !== currentChannel.lcn) ){
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
							newTop = 300 - menu_.getChannelIndex(currentChannel)*(ROW_HEIGHT + ROW_VERTICAL_MARGIN);
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

function updateStreamInfo() {
    if(player&& playerType == "mse-eme") {
        try {
         var settings = player.player.getSettings();
         document.getElementById("live_settings").innerHTML = "Low latency mode:"+settings.streaming.lowLatencyEnabled + " Delay:"+ settings.streaming.liveDelay + 
                "<br/>Min drift:"+settings.streaming.liveCatchUpMinDrift + " Catchup Rate" + settings.streaming.liveCatchUpPlaybackRate;
         var audioTrack = player.player.getBitrateInfoListFor("audio")[player.player.getQualityFor("audio")];
         var videoTrack = player.player.getBitrateInfoListFor("video")[player.player.getQualityFor("video")];
         var bestAudio = player.player.getTopBitrateInfoFor("audio");
         var bestVideo = player.player.getTopBitrateInfoFor("video");
         if(audioTrack) {
          document.getElementById("audio_bitrate").innerHTML = audioTrack.bitrate / 1000 + "kbits (max:"+ bestAudio.bitrate / 1000+"kbits)";
         }
         if(videoTrack) {
            document.getElementById("video_bitrate").innerHTML = videoTrack.bitrate / 1000 + "kbits (max:"+ bestVideo.bitrate / 1000+"kbits)";
            document.getElementById("video_resolution").innerHTML = videoTrack.width+"x"+videoTrack.height +" (max:"+ bestVideo.width+"x"+bestVideo.height+")";
         }
         document.getElementById("live_latency").innerHTML = player.player.getCurrentLiveLatency()+"s";
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

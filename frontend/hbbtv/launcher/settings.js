function showSettings(selected) {
    var index = selected ? selected : 0;
    var buttons = ["Select servicelist","Parental settings","DASH settings","Low latency settings","Default audio language","Accessible audio","Default subtitle language","UI language" ];
    if(player != null) {
        try {
            var subtitles = player.getSubtitles();
            if(subtitles.length > 0) {
                buttons.push("Subtitles");
            }
        }
        catch(e) {
            console.log(e);
        } 
        try {
            var audioTracks = player.getAudioTracks();
            if(audioTracks.length > 0) {
                buttons.push("Audio");
            }
        }
        catch(e) {
            console.log(e);
        }
    }
    else {
      try {
            var subtitles = getDVBTracks(broadcast.COMPONENT_TYPE_SUBTITLE);
            if(subtitles && subtitles.length > 0) {
                buttons.push("Subtitles");
            }
        }
        catch(e) {
          console.log(e);
        }

        try {
            var audioTracks = getDVBTracks(broadcast.COMPONENT_TYPE_AUDIO);
            if(audioTracks && audioTracks.length > 0) {
                buttons.push("Audio");
            }
        }
        catch(e) {
          console.log(e);
        }
    }

    showDialog("", buttons,null,index,
        function(checked){
            if(checked == 0 ) {
                loadServicelistProviders(PROVIDER_LIST,function() {showSettings(0);});
            }
            else if(checked == 1 ) {
                askPin(showParentalSettings,function(){ showInfo("Wrong PIN"); showSettings(1);});
            }
            else if(checked == 2 ) {
                showPlayerSettings();
            }
            else if(checked == 3 ) {
                showLLSettings();
            }
            else if(buttons[checked] == "Subtitles"  ) {
                showSubtitleSettings();
            }
            else if(buttons[checked] == "Audio"  ) {
                showAudioSettings();
            }
            else if(buttons[checked] == "Default audio language"  ) {
                showDefaultAudioSettings();
            }
            else if(buttons[checked] == "Accessible audio"  ) {
                showAccessibleAudioSettings();
            }
            else if(buttons[checked] == "Default subtitle language"  ) {
                showDefaultSubtitleSettings();
            }
            else if(buttons[checked] == "UI language"  ) {
                showUILanguageSettings();
            }
     },true);
}

function showLLSettings(selected) {
    var index = selected ? selected : 0;
    var buttons = ["Low latency mode "+(llEnabled ? "(on)":"(off)"),"Target latency ("+liveDelay+"s)","Minimum drift ("+minimumDrift+"s)","Catch-up playback rate ("+catchupRate+"%)","Show stream info("+showStreamInfo+")"];
    showDialog("Low latency settings", buttons,null,index,
        function(checked){
            if(checked == 0) {
                showLLModeSettings();
            }
            else if(checked == 1) {
                 showTargetLatencySettings();
            }
            else if(checked == 2) {
                 showMinimumDriftSettings();
            }
            else if(checked == 3) {
                 showCatchupRateSettings();
            }
            else if(checked == 4) {
                 showStreamInfoSettings();
            }
            
     },function() {
      setLocalStorage("ll_settings", {
          'lowLatencyEnabled': llEnabled,
          'liveDelay': liveDelay,
          'liveCatchUpMinDrift': minimumDrift,
          'liveCatchUpPlaybackRate': catchupRate
      });
      showSettings(3);
    });
}



function showLLModeSettings() {
    var buttons = ["Low latency mode on","Low latency mode off"];
    var checked = 0;
    if(llEnabled == false) {
        checked = 1;
    }
    showDialog("Low latency mode", buttons,checked,checked,
        function(checked){
            if(checked == 0) {
                llEnabled = true;
            }
            else if(checked == 1) {
                llEnabled = false;
            }
            if(playerType == "mse-eme" && player != null) {
                player.player.updateSettings({'streaming': { "lowLatencyEnabled": llEnabled}});
            }
            showLLSettings();
     },function() {showLLSettings();});
}

function showTargetLatencySettings() {
    var buttons = ["1","2","3","4","5","6","7","8","9","10"];
    var checked = liveDelay -1;
    showDialog("Target latency(seconds)", buttons,checked,checked,
        function(checked){
            liveDelay = checked +1;
            if(playerType == "mse-eme" && player != null) {
                player.player.updateSettings({'streaming': { "liveDelay": liveDelay}});
            }
            showLLSettings(1);
     },function() {showLLSettings(1);});
}

function showMinimumDriftSettings() {
    var buttons = ["0.00","0.05","0.10","0.15","0.20","0.25","0.30","0.35","0.40","0.45","0.50"];
    var checked = 0;
    for(var i = 0;i<buttons.length;i++) {
        if(minimumDrift == parseFloat(buttons[i]) ) {
            checked = i;
            break;
        }
    }
    showDialog("Minimum Drift(seconds)", buttons,checked,checked,
        function(checked){
            minimumDrift = parseFloat(buttons[checked ]);
            if(playerType == "mse-eme" && player != null) {
                player.player.updateSettings({'streaming': { "liveCatchUpMinDrift": minimumDrift}});
            }
            showLLSettings(2);
     },function() {showLLSettings(2);});
}

function showCatchupRateSettings() {
    var buttons = ["0.00","0.05","0.10","0.15","0.20","0.25","0.30","0.35","0.40","0.45","0.50"];
    var checked = 0;
    for(var i = 0;i<buttons.length;i++) {
        if(catchupRate == parseFloat(buttons[i]) ) {
            checked = i;
            break;
        }
    }
    showDialog("Live catchup playbackrate(%)", buttons,checked,checked,
        function(checked){
            catchupRate = parseFloat(buttons[checked]);
            if(playerType == "mse-eme" && player != null) {
                player.player.updateSettings({'streaming': { "liveCatchUpPlaybackRate": catchupRate}});
            }
            showLLSettings(3);
     },function() {showLLSettings(3);});
}

function showStreamInfoSettings() {
    var buttons = ["Hide stream info","Show stream info"];
    var checked = 0;
    if(showStreamInfo == true) {
        checked = 1;
    }
    showDialog("Stream info", buttons,checked,checked,
        function(checked){
            clearInterval(streamInfoUpdater);
            if(checked == 0) {
                showStreamInfo = false;
                document.getElementById("streaminfo").addClass("hide");
            }
            else if(checked == 1) {
                showStreamInfo = true;
                document.getElementById("streaminfo").removeClass("hide");
                streamInfoUpdater = setInterval(updateStreamInfo, 1000);
            }
            
            showLLSettings(4);
     },function() {showLLSettings(4);});
}

function showParentalSettings() {
  var buttons = ["Parental block "+(parentalEnabled ? "(on)":"(off)"),"Minimum age ("+minimumAge+")","Set PIN"];
    showDialog("Parental settings", buttons,null,null,
        function(checked){
            if(checked == 0) {
                showParentalEnabledSettings();
            }
            else if(checked == 1) {
                 showMinimumAgeSettings();
            }
            else if(checked == 2) {
                 showPinSettings();
            }
     },function() {
      showSettings(1);
    });
}

function showMinimumAgeSettings() {
    var buttons = ["0","3","5","7","12","15","18","Off"];
    var checked = 0;
    if(minimumAge == 255) {
        checked = buttons.length-1;
    }
    else {
        var age = minimumAge.toString();
        for(var i = 0;i<buttons.length;i++) {
            if(age == buttons[i] ) {
                checked = i;
                break;
            }
        }
    }
    showDialog("Minimum age", buttons,checked,checked,
        function(checked){
            if(buttons[checked] == "Off") {
                minimumAge = 255;
            }
            else {
                minimumAge = parseInt(buttons[checked]);
            }
            setLocalStorage("parental_settings", {"parentalEnabled":parentalEnabled, "minimumAge":minimumAge, "parentalPin":parentalPin});
            showParentalSettings();
     },function() {showParentalSettings();});
}

function showParentalEnabledSettings() {
    var buttons = ["Parental block on","Parental block off"];
    var checked = 0;
    if(parentalEnabled == false) {
        checked = 1;
    }
    showDialog("Parental block", buttons,checked,checked,
        function(checked){
            if(checked == 0) {
                parentalEnabled = true;
            }
            else if(checked == 1) {
                parentalEnabled = false;
            }
            setLocalStorage("parental_settings", {"parentalEnabled":parentalEnabled, "minimumAge":minimumAge, "parentalPin":parentalPin});
            showParentalSettings();
     },function() {showParentalSettings();});
}

function showPinSettings(keep,checked) {
  var stars = "****";  
  if(!keep) {
    pin1 = "";
    pin2 = "";
  }
  var buttons = ["Enter PIN:"+stars.substring(0,pin1.length),"Re-enter PIN:"+stars.substring(0,pin2.length),"Save PIN"];
  if(!checked) {
    checked = 0;
  }
  showDialog("Parental PIN", buttons,null,checked,
      function(checked){
          if(checked == 2) {
            if(pin1.length < 4) {
              showInfo("PIN too short!");           
              showPinSettings(true);
            }
            else if( pin1 != pin2) {
              showInfo("PIN codes do not match!");
              showPinSettings(true);
            }
            else {
              parentalPin = pin1;
              setLocalStorage("parental_settings", {"parentalEnabled":parentalEnabled, "minimumAge":minimumAge, "parentalPin":parentalPin});
              showParentalSettings();
            }
          }
          else {
            showPinSettings(true,checked);
          } 
   },
   function() {showParentalSettings();},
   function(keyCode,button) {
   
      if(keyCode == VK_BACK) {
           if(button == 0) {
              if(pin1.length == 0) {
                return false;
              }
              else {
                pin1 = pin1.substring(0,pin1.length-1);
                updateLabel(button,"Enter PIN:"+stars.substring(0,pin1.length));
                return true;
              }
           }
           else if(button == 1) {
              if(pin2.length == 0) {
                return false;
              }
              else {
                pin2 = pin2.substring(0,pin2.length-1);
                updateLabel(button,"Re-enter PIN:"+stars.substring(0,pin2.length));
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
       
         if(button == 0) {
            if(pin1.length < 4) {
              pin1 += num_key;
              updateLabel(button,"Enter PIN:"+stars.substring(0,pin1.length));
            }
         }
         else if(button == 1) {
             if(pin2.length < 4) {
              pin2 += num_key;
              updateLabel(button,"Re-enter PIN:"+stars.substring(0,pin2.length));
            }
         }
       }
      }
     }
    );
}

function showPlayerSettings() {
    var buttons = ["Native","Dash.js"];
    var checked = 0;
    if(playerType == "mse-eme") {
        checked = 1;
    }
    showDialog("DASH player settings", buttons,checked,checked,
        function(checked){
            if(checked == 0) {
                playerType = "html5";
            }
            else if(checked == 1) {
                playerType = "mse-eme";
            }
            setLocalStorage("player_settings", { "player":playerType});
            showSettings(2);
     },function() {showSettings(2);});
}

function showSubtitleSettings() {
    var subtitles = null;
    if(player) {
      subtitles = player.getSubtitles();
    }
    else {
      subtitles = getDVBTracks(broadcast.COMPONENT_TYPE_SUBTITLE);
    }
    var buttons = [];
    var checked = 0;
    for(var i = 0;i<subtitles.length;i++) {
        if(subtitles[i].current == true ) {
            checked = i;
        }
        buttons.push(subtitles[i].lang+(subtitles[i].type ? "("+subtitles[i].type+")" : ""));
    }
    showDialog("Subtitle track", buttons,checked,checked,
        function(checked){
            if(checked == subtitles.length-1) {
                if(player) {
                  player.selectSubtitleTrack(-1);
                }
                else {
                    var broadcastElement = supervisor ? supervisor : broadcast;
                    broadcastElement.unselectComponent(broadcast.COMPONENT_TYPE_SUBTITLE);
                }
            }
            else {
              if(player) {
                player.selectSubtitleTrack(checked);
              }
              else {
                selectDVBTrack(checked, broadcast.COMPONENT_TYPE_SUBTITLE) ;
              }
            }
            showSettings(8);

     },function() {showSettings(8);});
}

function showAudioSettings() {
    var audioTracks = null;
    if(player) {
      audioTracks = player.getAudioTracks();
    }
    else {
      audioTracks = getDVBTracks(broadcast.COMPONENT_TYPE_AUDIO);
    }
    var buttons = [];
    var checked = 0;
    for(var i = 0;i<audioTracks.length;i++) {
        if(audioTracks[i].current == true ) {
            checked = i;
        }
        buttons.push(audioTracks[i].lang+(audioTracks[i].type ?"("+audioTracks[i].type+")" : ""));
    }
    showDialog("Audio track", buttons,checked,checked,
        function(checked){
            if(player) {
              player.selectAudioTrack(checked);
            }
            else {
              selectDVBTrack(checked, broadcast.COMPONENT_TYPE_AUDIO) ;
            }
            showSettings(7);

     },function() {showSettings(7);});
}

function showAccessibleAudioSettings() {

    var buttons = ["Off","On"];
    var checked = 0;
    if(languages.accessibleAudio == true) {
        checked = 1;
    }
    showDialog("Accessible audio", buttons,checked,checked,
     function(checked){
        if(checked == 0) {
          languages.accessibleAudio = false;
        }
        else {
          languages.accessibleAudio = true;
        }
        setLocalStorage("languages", languages);
        showSettings(5);
     },function() {showSettings(5);});
}

function showDefaultAudioSettings() {

    var buttons = [];
    var checked = 0;
    var keys = Object.keys(dvb_i_language_list);
    buttons.push("None");
    for (var i = 0; i < keys.length; i++) {
        var val = dvb_i_language_list[keys[i]];
        if(keys[i] == languages.audioLanguage) {
           checked = i+1;
        }
        buttons.push(val);
    }
    showDialog("Default audio language", buttons,checked,checked,
     function(checked){
        if(checked > 0) {
          languages.audioLanguage = Object.keys(dvb_i_language_list)[checked-1];
        }
        else {
          languages.audioLanguage = undefined;
        }
        setLocalStorage("languages", languages);
        showSettings(4);
     },function() {showSettings(4);});
}


function showDefaultSubtitleSettings() {

    var buttons = [];
    
    var checked = -1;
    buttons.push("None");
    var keys = Object.keys(dvb_i_language_list);
    for (var i = 0; i < keys.length; i++) {
        var val = dvb_i_language_list[keys[i]];
        if(keys[i] == languages.subtitleLanguage) {
           checked = i+1;
        }
        buttons.push(val);
    }
    showDialog("Default subtitle language", buttons,checked,checked,
     function(checked){
        if(checked > 0) {
          languages.subtitleLanguage = Object.keys(dvb_i_language_list)[checked-1];
        }
        else {
          languages.subtitleLanguage = undefined;
        }
        setLocalStorage("languages", languages);
        showSettings(6);
     },function() {showSettings(6);});
}

function showUILanguageSettings() {
    var buttons = [];
    var checked = -1;
    var keys = i18n.getSupportedLanguages();
    for (var i = 0; i < keys.length; i++) {
        if(keys[i].lang == languages.ui_language) {
           checked = i;
        }
        buttons.push(keys[i].name);
    }
    showDialog("UI language", buttons,checked,checked,
     function(checked){
        languages.ui_language =  i18n.getSupportedLanguages()[checked].lang;
        setLocalStorage("languages", languages);
        for(var i = 0;i <	_menu_.items.length;i++) {
            _menu_.items[i].languageChanged();
        }
        var channel_obj = _menu_.getOpenChannel();
        document.getElementById("info_name").innerHTML =  getLocalizedText(channel_obj.titles,languages.ui_language).replace('&', '&amp;');
        showSettings(7);
     },function() {showSettings(7);});
}


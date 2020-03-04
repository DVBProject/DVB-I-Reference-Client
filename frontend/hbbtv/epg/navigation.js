var ANIMATION_DURATION = 300;

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
		var VK_EXIT = KeyEvent.VK_EXIT;
		var VK_MENU = KeyEvent.VK_MENU;
		var VK_VOLUP = KeyEvent.VK_VOLUP;
		var VK_VOLDN = KeyEvent.VK_VOLDN;
		var VK_CHANNEL_DOWN = KeyEvent.VK_CHANNEL_DOWN;
		var VK_CHANNEL_UP = KeyEvent.VK_CHANNEL_UP;
		var VK_REFRESH = KeyEvent.VK_REFRESH;
        /*
        var VK_REWIND = KeyEvent.VK_REW;
        var VK_FAST_FWD = KeyEvent.VK_FF;
        */
        var VK_TRACK_PREV = KeyEvent.VK_TRACK_PREV;
        var vk_TRACK_NEXT = KeyEvent.VK_TRACK_NEXT;
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
    var VK_FAST_FWD = 473;
    var VK_REWIND   = 412;
    
    var VK_HOME     = 771;
    var VK_END      = 35;
    var VK_BACK     = 461;
    var VK_TELETEXT = 113;
    
    // page up 427, page down 428
    
    var VK_TELETEXT = 459;
}

function registerKeyListener() {
    document.addEventListener('keydown', function(e) {
        if (onKey(e.keyCode)) {
            e.preventDefault();
        }
    }, false);
}

function registerKeys(mode) {
    var mask;
    // ui hidden, only red and green registered
    if (mode == 0) {
        mask = 0x1+0x2;
    } else {
        mask = 0x1+0x2+0x4+0x8+0x10+0x20+0x40+0x80+0x400;
    }
    try {
        var app = document.getElementById('appmgr').getOwnerApplication(document);
        var cfg = document.getElementById('oipfcfg');
        cfg.configuration.replaceUIElements([cfg.configuration.UI_TVMODE,cfg.configuration.UI_VOLUME,cfg.configuration.UI_MENU,cfg.configuration.UI_EPG]);
        var keys = [KeyEvent.VK_GUIDE,KeyEvent.VK_CHANNEL_UP,KeyEvent.VK_CHANNEL_DOWN,KeyEvent.VK_SUBTITLE,KeyEvent.VK_INFO,KeyEvent.VK_MENU];
        app.privateData.keyset.setValue(mask,keys);
        var cfg = document.getElementById('oipfcfg');
        cfg.configuration.replaceUIElements([cfg.configuration.UI_TVMODE,cfg.configuration.UI_VOLUME,cfg.configuration.UI_MENU,cfg.configuration.UI_EPG]);
    
    } catch (e2) {
    }
}
 
function onKey(keyCode)
{   
    idleTimeStart = new Date(new Date().getTime()+diffTime);
    if(!loading && !animating){        
        // Navigate in Dialog
        if(dialog && dialog.open){
            navigateDialog(keyCode);
            return true;
        }
        

        else if( (typeof(playerOpen) != "undefined") && (playerOpen)){
            navigatePlayer(keyCode);
        }
		
		if (keyCode == VK_BACK || keyCode == KeyEvent.VK_GUIDE ) {
			window.location = '../launcher/index.php?ch='+firstChannel;
			return true;
		}
        if (keyCode == KeyEvent.VK_SUBTITLE || keyCode == KeyEvent.VK_MENU) {
            window.location = "../portal_atlas/index.php";
            return true;
        }

        var focus = getFocus();
        switch (keyCode) {
            case 82:
            //case 403:

            case VK_RED:
                keyRed();
            break;
            

            case 406:
            case 66:

            case VK_BLUE:
                keyBlue();
            break;

            case KeyEvent.VK_INFO:
            case VK_ENTER: 
                keyEnter();
            break;

            case VK_RIGHT:
                keyRight();
            break;

            case VK_LEFT:
                keyLeft();
            break;

            case VK_DOWN:
                keyDown();
            break;

            case VK_UP:
                keyUp();
            break;

            case VK_PAUSE:
                pauseVideo();
            break;

            case VK_PLAY:
                keyPlay();
            break;

            case VK_STOP:
                clearVideo();

            case 34:
            case VK_FAST_FWD:
                keyFastFwd();
            break;

            case 33:
            case VK_REWIND:
                keyRewind();
            break;

            case VK_TRACK_PREV:
                keyTrackPrev();
            break;
            default:
                return false;
            }
        return true;
    }
}

function keyTrackPrev(){
    var loadableCids = [];
    for(var i = 0; i <= Math.min(cids.length-1, CHANNEL_BUFFER_SIZE-1); i++){
        loadableCids.push(cids[i]);
    }
    var datestr = _epg_.firstDay.getFullYear()+addZeroPrefix(_epg_.firstDay.getMonth()+1)+addZeroPrefix(_epg_.firstDay.getDate());
    setLoading(true);
    getData(datestr, loadableCids.toString(), _epg_.days, _epg_.lang, function(epg_response){
        if(epg_response.channels.length > 0){
            var nextChannel = null;
            _epg_.channels = [];
            _epg_.visibleChannels = [];
            for(var i = 0; i < epg_response.channels.length; i++){
                var channel = new Channel(epg_response.channels[i], "epgRow"+_epg_.cids.indexOf(epg_response.channels[i].id.toString()));
                if(i == 0){
                    nextChannel = channel;
                }
                _epg_.channels.push(channel);
                if(i < _epg_.numberOfVisibleChannels){
                    channel.visible = true;
                    _epg_.visibleChannels.push(channel);
                }
            }
            _epg_.populate(function(){
                var closest = nextChannel.getClosest(_epg_.activeItem);
                _epg_.setOpenChannel(nextChannel);
                _epg_.setActiveItem(closest);
                _epg_.handleArrows();
                setLoading(false);
            });
        }
        else{
            setLoading(false);
        }
    });
}

function keyTrackNext(){
    var loadableCids = [];
    for(var i = _epg_.cids.length-10; i <= _epg_.cids.length; i++){
        loadableCids.push(cids[i]);
    }
    var datestr = _epg_.firstDay.getFullYear()+addZeroPrefix(_epg_.firstDay.getMonth()+1)+addZeroPrefix(_epg_.firstDay.getDate());
    setLoading(true);
    getData(datestr, loadableCids.toString(), _epg_.days, _epg_.lang, function(epg_response){
        if(epg_response.channels.length > 0){
            var nextChannel = null;
            _epg_.channels = [];
            _epg_.visibleChannels = [];
            for(var i = 0; i < epg_response.channels.length; i++){
                var channel = new Channel(epg_response.channels[i], "epgRow"+_epg_.cids.indexOf(epg_response.channels[i].id.toString()));
                if(i == epg_response.channels.length-1){
                    nextChannel = channel;
                }
                _epg_.channels.push(channel);
                if(epg_response.channels.length-i <= _epg_.numberOfVisibleChannels){
                    channel.visible = true;
                    _epg_.visibleChannels.push(channel);
                }
            }
            _epg_.populate(function(){
                var closest = nextChannel.getClosest(_epg_.activeItem);
                _epg_.setOpenChannel(nextChannel);
                _epg_.setActiveItem(closest);
                _epg_.handleArrows();
                setLoading(false);
            });
        }
        else{
            setLoading(false);
        }
    });
}

function keyRed(){
    var buttons = [];
    var day = curTime;
    for(var i = -3; i < 8; i++){
        var dateobj = new Date(day.getTime() + (TWENTY_FOUR_HOURS*i));
        var datestr = "";
        datestr = dateobj.getDay();
        datestr += ", " + Number(dateobj.getDate()) + " " + dateobj.getMonth();
        buttons.push(datestr);
    }
    backstack.push(getFocus());
    showDialog("", buttons, function(checked){
        _epg_.dayIdx = checked;
        var prevFocus = backstack.pop();
         _epg_.changeDate();
    }, _epg_.dayIdx, 3);
}

function keyBlue(){
    window.location = '../launcher/index.php?ch='+_epg_.getOpenChannel().id;
}

function keyEnter(){

}

function keyRight(){
    var channel = _epg_.getOpenChannel();
    if(channel instanceof Channel){
        var currentProgram = _epg_.activeItem;
        if(currentProgram && _epg_.timelineend < currentProgram.end) {
            _epg_.timelineend   = new Date(_epg_.timelineend.getTime() + (1000 * 60 * 30));
            _epg_.timelinestart = new Date(_epg_.timelinestart.getTime() + (1000 * 60 * 30));
            _epg_.populatePrograms(function(){
                 _epg_.setActiveItem(currentProgram);
            });
        }
        else if(channel.visiblePrograms.last() != _epg_.activeItem){
            var idx = channel.visiblePrograms.indexOf(_epg_.activeItem);
            _epg_.setActiveItem(channel.visiblePrograms[idx+1]);
        }
        else{
            var currentProgram = _epg_.activeItem;
            var next = channel.nextProgram(currentProgram);
            if(next != null){
                // move forward 30 minutes or to the next program if it is not visible
                if(next.start.getTime() > _epg_.timelineend.getTime() + (1000 * 60 * 30) ) { 
                    _epg_.timelinestart = new Date(next.start.getTime() - (1000 * 60 * 30));
                    _epg_.timelineend = new Date(_epg_.timelinestart.getTime() + (1000 * 60 * 180));
                }
                else {
                    _epg_.timelineend   = new Date(_epg_.timelineend.getTime() + (1000 * 60 * 30));
                    _epg_.timelinestart = new Date(_epg_.timelinestart.getTime() + (1000 * 60 * 30));
                }
                _epg_.populatePrograms(function(){
                    if(currentProgram){
                        var next = channel.nextProgram(currentProgram);
                        if(next == null || !document.getElementById(next.element_id)){
                            next = currentProgram;
                        }
                        if(next instanceof Program){
                            _epg_.setActiveItem(next);
                        }   
                    }
                });
            }
             else if(_epg_.nextDayIsAvailable && _epg_.lastDay < _epg_.maxDay){
            // load the previous day
            var currentProgram = _epg_.activeItem;
            _epg_.loadNextDay(function(){
                if(currentProgram instanceof Program){
                    var prg = _epg_.getProgramByKeyValue("id", currentProgram.id)
                    if(prg){
                        _epg_.setActiveItem(prg);
                    }
                }
            });
        }

        }
       
    }
}

function keyLeft(){
    var channel = _epg_.getOpenChannel();
    if(channel instanceof Channel){
        var currentProgram = _epg_.activeItem;
        if(currentProgram && _epg_.timelinestart > currentProgram.start) {
            _epg_.timelineend   = new Date(_epg_.timelineend.getTime() - (1000 * 60 * 30));
            _epg_.timelinestart = new Date(_epg_.timelinestart.getTime() - (1000 * 60 * 30));
            _epg_.populatePrograms(function(){
                 _epg_.setActiveItem(currentProgram);
            });
        }
        else if(channel.visiblePrograms[0] != _epg_.activeItem){
            var idx = channel.visiblePrograms.indexOf(_epg_.activeItem);
            _epg_.setActiveItem(channel.visiblePrograms[idx-1]);
        }
        else{
            var previous = channel.previousProgram(currentProgram);
            if(previous != null){
                // move backward 30 minutes
                if( previous.end.getTime() < _epg_.timelineend.getTime() - (1000 * 60 * 30) ) { 
                    _epg_.timelinestart = new Date(previous.start.getTime() - (1000 * 60 * 30));
                    _epg_.timelineend = new Date(_epg_.timelinestart.getTime() + (1000 * 60 * 180));
                }
                else {
                    _epg_.timelineend   = new Date(_epg_.timelineend.getTime() - (1000 * 60 * 30));
                    _epg_.timelinestart = new Date(_epg_.timelinestart.getTime() - (1000 * 60 * 30));
                }
                _epg_.populatePrograms(function(){
                    if(currentProgram){
                        var previous = channel.previousProgram(currentProgram);
                        if(previous == null || !document.getElementById(previous.element_id)){
                            previous = currentProgram;
                        }
                        if(previous instanceof Program){
                            _epg_.setActiveItem(previous);
                        }
                    }
                });
            }
        else if(_epg_.previousDayIsAvailable && _epg_.firstDay > _epg_.minDay){
            // load the previous day
            _epg_.loadPreviousDay();
        }
        }
    }
}

function keyRewind(){

    var currChan = _epg_.getOpenChannel();
    var currChanIdx = _epg_.channels.indexOf(currChan);
    if(currChanIdx - 5 >= 0){
        var newVisibleChannels = _epg_.channels.slice(currChanIdx-5, currChanIdx - 5 + _epg_.numberOfVisibleChannels);
        _epg_.visibleChannels = newVisibleChannels;
        _epg_.populate(function(){
            var closest = _epg_.visibleChannels[0].getClosest(_epg_.activeItem);
            _epg_.setOpenChannel(_epg_.visibleChannels[0]);
            _epg_.setActiveItem(closest);
        });
    }
    else if(_epg_.channels[0].id.toString() != _epg_.cids[0]){
        var idx = cids.indexOf(_epg_.getOpenChannel().id.toString());
        var visibleIdx = _epg_.visibleChannels.indexOf(_epg_.getOpenChannel());
        var start_idx = Math.max(0, idx-visibleIdx-5);
        var loadableCids = cids.slice(start_idx, start_idx + CHANNEL_BUFFER_SIZE);
        var datestr = _epg_.firstDay.getFullYear()+addZeroPrefix(_epg_.firstDay.getMonth()+1)+addZeroPrefix(_epg_.firstDay.getDate());
        setLoading(true);
        getData(datestr, loadableCids.toString(), _epg_.days, _epg_.lang, function(epg_response){
            if(epg_response.channels.length > 0){
                var nextChannel = null;
                _epg_.channels = [];
                _epg_.visibleChannels = [];
                var visibleCount = 0;
                for(var i = 0; i < epg_response.channels.length; i++){
                    var channel = new Channel(epg_response.channels[i], "epgRow"+_epg_.cids.indexOf(epg_response.channels[i].id.toString()));
                    var channelCidIdx = _epg_.cids.indexOf(channel.id.toString());

                    _epg_.channels.push(channel);
                    if(i < _epg_.numberOfVisibleChannels){
                        _epg_.visibleChannels.push(channel);
                        if(visibleCount == visibleIdx){
                            nextChannel = channel;
                        }
                        visibleCount++;
                    }
                }
                _epg_.populate(function(){
                    var closest = nextChannel.getClosest(_epg_.activeItem);
                    _epg_.setOpenChannel(nextChannel);
                    _epg_.setActiveItem(closest);
                    _epg_.handleArrows();
                    setLoading(false);
                });
            }
            else{ setLoading(false); }
        });
    }

}

function keyFastFwd(){

    var currChan = _epg_.getOpenChannel();
    var currChanIdx = _epg_.channels.indexOf(currChan);
    if(currChanIdx+5+_epg_.numberOfVisibleChannels < _epg_.channels.length){
        var newVisibleChannels = _epg_.channels.slice(currChanIdx+5, currChanIdx+5+_epg_.numberOfVisibleChannels);
        _epg_.visibleChannels = newVisibleChannels;
        _epg_.setOpenChannel(_epg_.visibleChannels[0]);
        _epg_.populate(function(){
            var closest = _epg_.visibleChannels[0].getClosest(_epg_.activeItem);
            _epg_.setActiveItem(closest);
        });
    }
    else if(_epg_.channels.last().id.toString() != _epg_.cids.last()){
        var idx = _epg_.cids.indexOf(_epg_.getOpenChannel().id.toString());
        var visibleIdx = _epg_.visibleChannels.indexOf(_epg_.getOpenChannel());
        var start_idx = Math.min(cids.length-1-5, idx-visibleIdx + 5);
        var loadableCids = cids.slice(start_idx, start_idx + CHANNEL_BUFFER_SIZE);
        var datestr = _epg_.firstDay.getFullYear()+addZeroPrefix(_epg_.firstDay.getMonth()+1)+addZeroPrefix(_epg_.firstDay.getDate());
        setLoading(true);
        getData(datestr, loadableCids.toString(), _epg_.days, _epg_.lang, function(epg_response){
            if(epg_response.channels.length > 0){
                var nextChannel = null;
                _epg_.channels = [];
                _epg_.visibleChannels = [];

                var visibleCount = 0;
                for(var i = 0; i < epg_response.channels.length; i++){
                    var channel = new Channel(epg_response.channels[i], "epgRow"+_epg_.cids.indexOf(epg_response.channels[i].id.toString()));
                    var channelCidIdx = _epg_.cids.indexOf(channel.id.toString());
                    _epg_.channels.push(channel);
                    if(i < _epg_.numberOfVisibleChannels){
                        if(visibleCount == visibleIdx){
                            nextChannel = channel;
                        }
                        _epg_.visibleChannels.push(channel);
                        visibleCount++;
                    }
                }
                _epg_.populate(function(){
                    var closest = nextChannel.getClosest(_epg_.activeItem);
                    _epg_.setOpenChannel(nextChannel);
                    _epg_.setActiveItem(closest);
                    _epg_.handleArrows();
                    setLoading(false);
                });
            }
            else{
                setLoading(false);
            }
        });
    }
}

function keyDown(){
    var nextChannel = _epg_.getNextChannel();
    if(nextChannel && _epg_.activeItem){
        var closest = nextChannel.getClosest(_epg_.activeItem);

        if(closest){
            _epg_.getOpenChannel().open = false;
            nextChannel.open = true;
            _epg_.setActiveItem(closest);
            if(nextChannel.visible == false){
				_epg_.firstvisible_channel++; // TEMP FIX
                nextChannel.visible = true;
                _epg_.getFirstVisibleChannel().visible = false;
                CSSscrollDown(document.getElementById("epgRows"), nextChannel.element.offsetHeight + _epg_.channel_margin_bottom, ANIMATION_DURATION, null);
                CSSscrollDown(document.getElementById("channels"), nextChannel.element.offsetHeight + _epg_.channel_margin_bottom, ANIMATION_DURATION, null);
                _epg_.handleArrows();
            }
        }
    }
}

function keyUp(){
    var prevChannel = _epg_.getPreviousChannel();
    if(prevChannel && _epg_.activeItem){
        var closest = prevChannel.getClosest(_epg_.activeItem);
        if(closest){
            _epg_.getOpenChannel().open = false;
            prevChannel.open = true;
            _epg_.setActiveItem(closest);
            if(prevChannel.visible == false){
				_epg_.firstvisible_channel--;  // TEMP FIX
                prevChannel.visible = true;
                _epg_.getLastVisibleChannel().visible = false;
                CSSscrollUp(document.getElementById("epgRows"), prevChannel.element.offsetHeight + _epg_.channel_margin_bottom, ANIMATION_DURATION, null);
                CSSscrollUp(document.getElementById("channels"), prevChannel.element.offsetHeight + _epg_.channel_margin_bottom, ANIMATION_DURATION, null);
                _epg_.handleArrows();
            }
        }
    }
}


function CSSscrollDown(element, length, duration, callback){
    try{
        if(element != null){
            animating = true;
            element.style.top = element.getTop()-length + "px";
            setTimeout(function(){
                animating = false;
                if(typeof(callback) == "function"){
                    callback.call();
                }
            },duration);
        }
    }
    catch(e){
        console.log(e);
    }
}

function CSSscrollUp(element, length, duration, callback){
    if(element != null){
        animating = true;
        element.style.top = Number(element.getTop()+length) + "px";
        setTimeout(function(){
            animating = false;
            if(typeof(callback) == "function"){
                callback.call();
            }
        },duration);
    }
}

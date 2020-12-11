/**
 * HTML5 MSE-EME video player impelmentation for HbbTV
 * Video player class definition for MSE-EME player.
 * This version is supposed to use on PC with target browser Edge.
 * 
 *
 * @class VideoPlayerEME
 * @extends VideoPlayerBasic
 * @constructor
 */
 
function VideoPlayerEME(element_id, profile, width, height){
	console.log("VideoPlayerEME - Constructor");
	
	// Call super class constructor
	VideoPlayerBasic.call(this, element_id, profile, width, height);
}

VideoPlayerEME.prototype.createPlayer = function(){
	var self = this;
	try{
		this.video = $("<video id='video' data-dashjs-player=''></video>")[0];
        var subtitle = $("<div id='subtitles' ></div>")[0];
		this.element.appendChild( this.video );
		this.element.appendChild( subtitle );
		this.player = dashjs.MediaPlayer().create();
        this.player.initialize(this.video);
        this.player.setAutoPlay(true);
        this.player.attachTTMLRenderingDiv( document.getElementById("subtitles"));
		console.log( "video object created ", this.player );
	} catch( e ){
		console.log("Error creating dashjs video object ", e.description );
	}
	
	
	var player = this.video;
	
	player.addEventListener('error', function(e){
		self.setLoading(false);
		if( !self.video ){
			return;
		}
		try{
			var errorMessage = "undefined";
			switch( self.video.error.code ){
				case 1: /* MEDIA_ERR_ABORTED */ 
					errorMessage = "fetching process aborted by user";
					break;
				case 2: /* MEDIA_ERR_NETWORK */
					errorMessage = "error occurred when downloading";
					break;
				case 3: /* = MEDIA_ERR_DECODE */ 
					errorMessage = "error occurred when decoding";
					break;
				case 4: /* MEDIA_ERR_SRC_NOT_SUPPORTED */ 
					errorMessage = "audio/video not supported";
					break;
			}
			showInfo( "MediaError: " + errorMessage );
			
		} catch(e){
			console.log("error reading video error code");
			console.log(e.description);
		}
	} );
	
	player.addEventListener('play', function(){ 
		console.log("video play event triggered");
	} );
	
	player.addEventListener('seeked', function(){
		console.log("Seeked");
	});
	
	var canplay = false;
	player.addEventListener('canplay', function(){
		canplay = true;
		console.log("canplay");
		
	} );
	
	player.addEventListener('loadedmetadata', function(){
    var audio = self.player.getTracksFor("audio");
    if(languages.audioLanguage ) {
      var track = null;
      for(var i = 0;i < audio.length;i++) {
        if(audio[i].lang == languages.audioLanguage) {
          if(languages.accessibleAudio && arrayContains(audio[i].roles,"supplementary")) {
            self.player.setCurrentTrack(audio[i]);
            track = null;
            break;
          }
          else if(track == null) {
            track = audio[i];
          }
        }
      }
     if(track) {
         self.player.setCurrentTrack(track);
      }
    }
		console.log("loadedmetadata");
	} );
	
	player.addEventListener('loadstart', function(){
		console.log("loadstart");
		self.setLoading(true);
	} );
	
	addEventListeners( player, "waiting", function(e){ 
		console.log( e.type );
		self.setLoading(true);
	} );
	
	addEventListeners( player, "waiting stalled suspend", function(e){ 
		console.log( e.type );
	} );
	
	addEventListeners( player, 'playing pause emptied', function(e){
		self.setLoading(false);
		console.log( e.type );
	} );
	
	
	player.addEventListener('ended emptied error', function(){
		self.setLoading(false);
	} );
	
	player.addEventListener('progress', function( e ){
		
	} );
	
	player.addEventListener('pause', function(){
		self.setLoading(false);
	} );
	
	player.textTracks.addEventListener('addtrack', function(evt){
		var track = evt.track;
		
		track.onerror = function(){
			console.log("track error: ", arguments );
		};
		
		track.onload = function(){
			console.log("track loaded: ", arguments );
		};
		
		
		console.log("at addtrack nth track: " + this.length + " : set up cuechange listeners", track);
    if(languages.subtitleLanguage && track.language == languages.subtitleLanguage) {
      for(var i = 0;i < this.length;i++) {
        if(this[i] == track) {
         self.player.setTextTrack(i);
         break;
        }
      }
    }
		
		console.log("text track ", track);
		track.oncuechange = function(evt) {
			if( this.kind == "metadata" ){
			
				showInfo("cuechange! kind=" + this.kind);
				
				try{
					var cuelist = this.activeCues;
					if ( cuelist && cuelist.length > 0) {
						console.log("cue keys: ",  Object.keys( cuelist[0] ) ); 
						var info = "";
						$.each( cuelist, function(c, cue){
							
							// try read text attribute
							if( cue.text ){
								showInfo( cue.text );
							}
							
							var cueValue = arrayBufferToString( cue.data );
							//console.log( "cues["+c+"].data ("+ cue.data.constructor.name+") = " + cueValue ); 
							console.log( "startTime : " + cue.startTime + ", endTime : " + cue.endTime + " Data: " + cueValue );
							info +=  "cue: '" + cueValue + "' start : " + cue.startTime + ", ends : " + cue.endTime + "<br/>";
							
						} );
						
						showInfo( info, 999 );
					}
					else{
						showInfo("Metadata cue exit", 1);
					}
				} catch(e){
					console.log("error Reading cues", e.message );
				}
				
			}
			else{
				console.log("cue event " + this.kind + " received");
			}
		};
		
		console.log( "oncuechange function set" );
	} );
	
	return true;
};

VideoPlayerEME.prototype.setURL = function(url){
	console.log("setURL(",url,")");
	console.log("player.attachSource(url)");
	this.player.attachSource(url);
	// create id for video url
	this.videoid = url.hashCode();
	return;
};

VideoPlayerEME.prototype.checkAds = function(){
	//console.log("checkAds");
	if( this.adBreaks ){
		
		if( this.video == null ){
			// video has stopped just before new ad checking. exit player
			this.clearVideo();
			return;
		}
		
		var position =  Math.floor( this.video.currentTime );
		var self = this;
		$.each( this.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == position ){
				console.log("found ad break at position " + position);
				adBreak.played = true;
				self.getAds( adBreak ); // play ads on current second
				return false;
			}
		} );
	}
};

VideoPlayerEME.prototype.prepareAdPlayers = function(){
	
	// if ad players are prepared do nothing
	if( $("#ad1")[0] && $("#ad2")[0] ){
		console.log("ready to play ads");
		return;
	}
	var self = this;
	// create new adPlayers
	self.adPlayer = [ $("<video id='ad1' type='video/mp4' preload='auto'></video>")[0], $("<video id='ad2' type='video/mp4' preload='auto'></video>")[0] ];
	self.element.appendChild( self.adPlayer[0] );
	self.element.appendChild( self.adPlayer[1] );
	self.element.appendChild( $("<div id='adInfo'></div>")[0] );
	
	console.log("html5 ad-video objects created");
	
	var adEnd = function(e){
		self.setLoading(false);
		
		console.log("ad ended. adCount="+ self.adCount + " adBuffer length: " + self.adBuffer.length );
		console.log( e.type );
		var player = $(this);
		if( self.adCount < self.adBuffer.length ){
			player.addClass("hide");
			
			self.playAds();
			
		}
		else{
			// no more ads, continue content
			console.log("No more ads, continue content video");
			self.onAdBreak = false;
			player.addClass("hide"); // hide ad video
			$("#adInfo").removeClass("show");
			
			if( self.video == null ){
				// video has stopped during ads. exit
				self.clearVideo();
				return;
			}
			
			if( self.firstPlay ){
				self.startVideo( self.live );
			}
			else{
				self.video.play();
			}
			$(self.video).removeClass("hide"); // show content video
		}
		
	};
	
	var onAdPlay = function(){
		console.log("ad playing");
		self.setLoading(false);
	};
	
	var onAdProgress = function(e){};
	
	var onAdTimeupdate = function(){
		var timeLeft = Math.floor( this.duration - this.currentTime );
		if( timeLeft != NaN ){
			$("#adInfo").addClass("show");
			$("#adInfo").html("Ad " + self.adCount + "/" + self.adBuffer.length + " (" + timeLeft + "s)" );
		}
	};
	
	$.each( self.adPlayer, function(i, player){
		addEventListeners( player, 'ended', adEnd );
		addEventListeners( player, 'playing', onAdPlay );
		addEventListeners( player, 'timeupdate', onAdTimeupdate );
		addEventListeners( player, 'progress', onAdProgress );
	} );
};

VideoPlayerEME.prototype.getAds = function( adBreak ){
	this.onAdBreak = true; // disable seeking
	this.adCount = 0;
	try{
		this.video.pause();
	} catch(e){
		console.log("content video pause failed. May be not initialized yet (prerolls)");
	}
	var self = this;
	console.log("get ads breaks=" + adBreak.ads);
	$.get( "../getAds.php?breaks=" + adBreak.ads, function(ads){
		self.adBuffer = ads;
		console.log( "Got " + ads.length + " ads");
		
		self.prepareAdPlayers();
		
		self.playAds();
		
	}, "json" );
};

VideoPlayerEME.prototype.playAds = function(){
	this.onAdBreak = true; // disable seeking
	try{
		this.video.pause();
	} catch(e){
		console.log("content video pause failed. May be not initialized yet (prerolls)");
	}
	$(this.video).addClass("hide");
	
	var self = this;
	
	var activeAdPlayer = self.adPlayer[ self.adCount % 2 ];
	var idleAdPlayer = self.adPlayer[ (self.adCount + 1) % 2 ];
	
	// for the first ad, set active ad src. Later the active players url is always set and preload before the player is activated
	if( self.adCount == 0 ){
		activeAdPlayer.src = self.adBuffer[ self.adCount ];
	}
	
	self.adCount++;
	
	// set next ad url to idle player and preload it
	if( self.adBuffer.length > self.adCount ){
		idleAdPlayer.src = self.adBuffer[ self.adCount ];
		idleAdPlayer.load();
	}
	
	activeAdPlayer.play();
	$( activeAdPlayer ).removeClass("hide");
	$( idleAdPlayer ).addClass("hide");
};


VideoPlayerEME.prototype.sendLicenseRequest = function(callback){
	console.log("sendLicenseRequest()");
	
	/***
		Create DRM object and container for it
	***/

	this.drm.successCallback = callback;
	var self = this;
	
	if( this.drm.system == "playready" ){
		self.player.setProtectionData({
			"com.microsoft.playready": { "serverURL": self.drm.la_url }
		});
	}
	else if( this.drm.system == "marlin" ){
		// Not supported
	}
	else if( this.drm.system == "clearkey" ){
		self.player.setProtectionData({
			"org.w3.clearkey": { 
				"serverURL": self.drm.la_url
				/* "clearkeys": { "EjQSNBI0EjQSNBI0EjQSNA" : "QyFWeBI0EjQSNBI0EjQSNA" } */
			}
		});
	} else if( this.drm.system == "widevine" ){
		self.player.setProtectionData({
			"com.widevine.alpha": { "serverURL": self.drm.la_url }
		});		
	} else {
		var protData={};
		protData[self.drm.system] = { "serverURL": self.drm.la_url };
		self.player.setProtectionData(protData);
	}
	
	self.drm.ready = true;
	
	if( callback ){
		callback();
	}
};


VideoPlayerEME.prototype.startVideo = function( isLive ){
	console.log("startVideo()");
	
	// reset progress bar always

	
	this.subtitleTrack = false;
	var self = this;
	this.onAdBreak = false;
	this.firstPlay = true;
	
	if( isLive ){
		self.live = true;
	}
	else{
		self.live = false;
	}
	
	if( !this.subtitles ){
		this.subtitleTrack = false;
	}
	try{
		if( !self.video ){
			console.log("populate player and create video object");
			self.populate();
			self.createPlayer();
			self.setEventHandlers();
		}
	}
	catch(e){
		console.log( e.message );
		console.log( e.description );
	}

    console.log("remove hidden");
	self.element.removeClass("hidden");
	self.visible = true;
	self.setFullscreen(true);

	
	// first play preroll if present
	var playPreroll = false;
	// check prerolls on first start
	if( self.adBreaks ){
		$.each( self.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == "preroll" ){
				console.log("play preroll");
				adBreak.played = true;
				playPreroll = true;
				self.getAds( adBreak );
				return false;
			}
		});
		if( playPreroll ){
			return; // return startVideo(). after prerolls this is called again
		}
	}
	
	try{	/*
		self.element.removeClass("hidden");
		self.visible = true;
		
		console.log("video.play()")
		self.video.play();

		self.setFullscreen(true);
		self.displayPlayer(5);
		*/
		
		
		
		self.element.removeClass("hidden");
		self.visible = true;
		console.log("video.play()");
		self.video.play();
		self.setFullscreen(true);
		self.displayPlayer(5);
	}
	catch(e){
		console.log( e.message );
		console.log( e.description );
	}
};


VideoPlayerEME.prototype.stop = function(){
	var self = this;
	if(this.video == null) {
        return;
    }


	this.onAdBreak = false;
	// if video not exist
	if( !self.video ){
		self.clearVideo();
		return;
	}
	try{
		self.video.pause();
		console.log("video.pause(); succeed");
		self.clearVideo();
		console.log("clearVideo(); succeed");
	}
	catch(e){
		console.log("error stopping video");
		console.log(e.description);
	}
};

VideoPlayerEME.prototype.play = function(){
	var self = this;
	try{
		self.video.play();
		self.displayPlayer(5);
	}
	catch(e){
		console.log(e);
	}
};

VideoPlayerEME.prototype.clearVideo = function(){
	var self = this;
    console.log("hide");
	self.element.addClass("hidden");
	self.visible = false;
	try{
		if(self.video){
			self.video.pause();
            this.player.setURL(null);
			$( "#video" ).remove(); // clear from dom
            $( "#subtitles" ).remove(); // clear from dom
			this.video = null;
		}
        this.player.reset();
	}
	catch(e){
		console.log("Error at clearVideo()");
		console.log( e.description );
	}
	
    this.player = null;
	this.clearAds();
	
	this.subtitles = null;
};

VideoPlayerEME.prototype.clearAds = function(){
	try{
		if( self.adPlayer ){
			self.adPlayer[0].stop();
			self.adPlayer[1].stop();
			$( self.adPlayer[0] ).addClass("hide");
			$( self.adPlayer[1] ).addClass("hide");
			self.adPlayer[0].src = "";
			self.adPlayer[1].src = "";
			
			self.adPlayer = null;
			self.onAdBreak = false;
			self.adBreaks = null;
			self.adBuffer = null;
			self.adCount = 0;
		}
		$( "#ad1" ).remove(); // clear from dom
		$( "#ad2" ).remove(); // clear from dom
		$( "#adInfo" ).remove(); // clear from dom
	}
	catch(e){
		console.log("Error at clearVideo()");
		console.log(e.description);
	}
};

VideoPlayerEME.prototype.isFullscreen = function(){
	var self = this;
	return self.fullscreen;
};

VideoPlayerEME.prototype.isPlaying = function(){
	return ( this.video && !this.video.paused ); // return true/false
};

VideoPlayerEME.prototype.getSubtitles = function() {
    var current = null;
    if(this.player.isTextEnabled()) {
        current = this.player.getCurrentTrackFor("fragmentedText");
    }
    var subtitles = this.player.getTracksFor("fragmentedText");
    var list = [];
    if(subtitles.length > 0) {
      for(var i = 0;i < subtitles.length;i++) {
          var subtitletrack = {};
          if(subtitles[i] == current) {
              subtitletrack.current = true;
          }
          subtitletrack.lang = subtitles[i].lang;
          subtitletrack.type = subtitles[i].roles.join(",");
          list.push(subtitletrack);
     }
     var subtitletrack = {};
     subtitletrack.lang = "Subtitles Off";
     if(current == null) {
         subtitletrack.current = true;
     }
     list.push(subtitletrack);
   }
   return list;
};

VideoPlayerEME.prototype.selectSubtitleTrack = function(track) {
    this.player.setTextTrack(track);
};

VideoPlayerEME.prototype.getAudioTracks = function() {
    var current = null;
    if(this.player.isTextEnabled()) {
        current = this.player.getCurrentTrackFor("audio");
    }
    var audioTracks = this.player.getTracksFor("audio");
    var list = [];
    for(var i = 0;i < audioTracks.length;i++) {
        var audiotrack = {};
        if(audioTracks[i] == current) {
            audiotrack.current = true;
        }
        audiotrack.lang = audioTracks[i].lang;
        audiotrack.type = audioTracks[i].roles.join(",");
        list.push(audiotrack);
   }
   return list;
};

VideoPlayerEME.prototype.selectAudioTrack = function(track) {
    var audio = this.player.getTracksFor("audio");
    this.player.setCurrentTrack(audio[track]);
};


Element.prototype.lastProgram = function(){
	for(var i = this.childNodes.length-1; i >= 0; i--){
		if(this.childNodes[i].hasClass("program")){
			return this.childNodes[i];
		}
	}
	return null;
}

Element.prototype.firstProgram = function(){
	var firstprogram = null;
	for(var i = 0; i < this.childNodes.length; i++){
		if(this.childNodes[i].hasClass("program")){
			firstprogram = this.childNodes[i];
			break;
		}
	}
	return firstprogram;
}

function htmlDecode(value) {
  return $("<textarea/>").html(value).text();
} 
function loadJSON(url, callback) {   
	try{
	    var xmlhttp = new XMLHttpRequest();
	    xmlhttp.overrideMimeType("application/json");
		xmlhttp.open('GET', url, true); 
		xmlhttp.onreadystatechange = function () {
	        if (this.readyState == 4){
	        	if(this.status == "200") {
	            	callback(this.responseText);
	            }
	           	else{
	        		setLoading(false);
	        	}
	        }
	    };
	    xmlhttp.send(null);  
	}
	catch(e){
		setLoading(false);
		console.log(e);
	}
}



function getProgramById(id){
	for(var channel in epgdict){
		for(var program in epgdict[channel]){
			if(epgdict[channel][program]["id"].toString() == id.toString()){
				return epgdict[channel][program];
			}
		}
	}
	return null;
}

function dateObjectToString(dateobj){
	var str = "";
	str += dateobj.getFullYear() + "-";
	str += addZeroPrefix(Number(dateobj.getMonth()+1)) + "-";
	str += addZeroPrefix(dateobj.getDate()) + "T";
	str += addZeroPrefix(dateobj.getHours()) + ":";
	str += addZeroPrefix(dateobj.getMinutes()) + ":";
	str += addZeroPrefix(dateobj.getSeconds());
	return str;
}

function focusProgram(programID){
	var programs = document.getElementsByClassName("program");
	for(var i = 0; i < programs.length; i++){
		if(programs[i].getAttribute("data-programid") == programID){
			if(focusElement(programs[i])){
				scrollFocusToCenter();
				return true;
			}
		}
	}
	return false;
}

function setLoading(load){
	if(load){
		document.getElementById("loading").removeClass("hide");
		document.getElementById("loading").addClass("show");
	}
	else{
		document.getElementById("loading").removeClass("show");
		document.getElementById("loading").addClass("hide");
	}
	loading = load;
}

function getElementByAttributeValue(elementArray, attributeName, attributeValue){
	try{
		for(var i = 0; i < elementArray.length; i++){
			if(elementArray[i].getAttribute(attributeName) == attributeValue){
				return elementArray[i];
			}
		}	
		return null;
	}
	catch(e){
		console.log(e);
	}
}

function convertToDateObject(datestr){
	if(datestr != null){
		return new Date(
			datestr.substring(0,4),
			Number(datestr.substring(5,7))-1,
			datestr.substring(8,10),
			datestr.substring(11,13),
			datestr.substring(14,16),
			datestr.substring(17,19),
			0
		);
	}
	return null;
}

function imageFadeIn(){
	// if image not complete (not in browser cache make the div appear after image is ready)
	if( ! $(this)[0].complete )
	{
		var fadeobject = $(this);
		fadeobject.css("opacity", "0.5");
		fadeobject.addClass("transition03all");
		$(this).load( function(){  
			fadeobject.css("opacity", "1"); 
		} );
		$(this).error( function() 
		{ 
			missingImages[ $(this).attr('src') ] = true;  
			console.log("Image not found: " + $(this).attr('src') );
			$(this).attr('src', "http://static.mtvkatsomo.fi/cms/images/33017030_550x310.jpg");
			fadeobject.css("opacity", "1");			
		});
	}
}

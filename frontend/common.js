
function createElement(tag, id, classes, attributes){
	var element = document.createElement(tag);
	if(id){
		element.setAttribute("id", id);
	}
	if(classes){
		if(typeof(classes) == "string"){
			element.className = classes;
		}
		else if(Array.isArray(classes)){
			element.className = classes.join(" ");
		}
	}
	if(attributes){
		for(var attributeName in attributes){
			if(typeof(attributeName) != "function"){
				element.setAttribute(attributeName, attributes[attributeName]);
			}
		}
	}
	return element;
};

Date.prototype.format = function(template){
	/****************************************************************************************

	|-----------------------------------------------------------------------------------------------------------------------------------|
	|	character 	description																	example  				 				|
	|-----------------------------------------------------------------------------------------------------------------------------------|
	|	d 			Day of the month, 2 digits with leading zeros								01 to 31				 				|
	|	D           A textual representation of a day, three letters							Mon through Sun 		 				|
	|	j 			Day of the month without leading zeros										1 to 31					 				|
	|	l 			A full textual representation of the day of the week						Sunday through Saturday	 				|		
	|	S 			English ordinal suffix for the day of the month, 2 characters				st, nd, rd or th		 				|		
	|	w 			Numeric representation of the day of the week								0 through 6 			 				|		
	|	z 			The day of the year (starting from 0)										0 through 365			 				|
	|	F 			A full textual representation of a month, such as January					January through December 				|		 
	|	m 			Numeric representation of a month, with leading zeros						01 through 12 			 				|		 
	|	M 			A short textual representation of a month, three letters					Jan through Dec 		 				|		 
	|	n 			Numeric representation of a month, without leading zeros					1 through 12 			 				|		 
	|	t 			Number of days in the given month											28 through 31			 				|
	|	L 			Whether it's a leap year		 											1 if it is a leap year, 0 otherwise.	|		
	|	Y 			A full numeric representation of a year, 4 digits		 					Examples: 1999 or 2003					|
	|	y 			A two digit representation of a year		 								Examples: 99 or 03						|
	|	a 			Lowercase Ante meridiem and Post meridiem		 							am or pm								|
	|	A 			Uppercase Ante meridiem and Post meridiem		 							AM or PM								|
	|	g 			12-hour format of an hour without leading zeros		 						1 through 12 							|
	|	G 			24-hour format of an hour without leading zeros		 						0 through 23 							|
	|	h 			12-hour format of an hour with leading zeros		 						01 through 12 							|
	|	H 			24-hour format of an hour with leading zeros		 						00 through 23 							|
	|	i 			Minutes with leading zeros		 											00 through 59 							|
	|	s 			Seconds with leading zeros		 											00 through 59 							|
	|	v			Milliseconds 		 														654 									|
	|	O			Difference to Greenwich time (GMT) in hours 								+0200 									|
	|	P			Difference to Greenwich time (GMT) with colon between hours and minutes 	+02:00 									|
	|	U			Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT) 					1486368408								|
	|-----------------------------------------------------------------------------------------------------------------------------------|

	*****************************************************************************************/

	var date = this;
	var dict = {
		"d": addZeroPrefix(date.getDate()),
		"D": date.getDayString().substring(0,3),
		"j": date.getDate(),
		"l": date.getDayString(),
		"S": date.getDate().ordinalNumberSuffix(),
		"w": date.getDay(),
		"z": date.getDayOfYear(),
		"t": getNumberOfDaysInMonth(date.getMonth(), date.getFullYear()),
		"F": date.getMonthString(),
		"m": addZeroPrefix(date.getMonth()+1),
		"M": date.getMonthString().substring(0,3),
		"n": date.getMonth()+1,
		"L": (getNumberOfDaysInMonth(1, date.getFullYear()) == 29) ? 1 : 0,
		"Y": date.getFullYear(),
		"y": date.getFullYear().toString().substring(2),
		"a": (date.getHours() > 12) ? "pm" : "am",
		"A": (date.getHours() > 12) ? "PM" : "AM",
		"g": ((date.getHours() % 12) == 0) ? 1 : date.getHours() % 12,
		"G": date.getHours(),
		"h": ((date.getHours() % 12) == 0) ? "01" : addZeroPrefix(date.getHours() % 12),
		"H": addZeroPrefix(date.getHours()),
		"i": addZeroPrefix(date.getMinutes()),
		"s": addZeroPrefix(date.getSeconds()),
		"v": addZeroPrefix(date.getMilliseconds()),
		"O": function(){
			var sign = (date.getTimezoneOffset() < 0) ? "-" : "+";
			var hours = addZeroPrefix(date.getTimezoneOffset() * -1 / 60);
			var minutes = addZeroPrefix(date.getTimezoneOffset() % 60);
			return sign + hours + minutes;
		},
		"P": function(){
			var sign = (date.getTimezoneOffset() < 0) ? "-" : "+";
			var hours = addZeroPrefix(date.getTimezoneOffset() * -1 / 60);
			var minutes = addZeroPrefix(date.getTimezoneOffset() % 60);
			return sign + hours + ":" + minutes;
		},
		"U": Math.round(new Date().getTime() / 1000)
	};

	var result = "";
	for(var i = 0; i < template.length; i++){
		if(dict[template[i]] != null){
			if(typeof(dict[template[i]]) == "function"){
				result += dict[template[i]].call();
			}
			else{
				result += dict[template[i]].toString();
			}
		}
		else{
			result += template[i];
		}
	}
	return result;
}

Date.prototype.getDayString = function(){
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	return days[this.getDay()];
}

Date.prototype.getMonthString = function(){
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	return months[this.getMonth()];
}

Number.prototype.ordinalNumberSuffix = function(){
	var numStr = this.toString();
	var lastNumber = Number(numStr.charAt(numStr.length-1));
	var suffix = "th";
	if(this < 10 || this > 20){
		switch(lastNumber){
			case 3:
				suffix = "rd";
			break;

			case 2:
				suffix = "nd";
			break;

			case 1:
				suffix = "st";
			break;
		}
	}
	return suffix;
}

Date.prototype.create12HourTimeString = function(){
	var hour = this.getHours();
	var hour12 = hour % 12;
	var minutes = this.getMinutes();
	return (hour12 ? hour12 : 12) + ("."+addZeroPrefix(minutes)) + ((hour >= 12) ? "PM" : "AM");
}

Date.prototype.getDayOfYear = function(){
	var year = this.getFullYear();
	var month = this.getMonth();
	var date = this.getDate();
	var dayOfYear = 0;
	for(var i = 0; i < month; i++){
		dayOfYear += getNumberOfDaysInMonth(i,year);
	}
	dayOfYear += date;
	return dayOfYear;
}

function getNumberOfDaysInMonth(month, year){
	switch(month){
		case 0:
		case 2:
		case 4:
		case 6:
		case 7:
		case 9:
		case 11:
			return 31;
		break;

		case 3:
		case 5:
		case 8:
		case 10:
			return 30;
		break;

		case 1:
			var leapYear = ((year % 400) == 0) || (year % 4 == 0 && year % 100 != 0);
			var days = (leapYear) ? 29 : 28;
			return days;
		break;
	}
}

HTMLCollection.prototype.hasClass = function(cls){
	for(var i = 0; i < this.length; i++){
		if(!this[i].hasClass(cls)){
			return false;
		}
	}
	return true;
}

NodeList.prototype.hasClass = function(cls){
	for(var i = 0; i < this.length; i++){
		if(!this[i].hasClass(cls)){
			return false;
		}
	}
	return true;
}

Element.prototype.hasClass = function(cls) {
	try{
		if(this != null){
	    	return (' ' + this.className + ' ').indexOf(' ' + cls + ' ') > -1;
	    }
	}
	catch(e){
		console.log(e);
	}
}

function UTCDate(){
	return new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
}

Number.prototype.toOrdinalNumber = function(){
	var numStr = this.toString();
	var lastNumber = Number(numStr.charAt(numStr.length-1));
	var suffix = "th";
	if(numStr.length > 1){
		var secondLastNumber = Number(numStr.charAt(numStr.length-2));
		if(secondLastNumber == 1){
			suffix = "th";
			return this.toString() + suffix;
		}
	}
	switch(lastNumber){
		case 3:
			suffix = "rd";
		break;

		case 2:
			suffix = "nd";
		break;

		case 1:
			suffix = "st";
		break;
	}
	return this.toString() + suffix;
}

Date.prototype.create12HourTimeString = function(){
	var hour = this.getHours();
	var hour12 = hour % 12;
	var minutes = this.getMinutes();
	return (hour12 ? hour12 : 12) + (":"+addZeroPrefix(minutes)) + ((hour >= 12) ? "PM" : "AM");
}

Date.prototype.create24HourTimeString = function(){
	var hour = this.getHours();
	var minutes = this.getMinutes();
	return addZeroPrefix(hour) + ":" + addZeroPrefix(minutes);
}

Date.prototype.createDateString = function(){
	var dayIdx = this.getDay();
	var date = this.getDate();
	var month = this.getMonth()+1;
	var dayStr = DAYS_ENGL[dayIdx].toUpperCase().substring(0,3);
	return dayStr + ", " + month + "/" + date;
}

/* String extensions */
String.prototype.replaceAll = function(replaceable, replacement){
	var result = this;
	while(result.indexOf(replaceable) >= 0){
		result = result.replace(replaceable, replacement);
	}
	return result;
}

String.prototype.toUTCDate = function(){
	return convertToUTCDateObject(this);
}

String.prototype.toDate = function(){
	return convertToDateObject(this);
}

String.prototype.contains = function(pattern){
	return this.indexOf(pattern) > -1;
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

function arrayContains(array,value) {
  console.log(array,value);
  for(var i = 0;i<array.length;i++) {
    if(array[i] == value) {
      console.log("found!");
      return true;
    }
  }
  console.log("not found!");
  return false;
}
function getMenuByName(menu, name){
    for(var item in menu["items"]){
        if(menu["items"][item]["name"] != null && menu["items"][item]["name"] == name){
            return menu["items"][item];
        }
    }
}

function convertToUTCDateObject(datestr){
    if(datestr != null){
        return new Date(Date.UTC(
            datestr.substring(0,4),
            Number(datestr.substring(5,7))-1,
            datestr.substring(8,10),
            datestr.substring(11,13),
            datestr.substring(14,16),
            datestr.substring(17,19),
            0)
        );
    }
    return null;
}

NodeList.prototype.getByAttributeValue = function(attr, value){
	var result = [];
	for(var i = 0; i < this.length; i++){
		if(this[i].getAttribute(attr) == value){
			result.push(this[i]);
		}
	}
	return result;
}

HTMLCollection.prototype.getByAttributeValue = function(attr, value){
	var result = [];
	for(var i = 0; i < this.length; i++){
		if(this[i].getAttribute(attr) == value){
			result.push(this[i]);
		}
	}
	return result;
}

NodeList.prototype.getByClass = function(cls){
	var result = [];
	for(var i = 0; i < this.length; i++){
		if(hasClass(this[i], cls)){
			result.push(this[i]);
		}
	}
	return result;
}

HTMLCollection.prototype.getByClass = function(cls){
    var result = [];
    for(var i = 0; i < this.length; i++){
        if(hasClass(this[i], cls)){
            result.push(this[i]);
        }
    }
    return result;
}


NodeList.prototype.rangeFromTo = function(first, last){
	var result = [];
	var firstFound = false;
	for(var i = 0; i < this.length; i++){
		if(this[i] == first || firstFound){
			firstFound = true;
			result.push(this[i]);
		}
		if(this[i] == last && firstFound){
			return result;
		}
	}
	return [];
}

/* Element extensions */

Element.prototype.setImageURL = function(success, error, errorFunction){
	var self = this;
	if(self.tagName.toLowerCase() == "img"){
		if(success != null && success.length > 0){
			var img = new Image();
			img.onload = function(){
				self.setAttribute("src", success);
			}
			img.onerror = function(){
				console.log(success);
				console.log("error");
				console.log(errorFunction);
				self.setAttribute("src", error);
				if(errorFunction && typeof(errorFunction) == "function"){
					errorFunction.call();
				}
			}
			img.src = success;
		}
		else{
			self.setAttribute("src", error);
			if(errorFunction && typeof(errorFunction) == "function"){
				errorFunction.call();
			}
		}
	}
	else{
		console.log("setImageURL: The element is not img!");
		console.log(self);
	}
}

Element.prototype.siblingsByClass = function(cls){
    var nodes = this.parentNode.childNodes;
    var result = [];
    for(var i = 0; i < nodes.length; i++){
        if(nodes[i].hasClass(cls)){
            result.push(nodes[i]);
        }
    }
    return result;
}

Element.prototype.addClass = function(cls, callback){
    try{
        if( !hasClass(this, cls) ){
            if(this.className.length > 0){
                this.className += " "+cls;
            }
            else{
                this.className = cls;
            }
            this.className = this.className.trim();
        }
       	if(typeof(callback) == "function"){
            callback.call();
        }
    }
    catch(e){
        console.log(e);
    }
}

Element.prototype.removeClass = function(cls, callback){
    try{
        /*if(hasClass(this, cls) ){
            if(this.className.length > 0){
                this.className = this.className.replace(cls, "");
                this.className.replaceAll("  ", " ").trim()
            }
        }*/
	this.classList.remove(cls);
	if(typeof(callback) == "function"){
		callback.call();
	}
    }
    catch(e){
        console.log(e);
    }
}

Element.prototype.hasClass = function(cls) {
	try{
		if(this != null){
	    	return (' ' + this.className + ' ').indexOf(' ' + cls + ' ') > -1;
	    }
	}
	catch(e){
		console.log(e);
	}
}
Element.prototype.hasID = function(id){
	try{
		if(this != null){
			return this == document.getElementById(id);
	    }
	}
	catch(e){
		console.log(e);
	}
}
Element.prototype.getIndex = function(){
	try{
		if(this.getAttribute("data-idx") != null){
			return Number(this.getAttribute("data-idx"));
		}
		return null;
	}
	catch(e){
		console.log(e);
	}
}
Element.prototype.getWidth = function(){
	if(!isNaN(parseInt(this.style.width))){
		return parseInt(this.style.width);
	}
	return this.offsetWidth;
}
Element.prototype.getLeft = function(){
	if(!isNaN(parseInt(this.style.left))){
		return parseInt(this.style.left);
	}
	return this.offsetLeft;
}
Element.prototype.getTop = function(){
	if(!isNaN(parseInt(this.style.top))){
		return parseInt(this.style.top);
	}
	return this.offsetTop;
}
Element.prototype.isLittleSiblingOf = function(bigsibling){
	if(bigsibling != null){
		var iter = bigsibling;
		while(iter != null && iter.previousSibling != null){
			if(iter == this){
				return true;
			}
			iter = iter.previousSibling;
		}
	}
	return false;
}
Element.prototype.isBigSiblingOf = function(littlesibling){
	if(littlesibling != null){
		var iter = littlesibling;
		while(iter != null && iter.nextSibling != null){
			if(iter == this){
				return true;
			}
			else{
				iter = iter.nextSibling;
			}
		}
	}
	return false;
}

Element.prototype.getSuccessorsByClass = function(cls){
    var elements = [];
    for(var i = 0; i < this.childNodes.length; i++){
        if(this.nodeType == 1){
            if(this.childNodes[i].nodeType == 1){
                if(this.childNodes[i].hasClass(cls)){
                    elements.push(this.childNodes[i]);
                }
                elements = elements.concat(this.childNodes[i].getSuccessorsByClass(cls));
            }
        }
    }
    return elements;
}

Document.prototype.getElementsByClasses = function(classes){
	if(classes != null){
		if(classes.length > 0){
			var elements = Array.prototype.slice.call(document.getElementsByClassName(classes[0]));
			for(var i = 1; i < classes.length; i++){
				for(var j = 0; j < elements.length; j++){
					if(!hasClass(elements[j], classes[i])){
						elements.splice(j, 1);
						j--;
					}
				}
			}
			return elements;
		}
	}
}

Object.size = function(obj){
	if(Object.keys(obj) == null){
		return 0;
	}
	return Object.keys(obj).length;
}


function addZeroPrefix(number){
	if(number < 10){
		return ("0"+number).toString();
	}
	return number.toString();
}

function getFocus(){
	return document.getElementsByClassName("focused")[0];
}

function hasClass(element, cls) {
	try{
		if(element != null){
	    	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	    }
	}
	catch(e){
		console.log(e);
	}
}

function addClass(element, cls, callback){
	try{
		if( !hasClass(element, cls) ){
			if(element.className.length > 0){
				element.className += " "+cls;
			}
			else{
				element.className = cls;
			}
			element.className = element.className.trim();
			
			if(typeof(callback) == "function"){
	    		callback.call();
	    	}
		}
	}
	catch(e){
		console.log(e);
	}
}

function removeClass(element, cls, callback){
	try{
		/*if(hasClass(element, cls) ){
			if(element.className.length > 0){
				element.className = element.className.replace(cls, "");
				if(element.className == " "){
					element.className = "";
				}
				element.className = element.className.trim();
				
				if(typeof(callback) == "function"){
		    		callback.call();
		    	}
			}
		}*/
		element.classList.remove(cls);
	}
	catch(e){
		console.log(e);
	}
}

function focusElement(element) {
    try{
        if(element != null && element.style.display != "none"){
            var toBlur = document.getElementsByClassName("focused");
            for(var i = 0; i < toBlur.length; i++){
                blurElement(toBlur[i]);
            }
            addClass(element, "focused"); 
            return true;
        }
        return false;
    }
    catch(e){
        console.log(e);
        return false;
    }
}

function selectElement(element, cls) {
    try{
        if(element != null){
            var toUnselect = document.getElementsByClassName(cls);
            for(var i = 0; i < toUnselect.length; i++){
                removeClass(toUnselect[i], "selected");
            }
            addClass(element, "selected"); 
            return true;
        }
    }
    catch(e){
        console.log(e);
        return false;
    }
}

function blurElement(element) {
    try{
        if(element != null){
            removeClass(element, "focused");
        }
    }
    catch(e){
        console.log(e);
    }
}

function getElementsByClasses(classes){
	if(classes != null){
		if(classes.length > 0){
			var elements = Array.prototype.slice.call(document.getElementsByClassName(classes[0]));
			for(var i = 1; i < classes.length; i++){
				for(var j = 0; j < elements.length; j++){
					if(!hasClass(elements[j], classes[i])){
						elements.splice(j, 1);
						j--;
					}
				}
			}
			return elements;
		}
	}
}


function setLoading(load){
    var element = document.getElementById("loading");
    if(element != null){
        if(load){
            element.removeClass("hide", element.addClass("show"));
        }
        else{
            element.addClass("hide", element.removeClass("show"));
        }
    }
    loading = load;
}

/* returns safely seeked pattern match. e.g.: result(\d)_(\d) will return either [digit, digit] or false
Params:
	needle : RegExp search pattern
	nomatch : return value if no match. defaults to undefined
	bytes: regexp-bytes "g/i/u"
Returns:
	If not found : false
	One result (global) : string
	One result (in parenthesis): string without whole string match
	many results: array of results without whole string match
*/

String.prototype.grep = function( needle, nomatch, bytes )
{
	var match = this.match( new RegExp(needle, bytes) );
	return ( match? ( match.length == 2? match[1] : ( match.length==1? match[0] : match.slice(1)) ) : nomatch );
};

// like substring, capable to index negative numbers as indexes from the end.
String.prototype.cut = function( from, to )
{
	return this.substring( ( from < 0? this.length + from : from ), (to < 0? this.length + to : to ) )
};

function showInfo( msg, timeout, className )
{
    timeout = timeout || 4; // sec
    $("#info").removeClass();
    if(className) {
      $("#info").addClass(className);
    }
    $("#info").html( msg );
    setTimeout(function(){
        if(className) {
          $("#info").removeClass(className);
        }
        $("#info").addClass("hide");
    }, timeout *  1000);
}

function hideInfo()
{
  $("#info").removeClass();
  $("#info").addClass("hide");
}
/* 
	minimum of three
*/

function min(a,b,c)
{
	if( a < b && b <= c)
		return a;
	else if( b < a && a <= c)
		return b;
	return c;
}

function findClosest(from, target, direction) { //from: id, target: link array, direction (optional) up, down, left, right
	try{
		var from_offset = $("#"+from).offset();
		var shortest=2000;
		var index;
		var cx = $("#"+from).width()/2;
		var cy = $("#"+from).height()/2;
		var pos = { a : { x : Math.round( from_offset.left + cx ) , y : Math.round( from_offset.top + cy ) } };
		$.each(target, function(i, el){ // find closest menu item, compares center coordinates
			if( $(el).attr('id') == from )
				return; // do not count itself
			var offset = $(el).offset();
			var cx2 = $(el).width()/2;
			var cy2 = $(el).height()/2;
			pos.b = { x : Math.round( offset.left + cx2 ) , y : Math.round( offset.top + cy2 ) };
			
			/* if direction set, grep off elements out of named direction sector. See below
			
			\ up /
		   l \  / r
		   e  \/  i
		   f  /\  g
		   t /  \ h
			/down\t
			
			*/

			if( direction ) 
			{
				if( direction == "up"   && pos.b.y >= pos.a.y + Math.abs( pos.b.x - pos.a.x )
				|| direction == "down"  && pos.b.y <= pos.a.y + Math.abs( pos.b.x - pos.a.x ) 
				|| direction == "left"  && pos.b.x >= pos.a.x - Math.abs( pos.b.y - pos.a.y )
				|| direction == "right" && pos.b.x <= pos.a.x + Math.abs( pos.b.y - pos.a.y ) )
					return;
			}
			var dist = Math.sqrt(Math.pow(offset.left+cx2-from_offset.left-cx,2)+Math.pow(offset.top+cy2-from_offset.top-cy,2));
			if (dist<shortest) {
				shortest = dist;
				index = el;
			}					
		});
	
		//console.log("Closest: "+$(index).attr('id'));
		return $(index).attr('id'); // closest id
	} catch( e ){
		showInfo("Error: " + e.description ,10);
		error( e );
	}
}

function directions( code )
{
	if( code == VK_UP ) return "up"; 
	if( code == VK_DOWN ) return "down";
	if( code == VK_LEFT ) return "left"; 
	if( code == VK_RIGHT ) return "right";
}

/***************
	COOKIES
***************/

function createCookie(name, value, lifetime ) {
	try{
		lifetime = lifetime || (3650 * 24 * 60 * 60 * 1000);
		var date = new Date();
		date.setTime(date.getTime() + lifetime );
		var expires = "; expires=" + date.toGMTString();
		document.cookie = name + "=" + value + expires + "; path=/";
	}
	catch(e)
	{
		// cookie max length is 4097 bytes. Estimated consumption of one watched video duration is 50 bytes. 
		// It makes more than 80 items that can be saved
		// the limit is though 50 now.
	}
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name ) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

showInfo = showInfo || function ( msg, timeout )
{
	timeout = timeout || 4; // sec
	$("#info").removeClass("hide");
	$("#info").html( msg );
	setTimeout(function(){
		$("#info").addClass("hide");
	}, timeout * 1000);
};

// Note: jQuery load() is Deprecated. Use JavaScript onload() instead.
function imageFadeIn(emptyImgUrl){
	// if image not complete (not in browser cache make the div appear after image is ready)
	if( ! $(this)[0].complete )
	{
		var fadeobject = $(this);
		//console.log( "imageFadeIn for ", fadeobject );
		fadeobject.css("opacity", "0.0");
		fadeobject.addClass("transition03all");
		this.onload = function(){
			fadeobject.css("opacity", "1"); 
		};
		this.onerror = function(){ 
			console.log("Image not found: " + $(this).attr('src') );
			if(emptyImgUrl){
				$(this).attr('src', emptyImgUrl);
			}
			fadeobject.css("opacity", "1");			
		};
	}
}

function autoScrollHorizontal(element, delay){
	var scrollDistance = (element.scrollWidth - element.offsetWidth);
	var pixelsPerSecond = 20;
	var durationInSeconds = scrollDistance / pixelsPerSecond;
	var durationInMilliseconds = durationInSeconds * 1000;
	if(scrollDistance > 0){
		$(element).scrollLeft(0);
		$(element).delay(1000).animate(
			{scrollLeft: scrollDistance}, 
			{
				duration: durationInMilliseconds, 
				easing: "linear", 
				complete: function(){
					$(element).delay(1000).animate(
						{scrollLeft: 0}, 
						{
							duration: 0, 
							complete: function(){
								autoScrollHorizontal(element, delay);
							}
						}
					);
				}
			}
		);
	}
}

function horizontalFadeAutoScroll(element, startDelay, timeouts){
	try{
		if(timeouts && timeouts.length > 0){
			while(timeouts.length > 0){
				clearTimeout(timeouts.pop());
			}
		}
		var scrollDist = element.scrollWidth - element.offsetWidth;
		var pixelsPerSecond = 20;
		var duration_ms = scrollDist / pixelsPerSecond * 1000;
		$(element).scrollLeft(0); 
		if(scrollDist > 0){
			timeouts.push(setTimeout(function(){
				$(element).animate(
					{scrollLeft: scrollDist},
					{
						// scroll to right
						easing:"linear",
						duration: duration_ms,
						complete:function(){
							// fadeout
							timeouts.push(setTimeout(function(){
								$(element).animate(
									{opacity: 0},
									{
										easing:"linear",
										duration: 500,
										complete:function(){
											$(element).scrollLeft(0);
											timeouts.push(setTimeout(function(){
												$(element).animate(
													{opacity: 1},
													{	
														easing:"linear",
														duration: 500,
														complete:function(){
															horizontalFadeAutoScroll(element, startDelay, timeouts);
														}
													}
												);
											}, 1000));
										}
									}	
								);
							}, 1000));
						}
					}
				);
			}, startDelay));
		}
	}
	catch(e){
		console.log(e);
	}
}

function verticalFadeAutoScroll(element, startDelay, timeouts){
	if(element){

		if(timeouts && timeouts.length > 0){
			while(timeouts.length > 0){
				clearTimeout(timeouts.pop());
			}
		}
		var maxHeight = parseInt(element.style.maxHeight) || 0;
		var scrollDist = element.scrollHeight - Math.max(maxHeight, element.offsetHeight);
		var pixelsPerSecond = 20;
		var duration_ms = scrollDist / pixelsPerSecond * 1000;
		$(element).scrollTop(0); 

		if(scrollDist > 0){
			timeouts.push(setTimeout(function(){
				$(element).animate(
					{scrollTop: scrollDist},
					{
						easing:"linear",
						duration: duration_ms,
						complete:function(){
							timeouts.push(setTimeout(function(){
								$(element).animate(
									{opacity: 0},
									{
										easing:"linear",
										duration: 500,
										complete:function(){
											$(element).scrollTop(0);
											timeouts.push(setTimeout(function(){
												$(element).animate(
													{opacity: 1},
													{	
														easing:"linear",
														duration: 500,
														complete:function(){
															verticalFadeAutoScroll(element, startDelay, timeouts);
														}
													}
												);
											},500));
										}
									}	
								);	
							}, 5000));
						}
					}
				);
			}, startDelay));
		}
	}
	return timeouts;
}


//tva: Jos käytät XMLEscape funktiota, niin tässä parannettu versio siitä, varmistaa, ettei escapointia tehdä kahteen kertaan (jos escapointi on jo tietokantaversiossa):
function XMLEscape(sValue, bUseApos) {
  // escape reserved characters
  if(typeof(sValue) == 'number' ) {
    return sValue;
  }
  var sval="";
  if(!sValue) return ""; //tva: jos arvoa ei ollenkaan, niin antaa arvoksi "", jottei tule undefined.
  
  //tva: tarkistus, että eskapointia ei ole vielä tehty, jottei tehdä kahteen kertaan eskapointia.
  if (sValue.search("&lt;") != -1 || sValue.search("&gt;") != -1  || sValue.search("&amp;") != -1  || sValue.search("&quot;") != -1  || sValue.search("&apos;") != -1  || sValue.search("&#39;") != -1  || sValue.search("&#x2F;") != -1 ){
	  return sValue;
  }
  for(var idx=0; idx < sValue.length; idx++) {
    var c = sValue.charAt(idx);
	if      (c == '<') sval += "&lt;";
	else if (c == '>') sval += "&gt;";
	else if (c == '&') sval += "&amp;";
	else if (c == '"') sval += "&quot;";
	else if (c == '/') sval += "&#x2F;";
	else if (c == '\'') sval += (bUseApos ? "&apos;" : "&#39;");
	else sval += c;
  }
  return sval;
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

function setLoading(load){
	if(document.getElementById("loading")){
		if(load){
			document.getElementById("loading").removeClass("hide");
			document.getElementById("loading").addClass("show");
		}
		else{
			document.getElementById("loading").removeClass("show");
			document.getElementById("loading").addClass("hide");
		}
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

function getUrlParameter(parameterName) {
    var queryString = window.location.search;
    var channelStr = null;
    if(queryString.charAt(0) == "?") {
        queryString = queryString.substr(1);
    }
    params = queryString.split("&");
    for(var i = 0; i < params.length; i++){
        var keyvalue = params[i].split("=");
        if(keyvalue[0] == parameterName && keyvalue.length > 1) {
            return keyvalue[1];
        }
    }
    return null;
}

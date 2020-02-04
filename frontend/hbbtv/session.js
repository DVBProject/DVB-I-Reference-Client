/*
	This file handles sessions thru sessionStorage
	Api:
		getStorage( name, clear = false );
			*gets variable $name. Clears it from storage if clear == true
			
		setStorage( name, value, append = false );
			*sets variable $name with value $value. Value is stored as json.
			*if append == true, appends to list. Othervice will override variable $name in storage
			
		setReturnLink( url, alternativeUrl = null );
			*set return link (this app) for application at $url
			*if alternativeUrl set, use it as return link instead of this app url
			
		getReturnLink( clear = false );
			*gets return link for current app. Return false if not set
			*if clear set true, clears link from storage
	
	NOTE:
		This will not work correctly if used relative links, because it differs from absolute window.location.href
*/


var thisUrl = thisUrl || window.location.href;

// get data with $name from session storage
// $clear = clear data after retreived
function getStorage( name, clear )
{
	clear = clear || false;
	if(typeof(Storage) !== "undefined") {

		try{
			state = JSON.parse( sessionStorage.getItem( name ) );
			if( clear )
				sessionStorage.removeItem( name );
			return state;
		}
		catch(e) {
			if( clear )
				sessionStorage.removeItem( name );
			return null;
		}
	}
	return false;
}
// sets vale to storage on name. Overrides if append not set. 
// If append set, appends value to array of values With same name:
// In storage:   item : "value"
//               setStorage( "item", "new value", true )
// In storage:   item : [ "value", "new value" ]
function setStorage( name, value, append )
{
	append = append || false;
	if(typeof(Storage) !== "undefined") {

		try{
			if( append )
			{
				var old = JSON.parse( sessionStorage.getItem( name ) );
				if( old )
				{
					if( Array.isArray( old ) ) // if there is array, append
					{	
						old.push( value );
						value = old;
					}
					else
						value = [ old, value ]; // if not, make an array and append second
				}
			}
			sessionStorage.setItem( name, JSON.stringify( value ) );
		}
		catch(e) {
			sessionStorage.removeItem( name );
		}
	}
	return false;
}

// #################### return links ##################################

// set return link to sessionStorage for opened $url
// new app can return retreiving this return link from SessionStorage with getReturnLink();
// @Param url: url for app that will have return link set
// @Param alternativeUrl: if set will override thisUrl which should be the returnlink for specific app.
function setReturnLink( url, alternativeUrl )
{
	var ret = alternativeUrl || thisUrl;
	var urn = link2urn( url );
	if( !urn ) // do not set if external link
		return false;
	
	if(typeof(Storage) !== "undefined") {

		try{
			var old = JSON.parse( sessionStorage.getItem( 'return' ) );
			if( old )
			{
				old[ urn ] = ret;
				sessionStorage.setItem( 'return', JSON.stringify( old ) );
			}
			else
			{
				var obj = {};
				obj[ urn ] = ret;
				sessionStorage.setItem( 'return', JSON.stringify( obj ) );
			}
		}
		catch(e) {
			console.log( "error with return links" );
		}
	}
	return false;
}

// Gets return link for this app if set or return false if not set.
function getReturnLink( clear )
{
	clear = clear || false;
	
	if(typeof(Storage) !== "undefined") {

		try{
			var old = JSON.parse( sessionStorage.getItem( 'return' ) );
			console.log("return: ", old, " thisUrl: ", thisUrl);
			if( old )
			{
				var url = old[  window.location.pathname + (window.location.search || "") ];
				if( clear )
				{
					delete old[  window.location.pathname ];
					sessionStorage.setItem( 'return', JSON.stringify( old ) );
				}
				return url;
			}
			else
				return false;
		}
		catch(e) {
			console.log( "error with return links" );
		}
	}
	return false;
}


function hasStorage()
{
	if(typeof(Storage) !== "undefined") {
		return true;
	}
	if( typeof(error) == "function" )
		error("No Web Storage available");
	else
		console.log("No Web Storage available");
	return false
}

// file urn detection
// resolves resource identifier from an absolute or relative same orign url.
// Return local pathname from server root or false if external link.
function link2urn( link )
{
	var host = window.location.host || window.location.hostname;
	// absolute same orign, return pathname
	if( link.indexOf(host) > -1 )
	{
		return link.split(host)[1];
	}
	else if( link.indexOf("http://") > -1 ) // absolute external: can not set return link
		return false;
	var pathArray = window.location.pathname.split("/");
	pathArray.pop(); // filename
	var linkArray = link.split("/");
	$.each( linkArray, function(i, item){
		if( item == ".." ) // delete
			pathArray.pop();
		else // add
			pathArray.push( item );
	} );
	return pathArray.join("/"); // rebuild
}

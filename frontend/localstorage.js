/*
	This file handles localStorage
	Api:
		getLocalStorage( name, clear = false );
			*gets variable $name. Clears it from storage if clear == true

		setLocalStorage( name, value, append = false );
			*sets variable $name with value $value. Value is stored as json.
			*if append == true, appends to list. Othervice will override variable $name in storage

	NOTE:
		Cookie-fallback implemented for devices not supporting localStorage
*/

var thisUrl = thisUrl || window.location.href;

// get data with $name from session storage
// $clear = clear data after retreived
function getLocalStorage(name, clear) {
  name = window.location.pathname + ":" + name;
  clear = clear || false;
  if (hasLocalStorage()) {
    try {
      state = JSON.parse(localStorage.getItem(name));
      if (clear) localStorage.removeItem(name);
      return state;
    } catch (e) {
      if (clear) localStorage.removeItem(name);
      return null;
    }
  } // fallback to cookies
  else {
    state = JSON.parse(readCookie(name));
    if (clear) deleteCookie(name);
    return state;
  }
}
// sets vale to storage on name. Overrides if append not set.
// If append set, appends value to array of values With same name:
// In storage:   item : "value"
//               setStorage( "item", "new value", true )
// In storage:   item : [ "value", "new value" ]
function setLocalStorage(name, value, append) {
  name = window.location.pathname + ":" + name;
  append = append || false;

  if (hasLocalStorage()) {
    if (append) {
      var old = JSON.parse(localStorage.getItem(name));
      if (old) {
        if (Array.isArray(old)) {
          // if there is array, append
          old.push(value);
          value = old;
        } else value = [old, value]; // if not, make an array and append second
      }
    }
    localStorage.setItem(name, JSON.stringify(value));
  } // fallback to cookies
  else {
    // does not support append. Save over existing value
    console.log("cookie fallback 1");
    createCookie(name, JSON.stringify(value));
  }
  return false;
}

function hasLocalStorage() {
  try {
    if (typeof localStorage == "undefined") {
      console.log("No localStorage available");
      return false;
    }
    return true;
  } catch (e) {
    console.log("No localStorage available");
    return false;
  }
}

function getAllItems(joined, source) {
  var items = [];
  if (hasLocalStorage()) {
    $.each(localStorage, function (key, value) {
      if (typeof value != "function") items.push({ key: key, value: value });
    });
  } else {
    $.each(document.cookie.split(";"), function (key, value) {
      items.push({
        key: value.split("=")[0].replace(/^ /, ""),
        value: value.split("=")[1],
      });
    });
  }

  if (joined) {
    $.each(items, function (key, value) {
      items[key] = value.key + " : '" + value.value + "'";
    });
    if (source) items.unshift("source : '" + (typeof localStorage == "undefined" ? "cookies" : "localStorage") + "'");
    return items.join(joined);
  }
  return items;
}

// cookie fallbacks
function createCookie(name, value) {
  try {
    var date = new Date();
    date.setTime(date.getTime() + 3650 * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires + "; path=/";
  } catch (e) {
    // cookie max length is 4097 bytes
  }
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

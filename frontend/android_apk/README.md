# dvb-i-demo-android

Android layer for DVB-I reference application. Android - javascript interface for DVB-I NIP implementation

The APK provides a WebView for the Android version of the reference app <https://dvb-i-reference.dvb.org/client/frontend/android/player.html>

## DVB-I NIP implementation

Android layer provides the following Javascript API for DVB-I NIP service discovery:

- `android_interface.startNIPDiscovery()` Starts the DVB-I service discovery process. Return value: void
- `android_interface.getServices()` Returns the found services as a string containing a JSON array:

```json
[
  { "dvbi_sl": "https://dvb-i-reference.dvb.org/client/backend/servicelist.php?list=example.xml" },
  {
    "dvbi_sep": "https://dvb-i-reference.dvb.org/client/backend/servicelist_regis",
    "orb_pos_A": "1",
    "orb_pos_B": "2",
    "orb_pos_C": "3",
    "orb_pos_D": "3"
  }
]
```

- `android_interface.getTest()` Test funtion to determine if the android API is working. Returns string: `Android JS interface test success`

When the android application discovers a service it will call a global javascript function if it is defined: `window.nip.serviceDiscovered(service)`. The service paramer is an object, same as the objects returned in the getServices() return value array: `{"dvbi_sl":"https://dvb-i-reference.dvb.org/client/backend/servicelist.php?list=example.xml"}`

## Building

Project can be build using the Android Studio. Open the android_apk directory in the Android studio and build the project from the Build menu.

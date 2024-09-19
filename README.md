# DVB-I Reference Application

Project consists of a backend and frontend parts.

Backend allows generation and editing of DVB-I service lists and generates mockup TV Anytime programme information to be used in the EPG.

## Getting Started

Welcome to DVB's open source HTML5 reference client implementation of DVB-I.

- If you are looking for more information on what DVB-I is and how it can help, please see [here](https://dvb-i.tv/).

- If you are looking for a DVB-I client for Android phones and tablets, please see [here](https://dvb-i-reference.dvb.org/client/frontend/android/). The client is available as a Progressive Web App (PWA) and as [an installable Android Package (APK)](https://dvb-i-reference.dvb.org/client/frontend/android/com.dvb.dvb_i.DvbiReferenceApplication-v38-normal-debug.apk).

  Note that for the Progressive Web App and you can use the "Add to Home screen" functionality of Chrome to create a nice launch icon and proper PWA app on your device. The APK can be installed with any APK installer and behaves like a normal Android App.

- If you are looking for a DVB-I client for regular HbbTV TV sets, please download the transport stream from [here](https://github.com/DVBProject/DVB-I-Reference-Client#operator-application-package) and play it into your TV set. The password is "dvbi2023ts".

  Note this has limitations as it's a regular HbbTV application. A version packaged as an HbbTV operator application has fewer limitations - please see the instructions [here](https://github.com/DVBProject/DVB-I-Reference-Client#operator-application-package).

- If you are looking for a generic HTML5 DVB-I client (e.g. for desktop PCs), please see [here](https://dvb-i-reference.dvb.org/client/frontend/android/player.html).

- If you are looking for a DVB-I client for iOS devices, the generic HTML5 client should work on iPads. DVB's reference client relies on features not yet supported on iPhones. For iPhones please [join the DVB-I Forum discord server](https://discord.gg/2jhVnDqQ3U) and ask there.

- If you are looking for a DVB-I client for Smart TVs excluding HbbTV and have a way to directly enter URLs, the generic HTML5 client may work. This is not a supported configuration. In the future the APK can be extended to support AndroidTV's and Android STB's.

- For bug reports, feature requests and pull requests for this DVB-I reference client, please use the regular features of github.

- For anything else relating to DVB-I and DVB-I clients, please [join the DVB-I Forum discord server](https://discord.gg/2jhVnDqQ3U) and ask there.

Features common to most versions are service list navigation, selection/tuning of services, an info banner on changing service and a simple EPG. All versions use the common backend.

## Frontend

The frontend is a HbbTV OpApp implementation of a DVB-I compatible Client. It offers Service list navigation, selection/tuning of services, info banner and a simple EPG. A separate client is offered for Android devices. Android client is offered as both PWA and APK applications, offering roughly the same functionality. APK can be extended with native Android code to enable features requiring native code, like new network service discovery protocols (DVB-NIP, 5G broadcast, and other protocols using the Android Tuner Interface Framework). Note that support for these in Android devices can be quite limited.

Demo installations available at:

- HbbTV Frontend: [https://dvb-i-reference.dvb.org/client/frontend/hbbtv/](https://dvb-i-reference.dvb.org/client/frontend/hbbtv/)

- Android PWA Frontend on a tablet/smartphone: [https://dvb-i-reference.dvb.org/client/frontend/android/](https://dvb-i-reference.dvb.org/client/frontend/android/)

- Android PWA for testing on a PC browser [https://dvb-i-reference.dvb.org/client/frontend/android/player.html](https://dvb-i-reference.dvb.org/client/frontend/android/player.html)

(one can use the "Add to Home screen" functionality of Chrome to create a nice launch icon and proper PWA app)

- Android APK: Android Studio project for building an Android APK is provided in frontend/android_apk-directory. Currently it is intended for DVB-I/DVB-NIP implementation with Android JS interface to discover potential DVB-NIP (or HB) Gateways with Android native APIs. The ready-built APK can be downloaded from [here](https://dvb-i-reference.dvb.org/client/frontend/android/com.dvb.dvb_i.DvbiReferenceApplication-v38-normal-debug.apk).

To test the OpApp version, follow the specific opapp installations instructions for the device in use. The repository offers methods to build the specification compliant opapp.pkg template.

The app can also be tested by generating a Transport Stream with an AIT pointing to the HbbTV Frontend link mentioned above. For easier testing, a [TS is provided with AIT that links to the application](https://cloud.sofiadigital.fi/index.php/s/w74cfnr6s4cGT7w)

```
stream download password: dvbi2023ts
```

NOTE: When using the TS, TDT restamp is recommended so the schedule information is retrieved with a correct date.

Note that this version runs as a "Normal HbbTV" version and might lack some of the functionalities of the OpApp version, and might display some inconsistent UI behavior.

### Operator application package

- Example operator application package is available at: [https://dvb-i-reference.dvb.org/client/opapp.pkg](https://dvb-i-reference.dvb.org/client/opapp.pkg)

NOTE: This is an unencrypted and unsigned package

To create your own opapp.pkg, run the following commands in the project root directory:

```
npm install
node opapp_package.js
```

This will create opapp.pkg in the project root directory. Edit the [XML AIT](https://dvb-i-reference.dvb.org/client/frontend/hbbtv/opapp.aitx) to change the application id, organization id and the package location as needed. The opapp.pkg needs to be encrypted and signed according to the Operator application specification.

## Backend

- Backend: [https://dvb-i-reference.dvb.org/client/backend/](https://dvb-i-reference.dvb.org/client/backend/)

Backend is deployable to any web server with PHP support. Make sure that the "servicelists" directory is writable. The backend stores new servicelists there.

NOTE: The frontend uses "example.xml" as the service list. It can be browsed in the Backend editor as well, but not modified. [https://dvb-i-reference.dvb.org/client/backend/servicelists/example.xml](https://dvb-i-reference.dvb.org/client/backend/servicelists/example.xml)

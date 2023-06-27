# DVB-I Reference Application 

Project consists of a backend and frontend parts.

Backend allows generation and editing of DVB-I service lists and generates mockup TV Anytime programme information to be used in the EPG.

## Getting Started

Welcome to DVB's open source HTML5 reference client implementation of DVB-I.

- If you are looking for more information on what DVB-I is and how it can help, please see [here](https://dvb-i.tv/).
- If you are looking for a DVB-I client for Android phones and tablets, please see [here](http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/). Note this is a Persistent Web App and you can use the "Add to Home screen" functionality of Chrome to create a nice launch icon and proper PWA app on your device.
- If you are looking for a DVB-I client for regular HbbTV TV sets, please download the transport stream from [here](https://github.com/DVBProject/DVB-I-Reference-Client#operator-application-package) and play it into your TV set. The password is "dvbi2023ts". Note this has limitations as it's a regular HbbTV application. A version packaged as an HbbTV operator application has fewer limitations - please see the instructions [here](https://github.com/DVBProject/DVB-I-Reference-Client#operator-application-package).
- If you are looking for a generic HTML5 DVB-I client (e.g. for desktop PCs), please see [here](http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/player.html).
- If you are looking for a DVB-I client for iOS devices, the generic HTML5 client should work on iPads. DVB's reference client relies on features not yet supported on iPhones. For iPhones please [join the DVB-I Forum discord server](https://discord.gg/2jhVnDqQ3U) and ask there.
- If you are looking for a DVB-I client for Smart TVs excluding HbbTV and have a way to directly enter URLs, the generic HTML5 client may work. This is not a supported configuration.
- For bug reports, feature requests and pull requests for this DVB-I reference client, please use the regular features of github.
- For anything else relating to DVB-I and DVB-I clients, please [join the DVB-I Forum discord server](https://discord.gg/2jhVnDqQ3U) and ask there.

Features common to most versions are service list navigation, selection/tuning of services, an info banner on changing service and a simple EPG.

## Frontend

The frontend is a HbbTV OpApp implementation of a DVB-I compatible Client.
It offers Service list navigation, selection/tuning of services, info banner and a simple EPG.
A separate client is offered for Android devices. Android client is a PWA application, offering roughly the 
same functionality. 

Demo installations available at:
- HbbTV Frontend:
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/hbbtv/
- Android PWA Frontend on a tablet/smartphone:
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/
- Android PWA for testing on a PC browser
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/player.html

(one can use the "Add to Home screen" functionality of Chrome to create a nice launch icon and proper PWA app) 

To test the OpApp version, follow the specific opapp installations instructions for the device in use. 
The repository offers methods to build the specification compliant opapp.pkg template. 

The app can also be tested by generating a Transport Stream with an AIT pointing to the HbbTV Frontend link mentioned above. For easier testing, a [TS is provided with AIT that links to the application](https://cloud.sofiadigital.fi/index.php/s/w74cfnr6s4cGT7w)

```
stream download password: dvbi2023ts
```

Note that this version runs as a "Normal HbbTV" version and might lack some of the functionalities
of the OpApp version, and might display some inconsistent UI behavior.

### Operator application package

- Example operator application package is available at:
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/opapp.pkg

NOTE: This is an unencrypted and unsigned package

To create your own opapp.pkg, run the following commands in the project root directory:
```
npm install
node opapp_package.js
```
This will create opapp.pkg in the project root directory. Edit the [XML AIT](frontend/hbbtv/opapp.aitx) to change the application id, organization id and the package location as needed. The opapp.pkg needs to be encrypted and signed according to the Operator application specification.


## Backend
- Backend:
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/

Backend is deployable to any web server with PHP support. Make sure that the "servicelists" directory is writable. The backend
stores new servicelists there.

NOTE: The frontend uses "example.xml" as the service list. It can be browsed in the 
Backend editor as well, but not modified. 
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/servicelists/example.xml

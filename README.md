# DVB-I Reference Application 

Project consists of a backend and frontend parts.

Backend allows generation and editing of DVB-I service lists.
In the future it will allow also generation of TV Anytime programme information to be used in the EPG.

The frontend is a HbbTV OpApp implementation of a DVB-I compatible Client.
It offers Service list navigation, selection/tuning of services, info banner and a simple EPG.
A separate client is offered for Android devices. Android client is a PWA application, offering roughly the 
same functionality. 

Demo installations available at:
- HbbTV Frontend:
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/hbbtv/launcher/
- Android PWA Frontend on a tablet/smartphone:
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/
- Android PWA for testing on a PC browser
    http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/android/player.html

(one can use the "Add to Home screen" functionality of Chrome to create a nice launch icon and proper PWA app) 

To test the OpApp version, follow the specific opapp installations instructions for the device in use. Proper OpApp installation
techniques will be offered at a later stage. The app can also be tested by generating a Transport Stream with an AIT pointing to 
the link mentioned above. For easier testing, a TS is provided with AIT that links to the application:
https://cloud.sofiadigital.fi/index.php/s/qrB6MoFH5cPCDoN

Note that this version runs as a "Normal HbbTV" version and might lack some of the functionalities
of the OpApp version, and might display some inconsistent UI behavior.

- Backend:
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/

Backend is deployable to any web server with PHP support. Make sure that the "servicelists" directory is writable. The backend
stores new servicelists there.

NOTE: The frontend uses "example.xml" as the service list. It can be browsed in the 
Backend editor as well, but not modified. 
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/servicelists/example.xml

DVB-I Reference Application 

Project consists of a backend and frontend parts.

Backend allows generation and editing of DVB-I service lists.
In the future it will allow also generation of TV Anytime programme information generation to be used in the EPG.

The frontend is a HbbTV OpApp implementation of a DVB-I compatible Client.
It offers Service list navigation, selection/tuning of services, info banner and a simple EPG.

Demo installations available at:
Frontend:
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/frontend/launcher/

Backend:
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/

The frontend uses "example.xml" as the service list. It can be browsed in the 
Backend editor as well, but not modified. 
http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/servicelists/example.xml

For testing, a TS is provided with AIT that links to the application
https://cloud.sofiadigital.fi/index.php/s/qrB6MoFH5cPCDoN

Note that this version is "Normal HbbTV" version and lacks some of the functionalities
of the OpApp version, and might display some inconsistent UI behavior.
# Build a DVB-I Server

## System libraries and modules
### Install PHP 7.3 (includes Apache 2)
``sudo apt install php``

### Configure PHP to allow execution in user directories
Edit ``/etc/apache2/mods-enabled/php7.3.conf`` to comment out the restrictions on PHP in user directories

    # To re-enable php in user directories comment the following lines
    # (from <IfModule ...> to </IfModule>.) Do NOT set it to On as it
    # prevents .htaccess files from disabling it.
    # <IfModule mod_userdir.c>
    #  <Directory /home/*/public_html>
    #   php_admin_value engine Off
    #  </Directory>
    # </IfModule>


### Install the PHP SimpleXML library
`sudo apt-get install php-xml`

### Restart apache
`sudo /etc/init.d/apache2 restart`

## Install DVB-I Reference
### Load the reference client into the Apache root directory

    git clone https://github.com/DVBProject/DVB-I-Reference-Client ~/dvbi/
    sudo mv /var/www/html /var/www/html
    sudo ln -s ~/dvbi  /var/www/html

Note that, you could also create a custom Apache site in `/etc/apache2/sites-available` and enable it with `a2ensite`.

### Update files to refer to local endpoints

In `/var/www/html/frontend/dvbi-common.js`, change the `PROVIDER_LIST` to the fully qualified URL to your service list registry, i.e.
`var PROVIDER_LIST = "http://my-www-host/backend/servicelist_registry.php"`

Replace `“http://stage.sofiadigital.fi/dvb/dvb-i-reference-application/”` in the following files with your own paths, i.e.  `“http://my-www-host/” `

- `backend/nownext.xml`
- `backend/program_information_template.xml`
- `backend/servicelists\drm.xml`
- `backend/servicelists\example.xml`
- `backend/servicelists\example_rev1.xml`
- `frontend/dvbi-common.js`

Change the references to the reference service lists on `raw.github` to your local server URLs

- `backend/slepr-master.xml`
  - `<dvbisd:URI>https://raw.githubusercontent.com/DVBproject/DVB-I-Reference-Client/master/backend/servicelists/example.xml</dvbisd:URI>`
  - becomes
  - `<dvbisd:URI>http://my-www-host/backend/servicelists/example.xml</dvbisd:URI>`


## to be determined

NOT SURE WHAT TO DO ABOUT THESE…

`frontend\hbbtv\launcher\videoplayer_html5.js` --> /* "serverURL" : "https://mhp.sofiadigital.fi/tvportal/referenceapp/videos/laurl_ck.php", */

`backend\servicelists\drm.xml` --> https://devel.sofiadigital.fi/home/tsa/dvb-i-reference-application/linked_applications/hbbtv_playready_aitx.php



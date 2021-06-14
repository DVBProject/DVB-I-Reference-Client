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

In `/var/www/html/frontend/dvbi-common.js`, change the `INSTALL_LOCATION` to the fully qualified URL to your service list registry, i.e.
`var INSTALL_LOCATION = "http://my-www-host";`. Do not include the trailing slash.

In `/var/www/html/vackend/configuration.php`, change the `$install_location` to the same fully qualified URL to your service list registry, i.e.
`$install_location = "http://my-www-host";`. Do not include the trailing slash.





FROM php:8.1-apache

COPY ./ /var/www/html/client

RUN a2enmod rewrite
RUN a2enmod expires

<?php
    include 'configuration.php';
    if(isset( $_GET['list'])) {

        header( "Expires: Mon, 20 Dec 1998 01:00:00 GMT" );
        header( "Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT" );
        header( "Cache-Control: no-cache, must-revalidate" );
        header( "Pragma: no-cache" );
        header( "Content-Type: application/xml;charset=utf-8" );
        header("Access-Control-Allow-Origin: *");

        // read file indicated by the the list query paramater

        $servicelist= file_get_contents($_GET['list']);

        $servicelist =str_replace("INSTALL--LOCATION",$install_location,$servicelist);
        echo $servicelist;
    }
    else { 
        http_response_code (400);
        echo 'Illegal filename!';
    }
?>
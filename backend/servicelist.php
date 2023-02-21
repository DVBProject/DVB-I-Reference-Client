<?php
    include 'configuration.php';

    header( "Expires: Mon, 20 Dec 1998 01:00:00 GMT" );
    header( "Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT" );
    header( "Cache-Control: no-cache, must-revalidate" );
    header( "Pragma: no-cache" );
    header( "Content-Type: application/xml;charset=utf-8" );
    header("Access-Control-Allow-Origin: *");
    $list = NULL;
    if(isset($_GET["list"])) {
      $list = $_GET["list"];
    }
    $servicelist = NULL;
    if(strlen($list) ==  0 || strpos($list,"..") !== false || strpos($list,"/") !== false || strpos( $list,".xml") !== (strlen($list)-4) || !file_exists("servicelists/".$list)  ) {
      $servicelist= file_get_contents("servicelists/example.xml");
    }
    else {
      $servicelist= file_get_contents("servicelists/".$list);
    }

    $servicelist =str_replace("INSTALL~~LOCATION",$install_location,$servicelist);
    echo $servicelist;
?>

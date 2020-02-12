<?php
$target_dir = "servicelists/";
if(isset($_POST['servicelist'])) {
    $filename = $_POST['servicelist'];

    if (strpos($filename, '/') !== false || strpos($filename, '..') !== false) {
       http_response_code (400);
       echo 'Illegal filename!';
       die();
    }

    if($filename == "example.xml") {
        http_response_code (400);
        echo('Example xml cannot be deleted!');
        die();
    }

    
    $target = $target_dir.$filename;
    if (file_exists($target)) {
        $ret = unlink($target);
        if($ret === false) {
            http_response_code (400);
            echo('There was an error writing this file');
        }
    }
    else {
        http_response_code (400);
        echo('Servicelist not found!');
    }
  
}
else {
   http_response_code (400);
   echo('Error deleting servicelist, invalid request!');
}
?>

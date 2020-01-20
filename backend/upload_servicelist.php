<?php
$target_dir = "servicelists/";
if(isset($_POST['servicelist']) && isset($_POST['filename'])) {
    $data = $_POST['servicelist'];
    $filename = $target_dir .$_POST['filename'];

    if (strpos($filename, '/') !== false || strpos($filename, '..') !== false) {
       http_response_code (400);
       echo 'Illegal filename!';
       die();
    }

    if(substr($filename, -4) != ".xml") {
        $filename = $filename.".xml";
    }
    if (!file_exists($filename)) {
        $fh = fopen($filename, 'w') or die("Can't create file");
    }
    $ret = file_put_contents($filename, $data,LOCK_EX);
    if($ret === false) {
        http_response_code (400);
        echo('There was an error writing this file');
    }
}
else {
   http_response_code (400);
   echo('Error saving servicelist!');
}
?>

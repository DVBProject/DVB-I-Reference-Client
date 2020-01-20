<?php
$target_dir = "servicelists/";
if(isset($_POST['servicelist']) && isset($_POST['filename'])) {
    $data = $_POST['servicelist'];
    $filename = $target_dir .$_POST['filename'];
    if (!file_exists($filename)) {
        $fh = fopen($filename, 'w') or die("Can't create file");
    }
    $ret = file_put_contents($filename, $data,LOCK_EX);
    if($ret === false) {
        die('There was an error writing this file');
    }
    else {
        echo "$ret bytes written to file";
    }
}
else {
   die('no post data to process');
}
?>

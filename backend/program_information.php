<?php
header('Content-Type: text/xml');
header("Access-Control-Allow-Origin: *");
$timeformat = "Y-m-d\TH:i:s\Z";
date_default_timezone_set ("Zulu");

//TODO placeholder implementation, returns static program
$program_id = $_GET['pid'];

$dateformat = "Y-m-d";
$current_time = time();

$programInf= file_get_contents("extended_program_information-template.xml");

$programInf =str_replace("!!PROGRAM_ID_TEMPLATE!!",$program_id,$programInf);
$programInf =str_replace("!!DATE_TEMPLATE!!",date($dateformat,$current_time),$programInf);

echo $programInf;
?>

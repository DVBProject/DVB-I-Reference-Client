<?php
header('Content-Type: text/xml');
header("Access-Control-Allow-Origin: *");
$timeformat = "Y-m-d\TH:i:s\Z";
date_default_timezone_set ("Zulu");

//TODO placeholder implementation, returns static program
$program_id = $_GET['pid'];
$schedule= file_get_contents("extended_program_information.xml");
echo $schedule;
?>

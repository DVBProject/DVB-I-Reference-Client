<?php
header('Content-Type: text/xml');
header("Access-Control-Allow-Origin: *");
$timeformat = "Y-m-d\TH:i:s\Z";
date_default_timezone_set ("Zulu");

//TODO placeholder implementation, returns static programs as more episodes
$program_id = $_GET['pid'];
$present_start = rand(1,45);
$present_duration = 45;
$following_duration = 30;
$present_starttime = time()+($present_start *60);
$present_starttime = $present_starttime - ( $present_starttime % 60);
$following_starttime = $present_starttime + ($present_duration *60);
$following_endtime =  $following_starttime + ($following_duration * 60);
$schedule= file_get_contents("nownext.xml");
$schedule =str_replace("2013-09-25T11:15:00Z",date($timeformat, $present_starttime),$schedule);
$schedule =str_replace("2013-09-25T12:00:00Z",date($timeformat, $following_starttime),$schedule);
$schedule =str_replace("2013-09-25T12:30:00.000Z",date($timeformat, $following_endtime),$schedule);
$schedule =str_replace("SERVICE_ID_TEMPLATE",$_GET['sid'],$schedule);
echo $schedule;
?>

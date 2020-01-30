<?php
$present_start = rand(1,45);
$present_duration = 45;
$following_duration = 30;
$present_starttime = time()-($present_start *60);
$following_starttime = $present_starttime + ($present_duration *60);
$following_endtime =  $following_starttime + ($following_duration * 60);
$schedule= file_get_contents("schedule.xml");
$schedule =str_replace("2013-09-25T11:15:00Z",date("c", $present_starttime),$schedule);
$schedule =str_replace("2013-09-25T12:00:00Z",date("c", $following_starttime),$schedule);
echo $schedule;
?>

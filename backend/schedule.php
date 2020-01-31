<?php
//TODO 
header('Content-Type: text/xml');
date_default_timezone_set ("Zulu");
if(isset($_GET['now_next']) && isset($_GET['sid']) && $_GET['now_next'] == "true" ) {
    $present_start = rand(1,45);
    $present_duration = 45;
    $following_duration = 30;
    $present_starttime = time()-($present_start *60);
    $present_starttime = $present_starttime - ( $present_starttime % 60);
    $following_starttime = $present_starttime + ($present_duration *60);
    $following_endtime =  $following_starttime + ($following_duration * 60);
    $schedule= file_get_contents("nownext.xml");
    $schedule =str_replace("2013-09-25T11:15:00Z",date("c", $present_starttime),$schedule);
    $schedule =str_replace("2013-09-25T12:00:00Z",date("c", $following_starttime),$schedule);
    $schedule =str_replace("2013-09-25T12:30:00.000Z",date("c", $following_endtime),$schedule);
    $schedule =str_replace("SERVICE_ID_TEMPLATE",$_GET['sid'],$schedule);
    echo $schedule;
}
else if(isset($_GET['start']) && isset($_GET['end']) && isset($_GET['sids']) ){
    $schedule_start = intval($_GET['start']);
    $schedule_end = intval($_GET['end']);
    $program_length = rand(10,60);
    $start = $schedule_start -(rand(1,$program_length)*60);
    $start = $start - ( $start % 60);
    $programs = "";
    $schedules = "";
    $index = 1;
    $id = "crid://".$_GET['sids'][0].".".$index;
    while($start < $schedule_end) {
        $schedule = file_get_contents("schedule_event_template.xml");
        $schedule =str_replace("PROGRAM_ID_TEMPLATE",$id,$schedule);
        $schedule =str_replace("START_TIME_TEMPLATE",date("c", $start),$schedule);
        $schedule =str_replace("DURATION_TEMPLATE","PT".$program_length."M",$schedule);
        $schedules = $schedules.$schedule;
        $program = file_get_contents("program_information_template.xml");
        $program =str_replace("PROGRAM_ID_TEMPLATE",$id,$program);
        $programs = $programs.$program;
        $index++;
        $id = "crid://".$_GET['sids'][0].".".$index;        
        $start = $start +($program_length*60);
        $program_length = rand(10,60);
    }
    $schedule_document = file_get_contents("schedule_template.xml");
    $schedule_document =str_replace( "SERVICE_ID_TEMPLATE",$_GET['sids'][0],$schedule_document);
    $schedule_document =str_replace( "START_TEMPLATE",date("c", $schedule_start),$schedule_document);
    $schedule_document =str_replace( "END_TEMPLATE",date("c", $schedule_end),$schedule_document);
    $schedule_document =str_replace( "<!--PROGRAMS-->",$programs,$schedule_document);
    $schedule_document =str_replace( "<!--SCHEDULES-->",$schedules,$schedule_document);
    echo $schedule_document;
}
?>

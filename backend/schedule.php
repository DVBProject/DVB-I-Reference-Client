<?php
//TODO 
header('Content-Type: text/xml');
header("Access-Control-Allow-Origin: *");
$timeformat = "Y-m-d\TH:i:s\Z";
date_default_timezone_set ("Zulu");
if(isset($_GET['now_next']) && isset($_GET['sid']) && $_GET['now_next'] == "true" ) {
    $now_next = getNowNext($_GET['sid']);
    if($now_next != NULL) {
        echo $now_next;
        exit();
    }
    $present_start = rand(1,45);
    $present_duration = 45;
    $following_duration = 30;
    $present_starttime = time()-($present_start *60);
    $present_starttime = $present_starttime - ( $present_starttime % 60);
    $following_starttime = $present_starttime + ($present_duration *60);
    $following_endtime =  $following_starttime + ($following_duration * 60);
    $schedule= file_get_contents("nownext.xml");
    $schedule =str_replace("2013-09-25T11:15:00Z",date($timeformat, $present_starttime),$schedule);
    $schedule =str_replace("2013-09-25T12:00:00Z",date($timeformat, $following_starttime),$schedule);
    $schedule =str_replace("2013-09-25T12:30:00.000Z",date($timeformat, $following_endtime),$schedule);
    $schedule =str_replace("SERVICE_ID_TEMPLATE",$_GET['sid'],$schedule);
    echo $schedule;
}
else if(isset($_GET['start']) && isset($_GET['end']) && isset($_GET['sids']) ){
    $schedule_start = intval($_GET['start']);
    $schedule_end = intval($_GET['end']);
    $sid = $_GET['sids'][0];
    $schedule = getSchdeule($sid,$schedule_start,$schedule_end);
    if($schedule  != NULL) {
        echo $schedule;
        exit();
    }
    $program_length = rand(10,60);
    $start = $schedule_start -(rand(1,$program_length)*60);
    $start = $start - ( $start % 60);
    $programs = "";
    $schedules = "";
    $index = 1;
    $id = "crid://".$sid.".".$index;
    while($start < $schedule_end) {
        $schedule = file_get_contents("schedule_event_template.xml");
        $schedule =str_replace("PROGRAM_ID_TEMPLATE",$id,$schedule);
        $schedule =str_replace("START_TIME_TEMPLATE",date($timeformat, $start),$schedule);
        $schedule =str_replace("DURATION_TEMPLATE","PT".$program_length."M",$schedule);
        $schedules = $schedules.$schedule;
        $program = file_get_contents("program_information_template.xml");
        $program =str_replace("PROGRAM_ID_TEMPLATE",$id,$program);
        $programs = $programs.$program;
        $index++;
        $id = "crid://".$sid.".".$index;
        $start = $start +($program_length*60);
        $program_length = rand(10,60);
    }
    $schedule_document = file_get_contents("schedule_template.xml");
    $schedule_document =str_replace( "SERVICE_ID_TEMPLATE",$_GET['sids'][0],$schedule_document);
    $schedule_document =str_replace( "START_TEMPLATE",date($timeformat, $schedule_start),$schedule_document);
    $schedule_document =str_replace( "END_TEMPLATE",date($timeformat, $schedule_end),$schedule_document);
    $schedule_document =str_replace( "<!--PROGRAMS-->",$programs,$schedule_document);
    $schedule_document =str_replace( "<!--SCHEDULES-->",$schedules,$schedule_document);
    echo $schedule_document;
}

function getNowNext( $sid ) {
    global $timeformat;
    if (strpos($sid, '/') !== false || strpos($sid, '..') !== false || file_exists("./schedule_templates/".$sid.".xml") === false) {
        return NULL;
    }
    $dateformat = "Y-m-d";
    $current_time = time();
    $schedule_str= file_get_contents("./schedule_templates/".$sid.".xml");
    $schedule_str =str_replace( "DATE_TEMPLATE",date($dateformat,$current_time),$schedule_str);
    $schedule = new SimpleXMLElement($schedule_str);
    $next = NULL;
    $next = NULL;
    for($i = 0; $i < count($schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent);$i++) {
        $event = $schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent[$i];
        $start = strtotime($event->PublishedStartTime);
        if($start > $current_time) {
            $next = $event;
            break;
        }
    }
    if($next != NULL) {
        $now = $schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent[$i-1];
    }
    else {
        $now = $schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent[count($schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent)-1];
        $next = $schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent[0];
    }
    $now_program = NULL;
    $next_program = NULL;
    foreach ($schedule->ProgramDescription->ProgramInformationTable->ProgramInformation as $program) {
        if((string)$program['programId'] == (string)$now->Program['crid']) {
            $now_program = $program;
            if($next_program != NULL) {
                break;
            }
        }
        if((string)$program['programId'] == (string)$next->Program['crid']) {
            $next_program = $program;
            if($now_program != NULL) {
                break;
            }
        }

    }

    $endtime = strtotime($next->PublishedStartTime);
    $endtime += ISO8601ToSeconds($next->PublishedDuration);
    $schedule_document = file_get_contents("schedule_template.xml");
    $schedule_document =str_replace( "START_TEMPLATE",$now->PublishedStartTime,$schedule_document);
    $schedule_document =str_replace( "END_TEMPLATE",date($timeformat, $endtime),$schedule_document);
    $schedule_document =str_replace( "<!--PROGRAMS-->",$now_program->asXML().$next_program->asXML(),$schedule_document);
    $schedule_document =str_replace( "<!--SCHEDULES-->",$now->asXML().$next->asXML(),$schedule_document);
    $schedule_document =str_replace( "SERVICE_ID_TEMPLATE",$sid,$schedule_document);
    return $schedule_document;
}

function getSchdeule( $sid,$start,$end ) {
    global $timeformat;
    if (is_int($start) === false || is_int($end) === false || strpos($sid, '/') !== false || strpos($sid, '..') !== false || file_exists("./schedule_templates/".$sid.".xml") === false) {
        return NULL;
    }

    $dateformat = "Y-m-d";
    $current_time = $start;
    $schedule_str= file_get_contents("./schedule_templates/".$sid.".xml");
    $schedule_str =str_replace( "DATE_TEMPLATE",date($dateformat,$current_time),$schedule_str);
    $schedule = New Simplexmlelement($schedule_str);
    $programs = array();
    $end_reached = false;
    $previous_count = -1;
    while($end_reached == false  && count($schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent) > 0 ) {

        for($i = 0; $i < count($schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent);$i++) {
            $event = $schedule->ProgramDescription->ProgramLocationTable->Schedule->ScheduleEvent[$i];
            $event_start = strtotime($event->PublishedStartTime);
            $event_end = $event_start + ISO8601ToSeconds($event->PublishedDuration);
            if($start < $event_start && $event_start < $end) {
                array_push($programs,$event);
            }
            if($event_end > $end) {
                $end_reached = true;
                break;
            }
        }
        if($previous_count == count($programs)) {
            //No new programs found, break
            break;
        }
        $previous_count = count($programs);
        if($end_reached == false) {
            $current_time += 24*60*60;
            $schedule_str= file_get_contents("./schedule_templates/".$sid.".xml");
            $schedule_str =str_replace( "DATE_TEMPLATE",date($dateformat,$current_time),$schedule_str);
            $schedule = New Simplexmlelement($schedule_str);
        }
    }
    $last = $programs[count($programs)-1];
    $endtime = strtotime($last->PublishedStartTime);
    $endtime += ISO8601ToSeconds($last->PublishedDuration);
    $schedule_document = file_get_contents("schedule_template.xml");
    $schedules = "";
    $program_infos = array();
    $info_str = "";
    foreach($programs as $program) {
        $schedules .= $program->asXML();
        $program_id =  (string)$program->Program['crid'];
        if(!array_key_exists($program_id,$program_infos)) {
            foreach ($schedule->ProgramDescription->ProgramInformationTable->ProgramInformation as $program_info) {
                if((string)$program_info['programId'] == $program_id) {
                        $program_infos[$program_id] = true;
                        $info_str .= $program_info->asXML();
                        break;
                }
            }
        }
    }
    $schedule_document =str_replace( "START_TEMPLATE",$programs[0]->PublishedStartTime,$schedule_document);
    $schedule_document =str_replace( "END_TEMPLATE",date($timeformat, $endtime),$schedule_document);
    $schedule_document =str_replace( "<!--PROGRAMS-->",$info_str,$schedule_document);
    $schedule_document =str_replace( "<!--SCHEDULES-->",$schedules,$schedule_document);
    $schedule_document =str_replace( "SERVICE_ID_TEMPLATE",$sid,$schedule_document);

    return $schedule_document;
}

function ISO8601ToSeconds($ISO8601){
	$interval = new DateInterval($ISO8601);

	return ($interval->d * 24 * 60 * 60) +
		($interval->h * 60 * 60) +
		($interval->i * 60) +
		$interval->s;
}
?>

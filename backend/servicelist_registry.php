<?php
include 'configuration.php';

header('Content-Type: text/xml');
header('Access-Control-Allow-Origin: *');

$list = new Simplexmlelement(file_get_contents("./slepr-master.xml"));
$entries  = $list->children("urn:dvb:metadata:servicelistdiscovery:2019",false);
if(isset( $_GET['regulatorListFlag'])) {
    $regulatorListFlag = $_GET['regulatorListFlag'];
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
            if($entries->ProviderOffering[$i]->ServiceListOffering[$j]->attributes()->{'regulatorListFlag'} != $regulatorListFlag) {
                unset($entries->ProviderOffering[$i]->ServiceListOffering[$j]);
                $j--;
            }
        }
        if(count($entries->ProviderOffering[$i]->ServiceListOffering) == 0) {
            unset($entries->ProviderOffering[$i]);
            $i--;
        }
    }

}
if(isset( $_GET['ProviderName'])) {
    $providers = $_GET['ProviderName'];
    if(!is_array($providers)) {
        $providers = array($providers);
    }
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        $keep = false;
        for($j = 0; $j < count($entries->ProviderOffering[$i]->Provider->Name);$j++) {
            if(in_array($entries->ProviderOffering[$i]->Provider->Name[$j],$providers)) {
                $keep = true;
                break;
            }
        }
        if(!$keep) {
            unset($entries->ProviderOffering[$i]);
            $i--;
        }
    }
}
if(isset( $_GET['Language'])) {
    $language = $_GET['Language'];
    if(!is_array($language)) {
        $language = array($language);
    }
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
            $keep = false;
            for($k = 0; $k < count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->Language);$k++) {
                if(in_array($entries->ProviderOffering[$i]->ServiceListOffering[$j]->Language[$k],$language)) {
                    $keep = true;
                    break;
                }
            }
            if(!$keep) {
                unset($entries->ProviderOffering[$i]->ServiceListOffering[$j]);
                $j--;
            }
        }
        if(count($entries->ProviderOffering[$i]->ServiceListOffering) == 0) {
            unset($entries->ProviderOffering[$i]);
            $i--;
        }
    }
}
if(isset( $_GET['Genre'])) {
    $genre = $_GET['Genre'];
    if(!is_array($genre)) {
        $targetcountry = array($targetcountry);
    }
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
            $keep = false;
            for($k = 0; $k < count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->TargetCountry);$k++) {
                for($l =0; $l < count($targetcountry);$l++) {
                    if(strpos($entries->ProviderOffering[$i]->ServiceListOffering[$j]->TargetCountry[$k],$targetcountry[$l]) !== false) {
                        $keep = true;
                        break;
                    }
                }
                if($keep) {
                    break;
                }
            }
            if(!$keep) {
                unset($entries->ProviderOffering[$i]->ServiceListOffering[$j]);
                $j--;
            }
        }
        if(count($entries->ProviderOffering[$i]->ServiceListOffering) == 0) {
            unset($entries->ProviderOffering[$i]);
            $i--;
        }
    }
}

if(isset( $_GET['TargetCountry'])) {
    $targetcountry = $_GET['TargetCountry'];
    if(!is_array($targetcountry)) {
        $targetcountry = array($targetcountry);
    }
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
             //If no targetCountry, assume global list
            if( count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->TargetCountry) > 0) {
                $keep = false;
                for($k = 0; $k < count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->TargetCountry);$k++) {
                    for($l =0; $l < count($targetcountry);$l++) {
                        if(strpos($entries->ProviderOffering[$i]->ServiceListOffering[$j]->TargetCountry[$k],$targetcountry[$l]) !== false) {
                            $keep = true;
                            break;
                        }
                    }
                    if($keep) {
                        break;
                    }
                }
                if(!$keep) {
                    unset($entries->ProviderOffering[$i]->ServiceListOffering[$j]);
                    $j--;
                }
            }
        }
        if(count($entries->ProviderOffering[$i]->ServiceListOffering) == 0) {
            unset($entries->ProviderOffering[$i]);
            $i--;
        }
    }
}

$processed_list =str_replace("INSTALL~~LOCATION",$install_location,$list->asXML());

echo $processed_list;

?>

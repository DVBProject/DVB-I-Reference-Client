<?php
include 'configuration.php';

header('Content-Type: text/xml');
header('Access-Control-Allow-Origin: *');

$list = new Simplexmlelement(file_get_contents("./slepr-master.xml"));
$entries  = $list->children("urn:dvb:metadata:servicelistdiscovery:2024",false);
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
        $genre = array($genre);
    }
    $attr = 'href';
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
            $keep = false;
            for($k = 0; $k < count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->Genre);$k++) {
                for($l =0; $l < count($genre);$l++) {
                    if(strpos($entries->ProviderOffering[$i]->ServiceListOffering[$j]->Genre[$k]->attributes()->$attr,$genre[$l]) !== false) {
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


if(isset( $_GET['Delivery'])) {
    $types = array("dvb-dash" => array("DASHDelivery"),"dvb-t" => array("DVBTDelivery"),"dvb-c" => array("DVBCDelivery"),"dvb-s" => array("DVBSDelivery"),"dvb-iptv" => array("MulticastTSDelivery","RTSPDelivery"), "application" => array("ApplicationDelivery"));

    $delivery = $_GET['Delivery'];
    if(!is_array($delivery)) {
        $delivery = array($delivery);
    }
    $deliveryElements = array();
    for($h =0; $h < count($delivery);$h++) {
        if(array_key_exists($delivery[$h],$types)) {
            $deliveryElements = array_merge($deliveryElements,$types[$delivery[$h]]);
        }
    }
    for($i = 0; $i < count($entries->ProviderOffering);$i++) {
        for($j = 0; $j < count($entries->ProviderOffering[$i]->ServiceListOffering);$j++) {
            //Delivery element is mandatory
            if( count($entries->ProviderOffering[$i]->ServiceListOffering[$j]->Delivery) > 0) {
                $keep = false;
                $deliveryList = $entries->ProviderOffering[$i]->ServiceListOffering[$j]->Delivery[0];
                foreach ($deliveryList->children("urn:dvb:metadata:servicelistdiscovery:2024") as $child)
                {
                    for($l =0; $l < count($deliveryElements);$l++) {
                        if($deliveryElements[$l] == $child->getName()) {
                            $keep = true;
                            break;
                        }
                    }
                }
                if($keep) {
                    break;
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
if(!isset( $_GET['inlineImages']) || $_GET['inlineImages'] !== 'true') {
    $entries->registerXPathNamespace('tva','urn:tva:metadata:2024');
    $inline = $entries->xpath('//tva:InlineMedia');
    for($j = 0; $j < count($inline);$j++) {
        $parent= $inline[$j]->xpath("parent::*");
        $domRef = dom_import_simplexml($parent[0]);
        //Remove the RelatedMaterial parent-element. Could there be multiple MediaLocator elements in the relatedmaterial element?
        $domRef->parentNode->parentNode->removeChild($domRef->parentNode);

    }
    //ServiceListRegistryEntity uses different namespace for the InlineMedia-element
    $entries->registerXPathNamespace('mpeg7','urn:tva:mpeg7:2008');
    $inline = $entries->xpath('//mpeg7:InlineMedia');
    for($j = 0; $j < count($inline);$j++) {
        $parent= $inline[$j]->xpath("parent::*");
        $domRef = dom_import_simplexml($parent[0]);
        $domRef->parentNode->removeChild($domRef);
    }
}

$processed_list =str_replace("INSTALL~~LOCATION",$install_location,$list->asXML());

echo $processed_list;

?>

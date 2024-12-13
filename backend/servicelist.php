<?php
    include 'configuration.php';

    header( "Expires: Mon, 20 Dec 1998 01:00:00 GMT" );
    header( "Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT" );
    header( "Cache-Control: no-cache, must-revalidate" );
    header( "Pragma: no-cache" );
    header( "Content-Type: application/xml;charset=utf-8" );
    header("Access-Control-Allow-Origin: *");
    $list = NULL;
    $postcode = NULL;
    if(isset($_GET["list"])) {
      $list = $_GET["list"];
    }
    if(isset($_GET["postcode"])) {
      $postcode = $_GET["postcode"];
    }
    //postcode parameter is composed as <ServiceList_URL>?postcode=<postcode>
    //if the url has the list parameter, then the postcode-parameter is
    //contained in the list-parameter: servicelist.php?list=example.xlm?postcode=1234
    if($list != NULL && str_contains($list,'?')) {
      $arr = explode("?", $list);
      if(count($arr) == 2) {
        $list = $arr[0];
        $postcode = explode("=", $arr[1])[1];
      }

    }
    $servicelist = NULL;
    if(strlen($list) ==  0 || strpos($list,"..") !== false || strpos($list,"/") !== false || strpos( $list,".xml") !== (strlen($list)-4) || !file_exists("servicelists/".$list)  ) {
      $servicelist= file_get_contents("servicelists/example.xml");
    }
    else {
      $servicelist= file_get_contents("servicelists/".$list);
    }

    if($postcode != NULL) {
      $servicelist =  filterPostcode($servicelist,$postcode);
    }

    $servicelist =str_replace("INSTALL~~LOCATION",$install_location,$servicelist);
    echo $servicelist;


    function filterPostcode($servicelist,$postcode) {
      $xml = new Simplexmlelement($servicelist);
      $wildcard = substr_count($postcode,'*');
      if($wildcard > 1) {
        $xml->addAttribute("responseStatus","ERROR_INVALID_POSTCODE");
        return $xml->asXML();
      }

      $matchingRegions = array();
      $matchingServices = array();

      if(count($xml->RegionList) > 0) {
        for($i = 0; $i < count($xml->RegionList[0]->Region);$i++) {
          checkRegion($xml->RegionList[0]->Region[$i],$postcode,$wildcard == 1,$matchingRegions);
        }
        for($i = 0; $i < count($xml->LCNTableList[0]->LCNTable);$i++) {
          $match = false;
          for($j = 0; $j < count($xml->LCNTableList[0]->LCNTable[$i]->TargetRegion);$j++) {
            if(in_array($xml->LCNTableList[0]->LCNTable[$i]->TargetRegion[$j][0],$matchingRegions)) {
              $match = true;
              break;
            }
          }
          if($match == false ) {
            $domRef = dom_import_simplexml($xml->LCNTableList[0]->LCNTable[$i]);
            $domRef->parentNode->removeChild($domRef);
            $i--;
          }
          else {
            for($j = 0; $j < count($xml->LCNTableList[0]->LCNTable[$i]->LCN);$j++) {
              $matchingServices[] = (string)$xml->LCNTableList[0]->LCNTable[$i]->LCN[$j]->attributes()->{'serviceRef'};
            }
          }
        }
        for($i = 0; $i < count($xml->Service);$i++) {
          if(!in_array($xml->Service[$i]->UniqueIdentifier[0][0],$matchingServices)) {
            $domRef = dom_import_simplexml($xml->Service[$i]);
            $domRef->parentNode->removeChild($domRef);
            $i--;
          }
        }

      }
      $xml->addAttribute("responseStatus","OK");
      return $xml->asXML();
    }


    function checkRegion($region,$postcode,$wildcard,&$matchingRegions) {
      $match = false;
      for($j = 0; $j < count($region->PostcodeRange);$j++) {
        $from = (string)$region->PostcodeRange[$j]->attributes()->{'from'};
        $to = (string)$region->PostcodeRange[$j]->attributes()->{'to'};
        if($wildcard == false) {
          if(intval($from) <= intval($postcode) && intval($to) >= intval($postcode) ) {
            $match = true;
            break;
          }
        }
        else {
          //TODO: implement wildcard matching
        }
      }
      if($match == false) {
        for($j = 0; $j < count($region->Postcode);$j++) {
          if($wildcard == false) {
            if( $region->Postcode[$j][0] == $postcode) {
              $match = true;
              break;
            }
          }
          else {
            //TODO: implement wildcard matching
          }
        }
      }
      if($match == true) {
        $matchingRegions[] = (string)$region->attributes()->{'regionID'};
      }
      if(count($region->Region) > 0) {
        for($i = 0; $i < count($region->Region);$i++) {
          $matchChild = checkRegion($region->Region[$i],$postcode,$wildcard == 1,$matchingRegions);
          if($matchChild == false) {
            $i--;
          }
          if($match == false && $matchChild == true ) {
            $match = true;
          }
        }
      }
      if($match == false){
        $domRef = dom_import_simplexml($region);
        $domRef->parentNode->removeChild($domRef);
      }
      return $match;
    }
?>

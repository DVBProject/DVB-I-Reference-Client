var PROVIDER_LIST = "https://stage.sofiadigital.fi/dvb/dvb-i-reference-application/backend/servicelist_registry.php";

function parseServiceList(data,dvbChannels) {
    var list = [];
    var parser = new DOMParser();
    var doc = parser.parseFromString(data,"text/xml");
    var services = doc.getElementsByTagName("Service");
    var contentGuides = doc.getElementsByTagName("ContentGuideSource");
    var contentGuideURI = null;

    if(contentGuides.length > 0) {
        contentGuideURI = contentGuides[0].getElementsByTagName("ScheduleInfoEndpoint")[0].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
    }
    var maxLcn = 0;
    var lcnList = doc.getElementsByTagName("LCNTable")[0].getElementsByTagName("LCN");
    for (var i = 0; i < services.length ;i++) {
        var chan = {};
        chan.contentGuideURI = contentGuideURI;
        chan.code = i;
        chan.title = services[i].getElementsByTagName("ServiceName")[0].childNodes[0].nodeValue;
        chan.id = services[i].getElementsByTagName("UniqueIdentifier")[0].childNodes[0].nodeValue;
        var cgRefs =  services[i].getElementsByTagName("ContentGuideServiceRef");
        if(cgRefs && cgRefs.length > 0) {
            chan.contentGuideServiceRef = cgRefs[0].childNodes[0].nodeValue;
        }
        var relatedMaterial = services[i].getElementsByTagName("RelatedMaterial");
        for(var j = 0;j < relatedMaterial.length;j++) {
            var howRelated = relatedMaterial[j].getElementsByTagNameNS("urn:tva:metadata:2019","HowRelated")[0].getAttribute("href");
            if(howRelated == "urn:dvb:metadata:cs:HowRelatedCS:2019:1001.2") {
                chan.image = relatedMaterial[j].getElementsByTagNameNS("urn:tva:metadata:2019","MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0].childNodes[0].nodeValue;
            }
        }
        var serviceInstances = services[i].getElementsByTagName("ServiceInstance");
        var sourceTypes = [];
        for(var j = 0;j < serviceInstances.length;j++) {
            var sourceType =serviceInstances[j].getElementsByTagName("SourceType")[0].childNodes[0].nodeValue;
            if(sourceType == "urn:dvb:metadata:source:dvb-dash") {
                   sourceTypes.push("DVB-DASH");
                   try {chan.dashUrl = serviceInstances[j].getElementsByTagName("URI")[0].childNodes[0].nodeValue;}catch(e) {}
            }
            if(dvbChannels && (sourceType == "urn:dvb:metadata:source:dvb-t" ||
               sourceType == "urn:dvb:metadata:source:dvb-c" ||
               sourceType == "urn:dvb:metadata:source:dvb-s" ) ) {
                //Just search for the triplet in the channel list;
                var triplet = serviceInstances[j].getElementsByTagName("DVBTriplet")[0];
                for(var k = 0;k<dvbChannels.length;k++) {
                    var dvbChannel = dvbChannels.item(k);
                    if(dvbChannel.sid == triplet.getAttribute("serviceId") &&
                       dvbChannel.onid == triplet.getAttribute("origNetId") &&
                       dvbChannel.tsid == triplet.getAttribute("tsId")) {
                         chan.dvbChannel = dvbChannel;
                         sourceTypes.push("DVB-"+ sourceType.charAt(sourceType.length-1).toUpperCase());
                         break;
                       }
                }
            }
        }
        if(sourceTypes.length == 0) {
            continue;
        }
        for(var j = 0;j < lcnList.length;j++) {
            if(lcnList[j].getAttribute("serviceRef") == chan.id) {
                chan.lcn = parseInt(lcnList[j].getAttribute("channelNumber"));
                if(chan.lcn > maxLcn) {
                    maxLcn = chan.lcn;
                }
                break;
            }
        }
        chan.epg = [];
        chan.sourceTypes =sourceTypes.join('/');
	    list.push(chan);
    }
    for (var i = 0; i < list.length ;i++) {
        if(!list[i].lcn) {
            list[i].lcn = ++maxLcn;
        }
    }
    return list;
}

function generateServiceListQuery(baseurl,providers,language,genre,targetCountry,regulatorListFlag) {
    var query = baseurl;
    var parameters = [];
    if(Array.isArray(providers) && providers.length > 0) {
        for(var i = 0; i < providers.length;i++) {
            if(providers[i] !== "") {
                parameters.push("ProviderName[]="+providers[i]);
            }
        }
    }
    else if(providers != null && providers !== ""){
        parameters.push("ProviderName="+providers);
    }

    if(Array.isArray(language) && language.length > 0) {
        for(var i = 0; i < language.length;i++) {
            if(language[i] !== "") {
                parameters.push("Language[]="+language[i]);
            }
        }
    }
    else if(language != null && language !== ""){
        parameters.push("Language="+language);
    }

    if(Array.isArray(genre) && genre.length > 0) {
        for(var i = 0; i < genre.length;i++) {
            if(genre[i] !== "") {
                parameters.push("Genre[]="+genre[i]);
            }
        }
    }
    else if(genre != null && genre !== ""){
        parameters.push("Genre="+genre);
    }

    if(Array.isArray(targetCountry) && targetCountry.length > 0) {
        for(var i = 0; i < targetCountry.length;i++) {
            if(targetCountry[i] !== "") {
                parameters.push("TargetCountry[]="+targetCountry[i]);
            }
        }
    }
    else if(targetCountry != null && targetCountry !== ""){
        parameters.push("TargetCountry="+targetCountry);
    }

    if(regulatorListFlag === true) {
        parameters.push("regulatorListFlag=true");
    }
    if(parameters.length > 0) {
        query += "?"+parameters.join('&');
    }
    return query;

}

function parseServiceListProviders(data) {
  var providerslist = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(data,"text/xml");
  var providers = doc.getElementsByTagName("sld:ProviderOffering");
  for(var i = 0;i < providers.length;i++) {
    var providerInfo = providers[i].getElementsByTagName("sld:Provider");
    var info = {};
    if(providerInfo.length > 0) {
        info["name"] = providerInfo[0].getElementsByTagName("sld:Name")[0].childNodes[0].nodeValue;
    }
    var lists = providers[i].getElementsByTagName("sld:ServiceListOffering");
    var servicelists = [];
    info["servicelists"] = servicelists;
    for(var j = 0;j < lists.length;j++) {
        var list = {};
        list["name"] = lists[j].getElementsByTagName("sld:ServiceListName")[0].childNodes[0].nodeValue;
        list["url"] = lists[j].getElementsByTagName("sld:ServiceListURI")[0].getElementsByTagName("dvbisd:URI")[0].childNodes[0].nodeValue;
        servicelists.push(list);
    }
    providerslist.push(info);
  }
  return providerslist;
 
}

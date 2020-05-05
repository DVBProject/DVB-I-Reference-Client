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
        var instances = [];
        var sourceTypes = [];
        for(var j = 0;j < serviceInstances.length;j++) {
            var priority = serviceInstances[j].getAttribute("priority");
            var instance = {};
            instance.priority = priority;
            if(serviceInstances[j].getElementsByTagName("DASHDeliveryParameters").length > 0 ) {
                   try {
                    instance.dashUrl = serviceInstances[j].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
                    sourceTypes.push("DVB-DASH");
                    instances.push(instance);
                   }catch(e) {}
            }
            else if(dvbChannels) {
                var triplets = serviceInstances[j].getElementsByTagName("DVBTriplet");
                if(triplets.length > 0 ) {
                    var dvbChannel = getDVBChannel(triplets[0],dvbChannels);
                    if(dvbChannel) {
                        if(serviceInstances[j].getElementsByTagName("DVBTDeliveryParameters").length > 0) {
                            sourceTypes.push("DVB-T");
                            instance.dvbChannel = dvbChannel;
                            instances.push(instance);
                        }
                        else if(serviceInstances[j].getElementsByTagName("DVBSDeliveryParameters").length > 0) {
                            sourceTypes.push("DVB-S");
                            instance.dvbChannel = dvbChannel;
                            instances.push(instance);
                        }
                        else if(serviceInstances[j].getElementsByTagName("DVBCDeliveryParameters").length > 0) {
                            sourceTypes.push("DVB-C");
                            instance.dvbChannel = dvbChannel;
                            instances.push(instance);
                        }
                    }
                }
            }
        }
        if(instances.length == 0) {
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
        chan.serviceInstances =instances;
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

function getDVBChannel(tripletElement,dvbChannels) {
    if(!dvbChannels) {
        return null;
    }
    for(var i = 0;i<dvbChannels.length;i++) {
        var dvbChannel = dvbChannels.item(i);
        if(dvbChannel.sid == tripletElement.getAttribute("serviceId") &&
            dvbChannel.onid == tripletElement.getAttribute("origNetId") &&
            dvbChannel.tsid == tripletElement.getAttribute("tsId")) {
            return dvbChannel;
        }
    }
    return null;
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
  var providers = doc.getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","ProviderOffering");
  for(var i = 0;i < providers.length;i++) {
    var providerInfo = providers[i].getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","Provider");
    var info = {};
    if(providerInfo.length > 0) {
        info["name"] = providerInfo[0].getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","Name")[0].childNodes[0].nodeValue;
    }
    var lists = providers[i].getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","ServiceListOffering");
    var servicelists = [];
    info["servicelists"] = servicelists;
    for(var j = 0;j < lists.length;j++) {
        var list = {};
        list["name"] = lists[j].getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","ServiceListName")[0].childNodes[0].nodeValue;
        list["url"] = lists[j].getElementsByTagNameNS("urn:dvb:metadata:servicelistdiscovery:2019","ServiceListURI")[0].getElementsByTagNameNS("urn:dvb:metadata:servicediscovery:2019","URI")[0].childNodes[0].nodeValue;
        servicelists.push(list);
    }
    providerslist.push(info);
  }
  return providerslist;
 
}

getParentalRating = function(href){
    if(href == "urn:fvc:metadata:cs:ContentRatingCS:2014-07:no_parental_controls") {
        return "None";
    }
    else if(href == "urn:fvc:metadata:cs:ContentRatingCS:2014-07:fifteen") {
        return "15";
    }
    else {
        return "Unknown";
    }
}

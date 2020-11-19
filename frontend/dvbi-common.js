var PROVIDER_LIST = "https://devel.sofiadigital.fi/home/tsa/dvb-i-reference-application/backend/servicelist_registry.php";

function parseServiceList(data,dvbChannels,supportedDrmSystems) {
    var serviceList = {}
    var list = [];
    serviceList.services = list;
    var parser = new DOMParser();
    var doc = parser.parseFromString(data,"text/xml");
    var ns = doc.documentElement.namespaceURI;
    var howRelatedNamespace = "urn:tva:metadata:2019";
    var howRelatedHref = "urn:dvb:metadata:cs:HowRelatedCS:2019:";
    if(ns == "urn:dvb:metadata:servicediscovery:2020") {
      howRelatedNamespace = "urn:dvb:metadata:servicediscovery:2020";
      howRelatedHref = "urn:dvb:metadata:cs:HowRelatedCS:2020:";
    }
    var services = getChildElements(doc.documentElement,"Service");
    var contentGuides = getChildElements(doc.documentElement,"ContentGuideSource");
    var contentGuideURI = null;
    var channelmap = [];
    if(dvbChannels) {
      for(var i = 0;i<dvbChannels.length;i++) {
          var dvbChannel = dvbChannels.item(i);
          var triplet = dvbChannel.onid +"."+dvbChannel.tsid+"."+dvbChannel.sid;
          channelmap[triplet] = dvbChannel;
      }
    }
    if(contentGuides.length > 0) {
        contentGuideURI = contentGuides[0].getElementsByTagName("ScheduleInfoEndpoint")[0].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
    }
    var relatedMaterial = getChildElements(doc.documentElement,"RelatedMaterial");
    for(var j = 0;j < relatedMaterial.length;j++) {
        var howRelated = relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"HowRelated")[0].getAttribute("href");
        if(howRelated == howRelatedHref+"1001.1") {
            serviceList.image = relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0].childNodes[0].nodeValue;
        }
    }
    var regionList = getChildElements(doc.documentElement,"RegionList");
    if(regionList.length > 0) {
       serviceList.regions = [];
       var regions =  getChildElements(regionList[0],"Region");
       for (var i = 0; i < regions.length ;i++) {
          var regionElement = regions[i];
          serviceList.regions.push(parseRegion(regionElement));
          var secondaryRegions =  getChildElements(regionElement,"Region");
          for (var j = 0; j < secondaryRegions.length ;j++) {
            var regionElement = secondaryRegions[j];
            serviceList.regions.push(parseRegion(regionElement));
            var tertiaryRegions =  getChildElements(regionElement,"Region");
            for (var k = 0; k < tertiaryRegions.length ;k++) {
              var regionElement = tertiaryRegions[k];
              serviceList.regions.push(parseRegion(regionElement));
            }
          }
       }
    }

    var maxLcn = 0;
    var lcnList = doc.getElementsByTagName("LCNTable")[0].getElementsByTagName("LCN");
    for (var i = 0; i < services.length ;i++) {
        var chan = {};
        chan.contentGuideURI = contentGuideURI;
        chan.code = i;
        chan.title = services[i].getElementsByTagName("ServiceName")[0].childNodes[0].nodeValue;
        chan.id = services[i].getElementsByTagName("UniqueIdentifier")[0].childNodes[0].nodeValue;
        var providers = services[i].getElementsByTagName("ProviderName");
        if(providers.length > 0) {
          chan.provider = providers[0].childNodes[0].nodeValue;
        }
        chan.parallelApps = [];
        chan.mediaPresentationApps = [];
        var cgRefs =  services[i].getElementsByTagName("ContentGuideServiceRef");
        if(cgRefs && cgRefs.length > 0) {
            chan.contentGuideServiceRef = cgRefs[0].childNodes[0].nodeValue;
        }
        var relatedMaterial = getChildElements(services[i],"RelatedMaterial");
        for(var j = 0;j < relatedMaterial.length;j++) {
            var howRelated = relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"HowRelated")[0].getAttribute("href");
            if(howRelated == howRelatedHref+"1001.2") {
                chan.image = relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0].childNodes[0].nodeValue;
            }
            else if(howRelated == "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.1") {
                var app = {};
                var mediaUri =  relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0];
                app.url = mediaUri.childNodes[0].nodeValue;
                app.contentType = mediaUri.getAttribute("contentType");
                chan.parallelApps.push(app);
            }
            else if(howRelated == "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.2") {
                var app = {};
                var mediaUri =  relatedMaterial[j].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0];
                app.url = mediaUri.childNodes[0].nodeValue;
                app.contentType = mediaUri.getAttribute("contentType");
                chan.mediaPresentationApps.push(app);
            }
        }
        var serviceInstances = services[i].getElementsByTagName("ServiceInstance");
        var instances = [];
        var sourceTypes = [];
        for(var j = 0;j < serviceInstances.length;j++) {
            var priority = serviceInstances[j].getAttribute("priority");
            var instance = {};
            instance.priority = priority;
            instance.contentProtection = [];
            instance.parallelApps = [];
            instance.mediaPresentationApps = [];
            var contentProtectionElements =  getChildElements(serviceInstances[j],"ContentProtection");
            var drmSupported = true;
            for(var k = 0;k < contentProtectionElements.length;k++) {
              for(var l = 0;l < contentProtectionElements[k].childNodes.length;l++) {
                if(contentProtectionElements[k].childNodes[l].nodeName == "DRMSystemId") {
                  var drmSystem = contentProtectionElements[k].childNodes[l];
                  var drm = {};
                  drm.encryptionScheme = drmSystem.getAttribute("encryptionScheme");
                  drm.drmSystemId = drmSystem.getElementsByTagName("DRMSystemId")[0].childNodes[0].nodeValue;
                  instance.contentProtection.push(drm);
                }
              }
            }
            if(supportedDrmSystems && instance.contentProtection.length > 0) {
              var supported = false;
              for(var k = 0;k < instance.contentProtection.length;k++) {
                 for(var l = 0;l < supportedDrmSystems.length;l++) {
                    if(instance.contentProtection[k].drmSystemId.toLowerCase() == (supportedDrmSystems[l].toLowerCase())) {
                      supported = true;
                      break;
                    }
                  }
                if(supported) {
                  break;
                }
              }
              if(!supported) {
                continue;
              }
            }
            var availability = getChildElements(serviceInstances[j],"Availability");
            instance.availability = null;
            if(availability.length > 0 ) {
              instance.availability = [];
              //Only 1 availability-element allowed
              var periods = getChildElements(availability[0],"Period");
              for(var k = 0;k < periods.length;k++) {
                var period ={};
                period.validFrom = periods[k].getAttribute("validFrom");
                period.validTo = periods[k].getAttribute("validTo");
                period.intervals = [];
                var intervals = getChildElements(periods[k],"Interval");
                for(var l = 0;l < intervals.length;l++) {
                  var interval = {};
                  interval.days = intervals[l].getAttribute("days");
                  interval.recurrence = intervals[l].getAttribute("recurrence");
                  interval.startTime = intervals[l].getAttribute("startTime");
                  interval.endTime = intervals[l].getAttribute("endTime");
                  period.intervals.push(interval);
                }
                instance.availability.push(period);
              }
            }
            var relatedMaterial = getChildElements(serviceInstances[j],"RelatedMaterial");
            for(var k = 0;k < relatedMaterial.length;k++) {
                var howRelated = relatedMaterial[k].getElementsByTagNameNS(howRelatedNamespace,"HowRelated")[0].getAttribute("href");
                if(howRelated == "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.1") {
                    var app = {};
                    var mediaUri =  relatedMaterial[k].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0];
                    app.url = mediaUri.childNodes[0].nodeValue;
                    app.contentType = mediaUri.getAttribute("contentType");
                    instance.parallelApps.push(app);
                }
                else if(howRelated == "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.2") {
                    var app = {};
                    var mediaUri =  relatedMaterial[k].getElementsByTagNameNS(howRelatedNamespace,"MediaLocator")[0].getElementsByTagNameNS("urn:tva:metadata:2019","MediaUri")[0];
                    app.url = mediaUri.childNodes[0].nodeValue;
                    app.contentType = mediaUri.getAttribute("contentType");
                    instance.mediaPresentationApps.push(app);
                }
            }
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
                    var triplet = triplets[0].getAttribute("origNetId")+"."+triplets[0].getAttribute("tsId")+"."+triplets[0].getAttribute("serviceId");
                    var dvbChannel = channelmap[triplet];
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
            if(instance.mediaPresentationApps.length > 0 && instances.indexOf(instance) == -1) {
                instances.push(instance);
            }
        }
        if(instances.length == 0 && chan.mediaPresentationApps.length == 0) {
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
    return serviceList;
}

function parseRegion(regionElement) {
  var region = {};
  region.countryCodes = regionElement.getAttribute("countryCodes");
  region.regionID = regionElement.getAttribute("regionID");
  var names = getChildElements(regionElement,"RegionName");
  if(names.length == 1) {
    region.regionName = names[0].childNodes[0].nodeValue;
  }
  else if(names.length > 1) {
    region.regionNames = [];
    for(var j = 0;j < names.length;j++) {
      var name = {};
      name.name =  names[j].childNodes[0].nodeValue;
      name.lang = names[j].getAttributeNS("xml","lang");
      region.regionNames.push(name);
    }
  }
  var wildcardPostcodes = getChildElements(regionElement,"WildcardPostcode");
  if(wildcardPostcodes.length > 0) {
    region.wildcardPostcodes = [];
    for(var j = 0;j < wildcardPostcodes.length;j++) {
      region.wildcardPostcodes.push(wildcardPostcodes[j].childNodes[0].nodeValue);
    }
  }
  var postcodes = getChildElements(regionElement,"Postcode");
  if(postcodes.length > 0) {
    region.postcodes = [];
    for(var j = 0;j < postcodes.length;j++) {
      region.postcodes.push(postcodes[j].childNodes[0].nodeValue);
    }
  }
  var postcodeRanges = getChildElements(regionElement,"PostcodeRange");
  if(postcodeRanges.length > 0) {
    region.postcodeRanges = [];
    for(var j = 0;j < postcodeRanges.length;j++) {
      var range = {};
      range.from = postcodeRanges[j].getAttribute("from");
      range.to = postcodeRanges[j].getAttribute("to");
      region.postcodeRanges.push(range);
    }
  }
  var coordinates = getChildElements(regionElement,"Coordinates");
  if(coordinates.length > 0) {
    region.coordinates = [];
    for(var j = 0;j < coordinates.length;j++) {
      var coordinate = {};
      coordinate.latitude = getChildElements(coordinates[j],"Latitude")[0].childNodes[0].nodeValue;
      coordinate.longitude = getChildElements(coordinates[j],"Longitude")[0].childNodes[0].nodeValue;
      coordinate.radius = getChildElements(coordinates[j],"Radius")[0].childNodes[0].nodeValue;
      region.coordinates.push(coordinate);
    }
  }
  return region;
}

function getChildElements(parent,tagName) {
  var elements= [];
  for(i = 0; i < parent.childNodes.length; i++)
  {
    if(parent.childNodes[i].nodeType == 1 && parent.childNodes[i].tagName == tagName) {
      elements.push(parent.childNodes[i]);
    }
  }
  return elements;
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

function isServiceInstanceAvailable(instance) {
  if(instance.availability) {
    var now = new Date();
    now.setMilliseconds(0);
    for(var i = 0; i < instance.availability.length;i++) {
      var period = instance.availability[i];
      if(period.validFrom) {
        if(new Date(period.validFrom) > now) {
          continue;
        }
      }
      if(period.validTo) {
        if(new Date(period.validTo) < now) {
          continue;
        }
      }
      if(period.intervals) {
        for(var j = 0; j < period.intervals.length;j++) {
          var interval = period.intervals[j];
          if(isIntervalNow(interval,now)) {
            return true;
          }
        }
      }
      else {
        return true;
      }
    }
    return false;
  }
  return true;
}

function isIntervalNow(interval,now) {
   if(interval.days) {
    var day = now.getDay();
    //JS days are 0..6 starting from sunday
    //Availability days are 1..7 starting from monday
    //So change sunday from 0 to 7
    if(day == 0) {
      day = 7;
    }
    day = day.toString();
    if(interval.days.indexOf(day) == -1) {
      return false;
    }
  }
  if(interval.startTime) {
    if(parseIntervalTime(interval.startTime) > now) {
      return false;
    }
  }
  if(interval.endTime) {
    if(parseIntervalTime(interval.endTime) <= now) {
      return false;
    }
  }
  return true;
}

function parseIntervalTime(time,day) {
  if(time.length == 9 && time.charAt(8) == 'Z') {
    var date = new Date();
    var timeparts = time.substring(0,8).split(":");
    date.setUTCHours(parseInt(timeparts[0]));
    date.setUTCMinutes(parseInt(timeparts[1]));
    date.setUTCSeconds(parseInt(timeparts[2]));
    date.setMilliseconds(0);
    return date;
  }
  return null;
}

var dvb_i_language_list = {
  "eng": "English",
  "deu" : "Deutsch",
  "fin":"Suomi"
}

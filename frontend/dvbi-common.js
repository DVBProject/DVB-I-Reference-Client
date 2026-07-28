var PROVIDER_LIST = INSTALL_LOCATION + "/backend/servicelist_registry.php";

/** LCN_services_only
 * set to true to only include services in the selected region that are included in the reevant LCN table.
 * setting this value to false will add all services, but those that are not in the LCN will use channel numbers starting with First_undeclared_channel
 **/
/* const */ var LCN_services_only = false;
/* const */ var First_undeclared_channel = 7000;

// this is an inline representation of frontend/android/images/invalid-digest-image.jpeg  [[made with https://ezgif.com/image-to-datauri]]
var INVALID_DIGEST_IMAGE = "data:image/jpeg;base64,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";

function parseContentGuideSource(src) {
  var newCS = {
    id: "",
    contentGuideURI: null,
    moreEpisodesURI: null,
    programInfoURI: null,
  };
  if (src) {
    newCS.id = src.getAttribute("CGSID");
    newCS.contentGuideURI = src
      .getElementsByTagNameNS(DVBi_ns, "ScheduleInfoEndpoint")[0]
      .getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
    var moreEpisodes = src.getElementsByTagNameNS(DVBi_ns, "MoreEpisodesEndpoint");
    if (moreEpisodes.length > 0) {
      newCS.moreEpisodesURI = moreEpisodes[0].getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
    }
    var programInfo = src.getElementsByTagNameNS(DVBi_ns, "ProgramInfoEndpoint");
    if (programInfo.length > 0) {
      newCS.programInfoURI = programInfo[0].getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
    }
  }
  return newCS;
}

function getChildValue(element, childElementName, attrib = null) {
  var x = getChildValues(element, childElementName, attrib);
  return x.length > 0 ? x[0] : null;
}

function getChildValues(element, childElementName, attrib = null) {
  var res = [];
  var kids = getChildElements(element, childElementName);
  for (var i = 0; i < kids.length; i++) {
    if (attrib) {
      if (kids[i].hasAttribute(attrib)) res.push(kids[i].getAttribute(attrib));
    } else res.push(kids[i].childNodes[0].nodeValue);
  }
  return res;
}

function parseTVAAudioAttributesType(audio_attributes_element) {
  var res = {},
    se;
  se = getChildElements(audio_attributes_element, "Coding");
  res.coding = se.length > 0 ? AudioCodingCS(getChildValue(audio_attributes_element, "Coding", "href")) : null;
  //res.num_channels = getChildValue(audio_attributes_element, "NumOfChannels");
  se = getChildElements(audio_attributes_element, "MixType");
  res.mix_type = se.length > 0 ? AudioPresentationCS(getChildValue(audio_attributes_element, "MixType", "href")) : null;
  res.language = getChildValue(audio_attributes_element, "AudioLanguage");
  //res.sample_frequency = getChildValue(audio_attributes_element, "SampleFrequency");
  //res.sample_size = getChildValue(audio_attributes_element, "BitsPerSample");
  //se = getChildElements(audio_attributes_element, "BitRate");
  //res.bit_rate = se.length > 0 ? getChildValue(audio_attributes_element, "BitRate") : null;
  return res;
}

function AccessibilityApplication(element) {
  var res = null;
  var apps = element.getElementsByTagNameNS(TVA_ns, "AppInformation");
  if (apps.length) {
    var req_std = apps[0].getElementsByTagNameNS(TVA_ns, "RequiredStandardVersion");
    var req_opts = apps[0].getElementsByTagNameNS(TVA_ns, "RequiredOptionalFeature");

    res = req_std ? makeString(StandardVersion(req_std[0].childNodes[0].nodeValue)) : "unspecified platform";
    var feat = [];
    for (var i = 0; i < req_opts.length; i++) {
      feat.push(makeString(OptionalFeature(req_opts[i].childNodes[0].nodeValue)));
    }
    res += (feat.length ? "; " : "") + feat.join(", ");
  }
  return res;
}

function makeString(val_or_vals) {
  if (datatypeIs(val_or_vals, "string")) return val_or_vals;
  if (datatypeIs(val_or_vals, "array")) {
    var res = [];
    val_or_vals.forEach((v) => {
      res.push(v.startsWith("~") ? i18n.getString(v.substring(1)) : v);
    });
    return res.join(",");
  }
  return "!!cannot process!!";
}

function AudioAttributesString(aa) {
  if (!aa) return "";
  var res = [];
  if (aa.coding) res.push(makeString(aa.coding));
  //if (aa.num_channels) res.push(aa.num_channels + "ch");
  if (aa.mix_type) res.push(makeString(aa.mix_type));
  if (aa.language) res.push(i18n.getLanguageName(aa.language));
  //if (aa.sample_frequency) res.push(aa.sample_frequency + "Hz");
  //if (aa.sample_size) res.push(aa.sample_size + "bits");
  //if (aa.bit_rate) res.push(aa.bit_rate + "bps");
  return res.join(" / ");
}

function ParseTVAAccessibilityAttributes(accessibility_element) {
  var res = {};
  var sub_attributes = getChildElements(accessibility_element, "SubtitleAttributes");
  if (sub_attributes.length > 0) {
    res.subtitles = [];
    for (k = 0; k < sub_attributes.length; k++) {
      var subt = {};
      subt.language = getChildValue(sub_attributes[k], "SubtitleLanguage");
      subt.carriage = SubtitleCarriageCS(getChildValues(sub_attributes[k], "Carriage", "href"));
      subt.coding = SubtitleCodingCS(getChildValues(sub_attributes[k], "Coding", "href"));
      subt.purpose = SubtitlePurposeCS(getChildValues(sub_attributes[k], "Purpose", "href"));
      subt.forTTS = getChildValue(sub_attributes[k], "SuitableForTTS");
      subt.app = AccessibilityApplication(sub_attributes[k]);
      res.subtitles.push(subt);
    }
  }
  var ad_attributes = getChildElements(accessibility_element, "AudioDescriptionAttributes");
  if (ad_attributes.length > 0) {
    res.audio_descriptions = [];
    for (k = 0; k < ad_attributes.length; k++) {
      var ad = {};
      var audio_attributes = getChildElements(ad_attributes[k], "AudioAttributes");
      if (audio_attributes.length > 0) ad.audio_attributes = parseTVAAudioAttributesType(audio_attributes[0]);
      var receiver_mix = getChildValue(ad_attributes[k], "ReceiverMix");
      ad.mix = receiver_mix ? receiver_mix.toLowerCase() : "false";
      ad.app = AccessibilityApplication(ad_attributes[k]);
      res.audio_descriptions.push(ad);
    }
  }
  var sign_attributes = getChildElements(accessibility_element, "SigningAttributes");
  if (sign_attributes.length > 0) {
    res.signings = [];
    for (k = 0; k < sign_attributes.length; k++) {
      var sa = {};
      sa.coding = VideoCodecCS(getChildValue(sign_attributes[k], "Coding", "href"));
      sa.language = getChildValue(sign_attributes[k], "SignLanguage");
      sa.closed = getChildValue(sign_attributes[k], "Closed");
      sa.app = AccessibilityApplication(sign_attributes[k]);
      res.signings.push(sa);
    }
  }
  var de_attributes = getChildElements(accessibility_element, "DialogueEnhancementAttributes");
  if (de_attributes.length > 0) {
    res.dialogue_enhancements = [];
    for (k = 0; k < de_attributes.length; k++) {
      var audio_attributes = getChildElements(de_attributes[k], "AudioAttributes");
      res.dialogue_enhancements.push({
        audio_attributes: parseTVAAudioAttributesType(audio_attributes[0]),
        app: AccessibilityApplication(de_attributes[k]),
      });
    }
  }
  var spoken_sub_attributes = getChildElements(accessibility_element, "SpokenSubtitlesAttributes");
  if (spoken_sub_attributes.length > 0) {
    res.spoken_subtitles = [];
    for (k = 0; k < spoken_sub_attributes.length; k++) {
      var audio_attributes = getChildElements(spoken_sub_attributes[k], "AudioAttributes");
      res.spoken_subtitles.push({
        audio_attributes: parseTVAAudioAttributesType(audio_attributes[0]),
        app: AccessibilityApplication(spoken_sub_attributes[k]),
      });
    }
  }
  var magnification_attributes = getChildElements(accessibility_element, "MagnificationUIAttributes");
  if (magnification_attributes.length > 0) {
    res.magnification_ui = [];
    for (k = 0; k < magnification_attributes.length; k++) {
      res.magnification_ui.push({
        app: AccessibilityApplication(magnification_attributes[k]),
        purpose: AccessibilityPurposeCS(getChildValues(magnification_attributes[k], "Purpose", "href")),
      });
    }
  }
  var high_contrast_attributes = getChildElements(accessibility_element, "HighContrastUIAttributes");
  if (high_contrast_attributes.length > 0) {
    res.high_contrast_ui = [];
    for (k = 0; k < high_contrast_attributes.length; k++) {
      res.high_contrast_ui.push({
        app: AccessibilityApplication(high_contrast_attributes[k]),
        purpose: AccessibilityPurposeCS(getChildValues(high_contrast_attributes[k], "Purpose", "href")),
      });
    }
  }
  var screen_reader_attributes = getChildElements(accessibility_element, "ScreenReaderAttributes");
  if (screen_reader_attributes.length > 0) {
    res.screen_reader_ui = [];
    for (k = 0; k < screen_reader_attributes.length; k++) {
      res.screen_reader_ui.push({
        app: AccessibilityApplication(screen_reader_attributes[k]),
        purpose: AccessibilityPurposeCS(getChildValues(screen_reader_attributes[k], "Purpose", "href")),
      });
    }
  }
  var response_action_attributes = getChildElements(accessibility_element, "ResponseToUserActionAttributes");
  if (response_action_attributes.length > 0) {
    res.response_to_user_action_ui = [];
    for (k = 0; k < response_action_attributes.length; k++) {
      res.response_to_user_action_ui.push({
        app: AccessibilityApplication(response_action_attributes[k]),
        purpose: AccessibilityPurposeCS(getChildValues(response_action_attributes[k], "Purpose", "href")),
      });
    }
  }
  return res;
}

function formatAccessibilityAttributes(accessibility_attributes) {
  if (!accessibility_attributes) return "";

  function AppAndPurpose(el, index) {
    if (!el) return "";
    return (
      (index != 0 ? "<tr>" : "") +
      "<td>" +
      (el.app ? el.app + "<br/>" : "") +
      (el.purpose ? makeString(el.purpose) : "") +
      "</td></tr>"
    );
  }

  function AppAndAudio(el, index) {
    if (!el) return "";
    return (
      (index != 0 ? "<tr>" : "") +
      "<td>" +
      (el.app ? el.app + "<br/>" : "") +
      (el.audio_attributes ? AudioAttributesString(el.audio_attributes) : "") +
      "</td></tr>"
    );
  }

  // include any accessibility items
  var res = "<table id='accessibility-info'>",
    count = 0,
    i;

  if (accessibility_attributes.subtitles) {
    count += accessibility_attributes.subtitles.length;
    res += `<tr><td rowspan=${accessibility_attributes.subtitles.length}><img style="${accessibility_colour_result.filter}" src="${CAPTIONS_ICON}" height="20" alt="Subtitle"/></td>`;
    for (i = 0; i < accessibility_attributes.subtitles.length; i++) {
      var sub = accessibility_attributes.subtitles[i],
        attrs = [];
      if (sub.language) attrs.push(i18n.getLanguageName(sub.language));
      if (sub.carriage) attrs.push(makeString(sub.carriage));
      if (sub.coding) attrs.push(makeString(sub.coding));
      if (sub.purpose) attrs.push(makeString(sub.purpose));
      attrs.push(
        `<img style="${
          sub.carriage.includes(OPEN_SUBITLES_STRING)
            ? no_accessibility_colour_result.filter
            : accessibility_colour_result.filter
        }" src="${CLOSED_CAPTIONS_ICON}" height="20" alt="captions"/>`
      );

      res += (i != 0 ? "<tr>" : "") + "<td>" + (sub.app ? sub.app + "<br/>" : "") + attrs.join(" / ") + "</td></tr>";
    }
  }
  if (accessibility_attributes.audio_descriptions) {
    count += accessibility_attributes.audio_descriptions.length;
    res += `<tr><td rowspan=${accessibility_attributes.audio_descriptions.length}><img style="${accessibility_colour_result.filter}" src="${AUDIO_DESCRIPTION_ICON}" height="20" alt="Audio Description"/></td>`;
    for (i = 0; i < accessibility_attributes.audio_descriptions.length; i++) {
      var ad = accessibility_attributes.audio_descriptions[i],
        attrs = [];
      attrs.push(
        `<img style="${
          ad.mix == "true" ? accessibility_colour_result.filter : no_accessibility_colour_result.filter
        }" src="${RECEIVER_MIX_ICON}" height="20" alt="RX-MIX"/>`
      );
      if (ad.audio_attributes) attrs.push(AudioAttributesString(ad.audio_attributes));
      res += (i != 0 ? "<tr>" : "") + "<td>" + (ad.app ? ad.app + "<br/>" : "") + attrs.join(" / ") + "</td></tr>";
    }
    res += "";
  }
  if (accessibility_attributes.signings) {
    count += accessibility_attributes.signings.length;
    res += `<tr><td rowspan=${accessibility_attributes.signings.length}><img style="${accessibility_colour_result.filter}" src="${SIGNING_ICON}" height="20" alt="Signing"/></td>`;
    for (i = 0; i < accessibility_attributes.signings.length; i++) {
      var sa = accessibility_attributes.signings[i],
        attrs = [];
      if (sa.coding) attrs.push(makeString(sa.coding));
      if (sa.language) attrs.push(i18n.getLanguageName(sa.language));
      attrs.push(
        `<img style="${
          sa.closed == "true" ? accessibility_colour_result.filter : no_accessibility_colour_result.filter
        }" src="${CLOSED_CAPTIONS_ICON}" height="20" alt="captions"/>`
      );
      res += (i != 0 ? "<tr>" : "") + "<td>" + (sa.app ? sa.app + "<br/>" : "") + attrs.join(" / ") + "</td></tr>";
    }
  }
  if (accessibility_attributes.dialogue_enhancements) {
    count += accessibility_attributes.dialogue_enhancements.length;
    res += `<tr><td rowspan=${accessibility_attributes.dialogue_enhancements.length}><img style="${accessibility_colour_result.filter}" src="${DIALOG_ENHANCEMENT_ICON}" height="20" alt="Dialog Enhancement"/></td>`;
    for (i = 0; i < accessibility_attributes.dialogue_enhancements.length; i++) {
      res += AppAndAudio(accessibility_attributes.dialogue_enhancements[i], i);
    }
  }
  if (accessibility_attributes.spoken_subtitles) {
    count += accessibility_attributes.spoken_subtitles.length;
    res += `<tr><td rowspan=${accessibility_attributes.spoken_subtitles.length}><img style="${accessibility_colour_result.filter}" src="${SPOKEN_SUBTITLES_ICON}" height="20" alt="Spoken Subtitles"/></td>`;
    for (i = 0; i < accessibility_attributes.spoken_subtitles.length; i++) {
      res += AppAndAudio(accessibility_attributes.spoken_subtitles[i], i);
    }
  }
  if (accessibility_attributes.magnification_ui) {
    count += accessibility_attributes.magnification_ui.length;
    res += `<tr><td rowspan=${accessibility_attributes.magnification_ui.length}><img style="${accessibility_colour_result.filter}" src="${MAGNIFICATION_ICON}" height="20" alt="Magnification"/></td>`;
    for (i = 0; i < accessibility_attributes.magnification_ui.length; i++) {
      res += AppAndPurpose(accessibility_attributes.magnification_ui[i], i);
    }
  }
  if (accessibility_attributes.high_contrast_ui) {
    count += accessibility_attributes.high_contrast_ui.length;
    res += `<tr><td rowspan=${accessibility_attributes.high_contrast_ui.length}><img style="${accessibility_colour_result.filter}" src="${HIGH_CONTRAST_ICON}" height="20" alt="High Contrast"/></td>`;
    for (i = 0; i < accessibility_attributes.high_contrast_ui.length; i++) {
      res += AppAndPurpose(accessibility_attributes.high_contrast_ui[i], i);
    }
  }
  if (accessibility_attributes.screen_reader_ui) {
    count += accessibility_attributes.screen_reader_ui.length;
    res += `<tr><td rowspan=${accessibility_attributes.screen_reader_ui.length}><img style="${accessibility_colour_result.filter}" src="${SCREEN_READER_ICON}" height="20" alt="Screen Reader"/></td>`;
    for (i = 0; i < accessibility_attributes.screen_reader_ui.length; i++) {
      res += AppAndPurpose(accessibility_attributes.screen_reader_ui[i], i);
    }
  }
  if (accessibility_attributes.response_to_user_action_ui) {
    count += accessibility_attributes.response_to_user_action_ui.length;
    res += `<tr><td rowspan=${accessibility_attributes.response_to_user_action_ui.length}><img style="${accessibility_colour_result.filter}" src="${USER_ACTION_ICON}" height="20" alt="User Action"/></td>`;
    for (i = 0; i < accessibility_attributes.response_to_user_action_ui.length; i++) {
      res += AppAndPurpose(accessibility_attributes.response_to_user_action_ui[i], i);
    }
  }
  res += "</table>";
  return count ? res : "none";
}

const CMCDdata = {
  allEventTypes: ["abs", "abe", "ae", "as", "b", "bc", "c", "ce", "e", "h", "m", "pc", "pe", "pr", "ps", "rr", "sk", "t", "um"],

  eventMode: "urn:dvb:metadata:cmcd:delivery:event",
  requestMode: "urn:dvb:metadata:cmcd:delivery:request",

  customHeaders: "urn:dvb:metadata:cmcd:delivery:customHTTPHeader",
  queryArguments: "urn:dvb:metadata:cmcd:delivery:queryArguments",
  body: ""
}


function makeRequestTypes(objectTypes) {
  // convert requested object types to CMCD initialisation for dash.js
  // dash.js reports on the following request types:  ["segment", "mpd", "xlink", "steering", "other"]
  var res = [];
  objectTypes.split(" ").forEach((ot) => {
    switch (ot) {
      case 'm':           // CTA-5004-B, m = text file such as manifest or playlist
        res.push('mpd');
        break;
      case 'a':           // CTA-5004-B, a = audio only
      case 'v':           // CTA-5004-B, v = video only
      case 'av':          // CTA-5004-B, av = muxed audio and video
      case 'i':           // CTA-5004-B, i = init segment
      case 'c':           // CTA-5004-B, c = caption or subtitle
      case 'tt':          // CTA-5004-B, tt = ISOBMFF timed text track
        res.push('segment');
        break;
      case 'k':           // CTA-5004-B, k = cryptographic key, license or certifice
      case 'o':           // CTA-5004-B, o = other
        res.push('other');
        break;
    }
  })
  return res.length ? res : null;
}

function parseCMCDInitInfo(CMCDelem) {
  // parse CMCDInitialisationType according to dash.js (https://dashif.org/dash.js/pages/usage/cmcd.html)
  //
  if (!CMCDelem.hasAttribute("CMCDversion"))
    return null;

  var Reports = CMCDelem.getElementsByTagNameNS(DVBi_ns, "Report");
  if (Reports.length == 0)
    return null;

  var CMCDinfo = {
    applyParametersFromMpd: false,
    enabled: false,
    includeInRequests: null,
    version: parseInt(CMCDelem.getAttribute("CMCDversion")),
  };
  if (CMCDelem.hasAttribute("contentId")) {
    CMCDinfo.cid = CMCDelem.getAttribute("contentId");
  }
  if (CMCDinfo.version >= 2) {
    CMCDinfo.eventTargets=[];
  }

  for (var r = 0; r < Reports.length; r++) {
    if (Reports[r].getAttribute("reportingMode") == CMCDdata.requestMode) {
      CMCDinfo.enabled = true;
      switch (Reports[r].getAttribute("reportingMethod")) {
        case CMCDdata.customHeaders:
          CMCDinfo.mode = "headers";
          break;
        case CMCDdata.queryArguments:
          CMCDinfo.mode = "query";
          break;
        default:
          CMCDinfo.enabled = false;
          break;
      }
      if (Reports[r].hasAttribute("enabledKeys"))
        CMCDinfo.enabledKeys = Reports[r].getAttribute("enabledKeys").split(" ");
      CMCDinfo.includeInRequests = Reports[r].hasAttribute("objectTypes") ? makeRequestTypes(Reports[r].getAttribute("objectTypes")) : null;
    }
    else if (Reports[r].getAttribute("reportingMode") == CMCDdata.eventMode && CMCDinfo.version >= 2) {
      var newEvent = {
        enabled: true,
        url: Reports[r].getAttribute("eventURL"),
        events: Reports[r].hasAttribute("eventTypes") ? Reports[r].getAttribute("eventTypes").split(" ") : CMCDdata.allEventTypes,
        interval: 30,
        enabledKeys: Reports[r].getAttribute("enabledKeys").split(" "),
        includeInRequests: Reports[r].hasAttribute("objectTypes") ? makeRequestTypes(Reports[r].getAttribute("objectTypes")) : null,
        batchSize: 1,
      };
      CMCDinfo.eventTargets.push(newEvent);
    }
  }
  return CMCDinfo;
}

function parseServiceList(data, dvbChannels, supportedDrmSystems) {
  var i, j, k, l;
  var serviceList = {};
  var list = [];
  serviceList.services = list;
  var parser = new DOMParser();
  var doc = parser.parseFromString(data, XML_MIME);
  // var ns = doc.documentElement.namespaceURI;
  var services = getChildElements(doc.documentElement, "Service");

  var contentGuides = [];
  var channelmap = [];
  if (dvbChannels) {
    for (i = 0; i < dvbChannels.length; i++) {
      var dvbChannel = dvbChannels.item(i);
      var triplet = dvbChannel.onid + "." + dvbChannel.tsid + "." + dvbChannel.sid;
      channelmap[triplet] = dvbChannel;
    }
  }
  var defaultContentGuide = parseContentGuideSource(null);
  var contentGuideSource = getChildElements(doc.documentElement, "ContentGuideSource");
  if (contentGuideSource.length > 0) {
    defaultContentGuide = parseContentGuideSource(contentGuideSource[0]);
  }

  var contentGuideSources = getChildElements(doc.documentElement, "ContentGuideSourceList");
  if (contentGuideSources.length > 0) {
    var guides = getChildElements(contentGuideSources[0], "ContentGuideSource");
    for (var cs = 0; cs < guides.length; cs++) {
      contentGuides.push(parseContentGuideSource(guides[cs]));
    }
  }
  var relatedMaterial1 = getChildElements(doc.documentElement, "RelatedMaterial");
  for (j = 0; j < relatedMaterial1.length; j++) {
    try {
      var howRelated1 = relatedMaterial1[j].getElementsByTagNameNS(TVA_ns, "HowRelated")[0].getAttribute("href");
      if (howRelated1 == DVBi_Service_List_Logo) {
        serviceList.image = getMedia(relatedMaterial1[j]);
      }
    } catch (e) {
      console.log(e);
    }
  }
  var regionList = getChildElements(doc.documentElement, "RegionList");
  if (regionList.length > 0) {
    serviceList.regions = [];
    var regions = getChildElements(regionList[0], "Region");
    for (i = 0; i < regions.length; i++) {
      var regionElement = regions[i];
      var counrtyRegion = parseRegion(regionElement);
      serviceList.regions.push(counrtyRegion);
      var primaryRegions = getChildElements(regionElement, "Region");
      for (j = 0; j < primaryRegions.length; j++) {
        var regionElement2 = primaryRegions[j];
        serviceList.regions.push(parseRegion(regionElement2, counrtyRegion.countryCodes));
        var secondaryRegions = getChildElements(regionElement2, "Region");
        for (k = 0; k < secondaryRegions.length; k++) {
          var regionElement3 = secondaryRegions[k];
          serviceList.regions.push(parseRegion(regionElement3, counrtyRegion.countryCodes));
          var tertiaryRegions = getChildElements(regionElement3, "Region");
          for (l = 0; l < tertiaryRegions.length; l++) {
            var regionElement4 = tertiaryRegions[l];
            serviceList.regions.push(parseRegion(regionElement4, counrtyRegion.countryCodes));
          }
        }
      }
    }
  }

  var maxLcn = 0;
  var lcnTables = doc.getElementsByTagNameNS(DVBi_ns, "LCNTable");
  var lcnList = doc.getElementsByTagNameNS(DVBi_ns, "LCN");
  serviceList.lcnTables = [];
  for (i = 0; i < lcnTables.length; i++) {
    var lcnTable = {};
    lcnTable.lcn = [];
    var targetRegions = lcnTables[i].getElementsByTagNameNS(DVBi_ns, "TargetRegion");
    if (targetRegions.length > 0) {
      lcnTable.targetRegions = [];
      for (j = 0; j < targetRegions.length; j++) {
        lcnTable.targetRegions.push(targetRegions[j].childNodes[0].nodeValue);
      }
      lcnTable.defaultRegion = false;
    } else {
      lcnTable.defaultRegion = true;
      lcnList = lcnTables[i].getElementsByTagNameNS(DVBi_ns, "LCN");
    }
    var lcnList2 = lcnTables[i].getElementsByTagNameNS(DVBi_ns, "LCN");
    for (j = 0; j < lcnList2.length; j++) {
      var lcn = {};
      lcn.serviceRef = lcnList2[j].getAttribute("serviceRef");
      lcn.channelNumber = parseInt(lcnList2[j].getAttribute("channelNumber"));
      lcnTable.lcn.push(lcn);
    }
    serviceList.lcnTables.push(lcnTable);
  }
  for (i = 0; i < services.length; i++) {
    var chan = {};

    var myContentGuideSource = services[i].getElementsByTagNameNS(DVBi_ns, "ContentGuideSource");
    if (myContentGuideSource.length > 0) {
      chan.contentGuideURI = myContentGuideSource[0]
        .getElementsByTagNameNS(DVBi_ns, "ScheduleInfoEndpoint")[0]
        .getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
      var moreEpisodes = myContentGuideSource[0].getElementsByTagNameNS(DVBi_ns, "MoreEpisodesEndpoint");
      if (moreEpisodes.length > 0) {
        chan.moreEpisodesURI = moreEpisodes[0].getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
      }
      var programInfo = myContentGuideSource[0].getElementsByTagNameNS(DVBi_ns, "ProgramInfoEndpoint");
      if (programInfo.length > 0) {
        chan.programInfoURI = programInfo[0].getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;
      }
    } else {
      chan.contentGuideURI = defaultContentGuide.contentGuideURI;
      chan.moreEpisodesURI = defaultContentGuide.moreEpisodesURI;
      chan.programInfoURI = defaultContentGuide.programInfoURI;
    }

    var myContentGuideSourceRef = services[i].getElementsByTagNameNS(DVBi_ns, "ContentGuideSourceRef");
    if (myContentGuideSourceRef.length > 0) {
      var idx = -1;
      for (var cs2 = 0; cs2 < contentGuides.length; cs2++) {
        if (contentGuides[cs2].id == myContentGuideSourceRef[0].childNodes[0].nodeValue) {
          idx = cs2;
          break;
        }
      }
      if (idx != -1) {
        chan.contentGuideURI = contentGuides[idx].contentGuideURI;
        chan.moreEpisodesURI = contentGuides[idx].moreEpisodesURI;
        chan.programInfoURI = contentGuides[idx].programInfoURI;
      }
    }
    chan.code = i;
    var serviceNames = services[i].getElementsByTagNameNS(DVBi_ns, "ServiceName");
    chan.titles = [];
    for (j = 0; j < serviceNames.length; j++) {
      chan.titles.push(getText(serviceNames[j]));
    }
    chan.title = serviceNames[0].childNodes[0].nodeValue;
    chan.id = services[i].getElementsByTagNameNS(DVBi_ns, "UniqueIdentifier")[0].childNodes[0].nodeValue;
    var providers = services[i].getElementsByTagNameNS(DVBi_ns, "ProviderName");
    if (providers.length > 0) {
      chan.provider = providers[0].childNodes[0].nodeValue;
      chan.providers = [];
      for (j = 0; j < providers.length; j++) {
        chan.providers.push(getText(providers[j]));
      }
    }
    var targetRegions2 = services[i].getElementsByTagNameNS(DVBi_ns, "TargetRegion");
    if (targetRegions2.length > 0) {
      chan.targetRegions = [];
      for (j = 0; j < targetRegions2.length; j++) {
        chan.targetRegions.push(targetRegions2[j].childNodes[0].nodeValue);
      }
    }
    chan.parallelApps = [];
    chan.mediaPresentationApps = [];
    var cgRefs = services[i].getElementsByTagNameNS(DVBi_ns, "ContentGuideServiceRef");
    if (cgRefs && cgRefs.length > 0) {
      chan.contentGuideServiceRef = cgRefs[0].childNodes[0].nodeValue;
    }
    var relatedMaterial = getChildElements(services[i], "RelatedMaterial");
    for (j = 0; j < relatedMaterial.length; j++) {
      try {
        var howRelated = relatedMaterial[j].getElementsByTagNameNS(TVA_ns, "HowRelated")[0].getAttribute("href");
        if (howRelated == DVBi_Service_Logo) {
          chan.image = getMedia(relatedMaterial[j]);
        }
        else if (howRelated == DVBi_Out_Of_Service_Logo) {
          chan.out_of_service_image = getMedia(relatedMaterial[j]);
        }
        else if (howRelated == DVBi_App_In_Parallel) {
          var app = {};
          var mediaUri = relatedMaterial[j]
            .getElementsByTagNameNS(TVA_ns, "MediaLocator")[0]
            .getElementsByTagNameNS(TVA_ns, "MediaUri")[0];
          if (mediaUri && mediaUri.childNodes.length > 0) {
            app.url = mediaUri.childNodes[0].nodeValue;
            app.contentType = mediaUri.getAttribute("contentType");
            chan.parallelApps.push(app);
          }
        }
        else if (howRelated == DVBi_App_Controlling_Media) {
          var app2 = {};
          var mediaUri2 = relatedMaterial[j]
            .getElementsByTagNameNS(TVA_ns, "MediaLocator")[0]
            .getElementsByTagNameNS(TVA_ns, "MediaUri")[0];
          if (mediaUri2 && mediaUri2.childNodes.length > 0) {
            app2.url = mediaUri2.childNodes[0].nodeValue;
            app2.contentType = mediaUri2.getAttribute("contentType");
            chan.mediaPresentationApps.push(app2);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    var prominenceList = services[i].getElementsByTagNameNS(DVBi_ns, "ProminenceList");
    if (prominenceList && prominenceList.length > 0) {
      var prominences = getChildElements(prominenceList[0], "Prominence");
      chan.prominences = [];
      for (j = 0; j < prominences.length; j++) {
        var prominence = {};
        prominence.country = prominences[j].getAttribute("country");
        prominence.region = prominences[j].getAttribute("region");
        try {
          var ranking = parseInt(prominences[j].getAttribute("ranking"));
          if (!isNaN(ranking)) {
            prominence.ranking = ranking;
          }
          chan.prominences.push(prominence);
        } catch {}
      }
    }

    chan.accessibility_attributes = {};
    var serviceInstances = services[i].getElementsByTagNameNS(DVBi_ns, "ServiceInstance");
    var instances = [];
    var sourceTypes = [];
    for (j = 0; j < serviceInstances.length; j++) {
      var priority = serviceInstances[j].getAttribute("priority");
      var instance = {};
      var displayNames = serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DisplayName");
      instance.titles = [];
      for (k = 0; k < displayNames.length; k++) {
        instance.titles.push(getText(displayNames[k]));
      }
      instance.priority = priority;
      instance.contentProtection = [];
      instance.parallelApps = [];
      instance.mediaPresentationApps = [];
      var contentProtectionElements = getChildElements(serviceInstances[j], "ContentProtection");
      for (k = 0; k < contentProtectionElements.length; k++) {
        for (l = 0; l < contentProtectionElements[k].childNodes.length; l++) {
          if (contentProtectionElements[k].childNodes[l].nodeName == "DRMSystemId") {
            var drmSystem = contentProtectionElements[k].childNodes[l];
            var drm = {};
            drm.encryptionScheme = drmSystem.getAttribute("encryptionScheme");
            drm.drmSystemId = drmSystem.nodeValue;
            drm.cpsIndex = drmSystem.getAttribute("cpsIndex");
            instance.contentProtection.push(drm);
          }
        }
      }
      if (supportedDrmSystems && instance.contentProtection.length > 0) {
        var supported = false;
        for (k = 0; k < instance.contentProtection.length; k++) {
          for (l = 0; l < supportedDrmSystems.length; l++) {
            if (
              instance.contentProtection[k].drmSystemId &&
              instance.contentProtection[k].drmSystemId.toLowerCase() == supportedDrmSystems[l].toLowerCase()
            ) {
              supported = true;
              break;
            }
          }
          if (supported) {
            break;
          }
        }
        if (!supported) {
          continue;
        }
      }
      var content_attributes = getChildElements(serviceInstances[j], "ContentAttributes");
      if (content_attributes.length > 0) {
        // only 1 <ContentAttributes> element is permitted
        var accessibility_attributes = getChildElements(content_attributes[0], "AccessibilityAttributes");
        if (accessibility_attributes.length > 0) {
          // only 1 <AccessibilityAttributes> element is permitted
          chan.accessibility_attributes = ParseTVAAccessibilityAttributes(accessibility_attributes[0]);
        }
      }
      var availability = getChildElements(serviceInstances[j], "Availability");
      instance.availability = null;
      if (availability.length > 0) {
        instance.availability = [];
        //Only 1 availability-element allowed
        var periods = getChildElements(availability[0], "Period");
        for (k = 0; k < periods.length; k++) {
          var period = {};
          period.validFrom = periods[k].getAttribute("validFrom");
          period.validTo = periods[k].getAttribute("validTo");
          period.intervals = [];
          var intervals = getChildElements(periods[k], "Interval");
          for (l = 0; l < intervals.length; l++) {
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
      var relatedMaterial3 = getChildElements(serviceInstances[j], "RelatedMaterial");
      for (k = 0; k < relatedMaterial3.length; k++) {
        try {
          var howRelated3 = relatedMaterial3[k].getElementsByTagNameNS(TVA_ns, "HowRelated")[0].getAttribute("href");
          var app3, mediaUri3;
          if (howRelated3 == DVBi_App_In_Parallel) {
            app3 = {};
            mediaUri3 = relatedMaterial3[k]
              .getElementsByTagNameNS(TVA_ns, "MediaLocator")[0]
              .getElementsByTagNameNS(TVA_ns, "MediaUri")[0];
            if (mediaUri3 && mediaUri3.childNodes.length > 0) {
              app3.url = mediaUri3.childNodes[0].nodeValue;
              app3.contentType = mediaUri3.getAttribute("contentType");
              instance.parallelApps.push(app3);
            }
          } else if (howRelated3 == DVBi_App_Controlling_Media) {
            app3 = {};
            mediaUri3 = relatedMaterial3[k]
              .getElementsByTagNameNS(TVA_ns, "MediaLocator")[0]
              .getElementsByTagNameNS(TVA_ns, "MediaUri")[0];
            if (mediaUri3 && mediaUri3.childNodes.length > 0) {
              app3.url = mediaUri3.childNodes[0].nodeValue;
              app3.contentType = mediaUri3.getAttribute("contentType");
              instance.mediaPresentationApps.push(app3);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DASHDeliveryParameters").length > 0) {
        var DASHparams = serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DASHDeliveryParameters")[0];
        try {
          instance.dashUrl = serviceInstances[j].getElementsByTagNameNS(DVBi_TYPES_ns, "URI")[0].childNodes[0].nodeValue;

          var CMCDinits = serviceInstances[j].getElementsByTagNameNS(DVBi_ns,  "CMCD");
          for (var c = 0; c < CMCDinits.length; c++) {
            if (CMCDinits[c].hasAttribute("CMCDversion")) {
              switch (parseInt(CMCDinits[c].getAttribute("CMCDversion"))) {
                case 1:
                  if (!instance.CMCDinitV1)
                    instance.CMCDinitV1 = parseCMCDInitInfo(CMCDinits[c]);
                  break;
                case 2:
                  if (!instance.CMCDinitV2)
                    instance.CMCDinitV2 = parseCMCDInitInfo(CMCDinits[c]);
                  break;
              }
            }
          }
          sourceTypes.push("DVB-DASH");
          instances.push(instance);
        } catch (e) { }
      } else if (dvbChannels) {
        var triplets = serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DVBTriplet");
        if (triplets.length > 0) {
          var triplet2 =
            triplets[0].getAttribute("origNetId") +
            "." +
            triplets[0].getAttribute("tsId") +
            "." +
            triplets[0].getAttribute("serviceId");
          var dvbChannel2 = channelmap[triplet2];
          if (dvbChannel2) {
            if (serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DVBTDeliveryParameters").length > 0) {
              sourceTypes.push("DVB-T");
              instance.dvbChannel = dvbChannel2;
              instances.push(instance);
            } else if (serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DVBSDeliveryParameters").length > 0) {
              sourceTypes.push("DVB-S");
              instance.dvbChannel = dvbChannel2;
              instances.push(instance);
            } else if (serviceInstances[j].getElementsByTagNameNS(DVBi_ns, "DVBCDeliveryParameters").length > 0) {
              sourceTypes.push("DVB-C");
              instance.dvbChannel = dvbChannel2;
              instances.push(instance);
            }
          }
        }
      }
      if (instance.mediaPresentationApps.length > 0 && instances.indexOf(instance) == -1) {
        instances.push(instance);
      }
    }
    var inLCNtable = false;
    for (j = 0; j < lcnList.length; j++) {
      if (lcnList[j].getAttribute("serviceRef") == chan.id) {
        inLCNtable = true;
        chan.lcn = parseInt(lcnList[j].getAttribute("channelNumber"));
        if (chan.lcn > maxLcn) {
          maxLcn = chan.lcn;
        }
        break;
      }
    }
    chan.epg = [];
    chan.serviceInstances = instances;
    chan.sourceTypes = sourceTypes.join("/");
    if (inLCNtable || (!inLCNtable && INCLUDE_NON_LCN_CHANNELS)) list.push(chan);
  }
  for (i = 0; i < list.length; i++) {
    if (!list[i].lcn) {
      list[i].lcn = ++maxLcn;
    }
  }
  return serviceList;
}

/**
 * Return the xml:lang value for the element, recursing upward if not specified
 * @param {DOM Element} element node in which to look for an xml:lang attribute, and if not, recurse upward
 * @returns the xml:lang value of the element, or of the first ancestor element where it is defined, or 'default' if never speified (should not happen in TV Anytime)
 */
function elementLanguage(element) {
  if (element == null) return "default";
  var lang = element.getAttributeNS("http://www.w3.org/XML/1998/namespace", "lang");
  if (lang) return lang;
  else return elementLanguage(element.parentElement);
}

function getText(element) {
  var text = {};
  /*  PH: should look for a parent, grandparent etc language (thats how TV-Anytime defines it). Top <TVAMain> elment always has xml:lang
  var lang = element.getAttributeNS("http://www.w3.org/XML/1998/namespace","lang");
  if(!lang) {
    lang = "default";
  }
  text.lang = lang;
  */
  text.lang = elementLanguage(element);
  text.text = element.childNodes[0].nodeValue;
  return text;
}

function parseRegion(regionElement, countryCodes) {
  var region = {},
    j;
  if (!countryCodes) {
    region.countryCodes = regionElement.getAttribute("countryCodes");
  } else {
    region.countryCodes = countryCodes;
  }
  region.selectable = true;
  if (regionElement.getAttribute("selectable") == "false") {
    region.selectable = false;
  }
  region.regionID = regionElement.getAttribute("regionID");
  var names = getChildElements(regionElement, "RegionName");
  if (names.length == 1) {
    region.regionName = names[0].childNodes[0].nodeValue;
  } else if (names.length > 1) {
    region.regionNames = [];
    for (j = 0; j < names.length; j++) {
      region.regionNames.push(getText(names[j]));
    }
  }
  var wildcardPostcodes = getChildElements(regionElement, "WildcardPostcode");
  if (wildcardPostcodes.length > 0) {
    region.wildcardPostcodes = [];
    for (j = 0; j < wildcardPostcodes.length; j++) {
      region.wildcardPostcodes.push(wildcardPostcodes[j].childNodes[0].nodeValue);
    }
  }
  var postcodes = getChildElements(regionElement, "Postcode");
  if (postcodes.length > 0) {
    region.postcodes = [];
    for (j = 0; j < postcodes.length; j++) {
      region.postcodes.push(postcodes[j].childNodes[0].nodeValue);
    }
  }
  var postcodeRanges = getChildElements(regionElement, "PostcodeRange");
  if (postcodeRanges.length > 0) {
    region.postcodeRanges = [];
    for (j = 0; j < postcodeRanges.length; j++) {
      var range = {};
      range.from = postcodeRanges[j].getAttribute("from");
      range.to = postcodeRanges[j].getAttribute("to");
      region.postcodeRanges.push(range);
    }
  }
  var coordinates = getChildElements(regionElement, "Coordinates");
  if (coordinates.length > 0) {
    region.coordinates = [];
    for (j = 0; j < coordinates.length; j++) {
      var coordinate = {};
      coordinate.latitude = getChildElements(coordinates[j], "Latitude")[0].childNodes[0].nodeValue;
      coordinate.longitude = getChildElements(coordinates[j], "Longitude")[0].childNodes[0].nodeValue;
      coordinate.radius = getChildElements(coordinates[j], "Radius")[0].childNodes[0].nodeValue;
      region.coordinates.push(coordinate);
    }
  }
  return region;
}

function findRegionFromPostCode(serviceList, postCode) {
  for (var i = 0; i < serviceList.regions.length; i++) {
    var region = serviceList.regions[i],
      j;
    if (region.postcodes) {
      for (j = 0; j < region.postcodes.length; j++) {
        if (region.postcodes[j] == postCode) {
          return region;
        }
      }
    }
    if (region.postcodeRanges) {
      for (j = 0; j < region.postcodeRanges.length; j++) {
        if (matchPostcodeRange(region.postcodeRanges[j], postCode)) {
          return region;
        }
      }
    }
    if (region.wildcardPostcodes) {
      for (j = 0; j < region.wildcardPostcodes.length; j++) {
        if (matchPostcodeWildcard(region.wildcardPostcodes[j], postCode)) {
          return region;
        }
      }
    }
  }
  return null;
}

function matchPostcodeRange(range, postCode) {
  if (range.from > postCode || range.to < postCode) {
    return false;
  }
  return true;
}

function matchPostcodeWildcard(wildcard, postCode) {
  var wildcardIndex = wildcard.indexOf("*");
  if (wildcardIndex == wildcard.length - 1) {
    //Wildcard is in the end, check that the postcode
    //starts with the wildcard
    var wildcardMatch = wildcard.substring(0, wildcard.length - 1);
    if (postCode.indexOf(wildcardMatch) == 0) {
      return true;
    }
  } else if (wildcardIndex == 0) {
    var wildcardMatch2 = wildcard.substring(1, wildcard.length);
    if (postCode.indexOf(wildcardMatch2, postCode.length - wildcardMatch2.length) !== -1) {
      return true;
    }
  } else if (wildcardIndex != -1) {
    var startMatch = wildcard.substring(0, wildcardIndex);
    var endMatch = wildcard.substring(wildcardIndex + 1, wildcard.length);
    if (postCode.indexOf(startMatch) == 0 && postCode.indexOf(endMatch, postCode.length - endMatch.length) !== -1) {
      return true;
    }
  }
  return false;
}

function selectServiceListRegion(serviceList, regionId) {
  var lcnTable = null,
    i,
    j;
  var defaultName = "!" + i18n.getString("default_region") + "!";
  var defaultTable = null;
  for (i = 0; i < serviceList.lcnTables.length; i++) {
    var table = serviceList.lcnTables[i];
    if (table.defaultRegion == true) {
      if (regionId == defaultName) {
        lcnTable = table;
        break;
      }
      defaultTable = table;
    }
    if (table.hasOwnProperty("targetRegions")) {
      for (j = 0; j < table.targetRegions.length; j++) {
        if (table.targetRegions[j] == regionId) {
          lcnTable = table;
          break;
        }
      }
    }
    if (lcnTable != null) {
      break;
    }
  }
  if (lcnTable == null) {
    if (defaultTable == null) {
      throw "No LCN table found";
    }
    lcnTable = defaultTable;
  }
  var validServices = [];
  var unallocatedLCN = First_undeclared_channel;

  for (i = 0; i < serviceList.services.length; i++) {
    var service = serviceList.services[i];
    var valid = false;
    if (service.targetRegions) {
      for (j = 0; j < service.targetRegions.length; j++) {
        if (service.targetRegions[j] == regionId) {
          valid = true;
          break;
        }
      }
    } else {
      valid = true;
    }
    if (valid) {
      var inLCN = false;
      service.lcn = -1;
      for (j = 0; j < lcnTable.lcn.length; j++) {
        if (lcnTable.lcn[j].serviceRef == service.id) {
          service.lcn = lcnTable.lcn[j].channelNumber;
          inLCN = true;
          break;
        }
      }
      if (inLCN || (!inLCN && !LCN_services_only)) {
        if (service.lcn == -1) service.lcn = unallocatedLCN++;
        validServices.push(service);
      }
    }
  }
  serviceList.services = validServices;
}

function getChildElements(parent, tagName) {
  var elements = [];
  if (parent && parent.childNodes) {
    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i].nodeType == 1 && parent.childNodes[i].localName == tagName) {
        // localName property does not include the prefix
        elements.push(parent.childNodes[i]);
      }
    }
  }
  return elements;
}

function generateServiceListQuery(
  baseurl,
  providers,
  language,
  genre,
  targetCountry,
  regulatorListFlag,
  delivery,
  inlineImages
) {
  var query = baseurl;
  var parameters = [],
    i;
  if (Array.isArray(providers) && providers.length > 0) {
    for (i = 0; i < providers.length; i++) {
      if (providers[i] !== "") {
        parameters.push("ProviderName[]=" + providers[i]);
      }
    }
  } else if (providers != null && providers !== "") {
    parameters.push("ProviderName=" + providers);
  }

  if (Array.isArray(language) && language.length > 0) {
    for (i = 0; i < language.length; i++) {
      if (language[i] !== "") {
        parameters.push("Language[]=" + language[i]);
      }
    }
  } else if (language != null && language !== "") {
    parameters.push("Language=" + language);
  }

  if (Array.isArray(genre) && genre.length > 0) {
    for (i = 0; i < genre.length; i++) {
      if (genre[i] !== "") {
        parameters.push("Genre[]=" + genre[i]);
      }
    }
  } else if (genre != null && genre !== "") {
    parameters.push("Genre=" + genre);
  }

  if (Array.isArray(targetCountry) && targetCountry.length > 0) {
    for (i = 0; i < targetCountry.length; i++) {
      if (targetCountry[i] !== "") {
        parameters.push("TargetCountry[]=" + targetCountry[i]);
      }
    }
  } else if (targetCountry != null && targetCountry !== "") {
    parameters.push("TargetCountry=" + targetCountry);
  }

  if (Array.isArray(delivery)) {
    if (delivery.length > 0) {
      for (i = 0; i < delivery.length; i++) {
        if (delivery[i] !== "") {
          parameters.push("Delivery[]=" + delivery[i]);
        }
      }
    }
  } else if (delivery != null && delivery != "") {
    parameters.push("Delivery=" + delivery);
  }

  if (regulatorListFlag === true) {
    parameters.push("regulatorListFlag=true");
  }
  if (inlineImages === true) {
    parameters.push("inlineImages=true");
  }
  if (parameters.length > 0) {
    query += "?" + parameters.join("&");
  }
  return query;
}

function parseProviderInfo(providerInfo, ns) {
  var info = {};
  if (providerInfo.length > 0) {
    info["name"] = providerInfo[0].getElementsByTagNameNS(ns, "Name")[0].childNodes[0].nodeValue;
    var iconData = [];
    var icons = providerInfo[0].getElementsByTagNameNS("*", "Icon");
    for (var j = 0; j < icons.length; j++) {
      var media = getMedia(icons[j]);
      if (media) {
        iconData.push(media);
      }
    }
    info["icons"] = iconData;
  }
  return info;
}

function parseServiceListProviders(data) {
  var providerslist = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(data, XML_MIME);
  var ns = /*doc.documentElement.namespaceURI*/ "*";
  if (!ns) {
    ns = DVBi_Service_List_Discovery_Schema; //Fallback value
  }
  var servicediscoveryNS = /*doc.documentElement.getAttribute("xmlns:dvbisd")*/ "*";
  if (!servicediscoveryNS) {
    servicediscoveryNS = DVBi_Service_Discovery_Schema; //Fallback value
  }
  var registryEntity = doc.getElementsByTagNameNS(ns, "ServiceListRegistryEntity");
  var registryInfo = parseProviderInfo(registryEntity, ns);

  var providers = doc.getElementsByTagNameNS(ns, "ProviderOffering");
  for (var i = 0; i < providers.length; i++) {
    var providerInfo = providers[i].getElementsByTagNameNS(ns, "Provider");
    var info = parseProviderInfo(providerInfo, ns);
    var lists = providers[i].getElementsByTagNameNS(ns, "ServiceListOffering");
    var servicelists = [];
    info["servicelists"] = servicelists;
    for (var j = 0; j < lists.length; j++) {
      var list = {};
      list["name"] = lists[j].getElementsByTagNameNS(ns, "ServiceListName")[0].childNodes[0].nodeValue;
      list["url"] = lists[j]
        .getElementsByTagNameNS(ns, "ServiceListURI")[0]
        .getElementsByTagNameNS(servicediscoveryNS, "URI")[0].childNodes[0].nodeValue;
      var listIcons = [];
      var relatedMaterial = lists[j].getElementsByTagNameNS(ns, "RelatedMaterial");
      for (var k = 0; k < relatedMaterial.length; k++) {
        var howRelated = relatedMaterial[k].getElementsByTagNameNS(ns, "HowRelated")[0].getAttribute("href");
        if (howRelated == "urn:dvb:metadata:cs:HowRelatedCS:2020:1001.1") {
          var mediaLocators = relatedMaterial[k].getElementsByTagNameNS(ns, "MediaLocator");
          for (var l = 0; l < mediaLocators.length; l++) {
            var media = getMedia(mediaLocators[l]);
            if (media) {
              listIcons.push(media);
            }
          }
        }
      }
      var srsSupport = lists[j].getElementsByTagNameNS(ns, "SRSSupport");
      if (srsSupport.length > 0) {
        list.postcodeFiltering = srsSupport[0].getAttribute("postcode") == "true";
        list.regionIdFiltering = srsSupport[0].getAttribute("regionID") == "true";
        list.multiplexFiltering = srsSupport[0].getAttribute("receivedMultiplex") == "true";
      }
      list["icons"] = listIcons;
      servicelists.push(list);
    }
    providerslist.push(info);
  }
  return { registryInfo: registryInfo, providerList: providerslist };
}

/**
 * extract the image payload from the provided @inline_image.
 *
 * @param {string} inline_image
 */
function parseImageData(inline_image) {
  return inline_image.substring(inline_image.indexOf(","));
}

function getMedia(element) {
  if (!element) {
    return null;
  }
  var tvaNS = "*";
  var mediaUri = element.getElementsByTagNameNS(tvaNS, "MediaUri");

  var content_digest = mediaUri[0].getAttribute("integrity");
  if (content_digest) {
    var digests = content_digest.split(" ");
    var img_url = mediaUri[0].childNodes[0].nodeValue;
    var img = img_url.startsWith("http") ? NetworkRequestS(img_url, {}) : parseImageData(img_url);
    var is_valid = false;

    var re = new RegExp("([a-z0-9]+)=:([a-zA-Z0-9]+):");
    digests.forEach(function (dig) {
      var parse = dig.match(re);
      var algorithm = parse[1], digest = parse[2];

      if (algorithm == "sha1") {
        var sha1obj = new jsSHA("SHA-1", "TEXT");
        sha1obj.update(img);
        if (sha1obj.getHash("HEX") == digest) {
          is_valid = true;
        }
      }
      else if (algorithm = "sha256") {
        var sha256obj = new jsSHA("SHA-256","TEXT");
        sha256obj.update(img);
        if (sha256obj.getHash("HEX") == digest) {
          is_valid = true;
        }
      }
    });
    return {mediaUri: is_valid ? img_url : INVALID_DIGEST_IMAGE};
  }
  else
  if (mediaUri.length > 0) {
    return { mediaUri: mediaUri[0].childNodes[0].nodeValue };
  }
  return null;
}

function getImageSrc(image, defaultImage = "./images/empty.png") {
  if (image && image.mediaUri) {
    return image.mediaUri;
  } else if (image && image.mediaData64) {
    return "data:" + image.type + ";base64," + image.mediaData64;
  } else if (defaultImage) {
    return defaultImage;
  } else {
    return null;
  }
}

getParentalRating = function (href) {
  if (href == "urn:fvc:metadata:cs:ContentRatingCS:2014-07:no_parental_controls") {
    return "None";
  } else if (href == "urn:fvc:metadata:cs:ContentRatingCS:2014-07:fifteen") {
    return "15";
  } else {
    return "Unknown";
  }
};

function isServiceInstanceAvailable(instance) {
  if (instance.availability) {
    var now = new Date();
    now.setMilliseconds(0);
    for (var i = 0; i < instance.availability.length; i++) {
      var period = instance.availability[i];
      if (period.validFrom) {
        if (new Date(period.validFrom) > now) {
          continue;
        }
      }
      if (period.validTo) {
        if (new Date(period.validTo) < now) {
          continue;
        }
      }
      if (period.intervals) {
        for (var j = 0; j < period.intervals.length; j++) {
          var interval = period.intervals[j];
          if (isIntervalNow(interval, now)) {
            return true;
          }
        }
      } else {
        return true;
      }
    }
    return false;
  }
  return true;
}

function isIntervalNow(interval, now) {
  if (interval.days) {
    var day = now.getDay();
    //JS days are 0..6 starting from sunday
    //Availability days are 1..7 starting from monday
    //So change sunday from 0 to 7
    if (day == 0) {
      day = 7;
    }
    day = day.toString();
    if (interval.days.indexOf(day) == -1) {
      return false;
    }
  }
  if (interval.startTime) {
    if (parseIntervalTime(interval.startTime) > now) {
      return false;
    }
  }
  if (interval.endTime) {
    if (parseIntervalTime(interval.endTime) <= now) {
      return false;
    }
  }
  return true;
}

function parseIntervalTime(time, day) {
  if (time.length == 9 && time.charAt(8) == "Z") {
    var date = new Date();
    var timeparts = time.substring(0, 8).split(":");
    date.setUTCHours(parseInt(timeparts[0]));
    date.setUTCMinutes(parseInt(timeparts[1]));
    date.setUTCSeconds(parseInt(timeparts[2]));
    date.setMilliseconds(0);
    return date;
  }
  return null;
}

var dvb_i_language_list = {
  en: "English",
  de: "Deutsch",
  fi: "Suomi",
  zh: "Chinese",
};

function getLocalizedText(texts, lang) {
  if (texts.length == 1) {
    return texts[0].text;
  } else if (texts.length > 1) {
    var defaultTitle = null;
    for (var i = 0; i < texts.length; i++) {
      if (texts[i].lang == lang) {
        return texts[i].text;
      } else if (texts[i].lang == "default") {
        defaultTitle = texts[i].text;
      }
    }
    if (defaultTitle != null) {
      return defaultTitle;
    } else {
      return texts[0].text;
    }
  }
  return null;
}

var creditsTypes = {
  "urn:tva:metadata:cs:TVARoleCS:2011:V20": "prod_co",
  "urn:tva:metadata:cs:TVARoleCS:2011:AD6": "presenter",
  "urn:mpeg:mpeg7:cs:RoleCS:2001:ACTOR": "actor",
};

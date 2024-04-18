function Channel() {}

Channel.prototype.getGenre = function (genre) {
  if (typeof genre === "string" && genre.substring(0, DVB_Content_Subject_CS.length) == DVB_Content_Subject_CS) {
    var genre2 = genre.substring(genre.lastIndexOf(":") + 1);
    if (genre2 == "1") {
      return i18n.getString("genre_movie");
    } else if (genre2 == "2") {
      return i18n.getString("genre_news");
    } else if (genre2 == "3") {
      return i18n.getString("genre_game");
    } else if (genre2 == "4") {
      return i18n.getString("genre_sports");
    } else if (genre2 == "5") {
      return i18n.getString("genre_childrens");
    } else if (genre2 == "6") {
      return i18n.getString("genre_music");
    } else if (genre2 == "7") {
      return i18n.getString("genre_arts");
    } else if (genre2 == "8") {
      return i18n.getString("genre_social");
    } else if (genre2 == "9") {
      return i18n.getString("genre_education");
    } else if (genre2 == "10") {
      return i18n.getString("genre_leisure");
    } else if (genre2 == "11") {
      return i18n.getString("genre_special");
    } else if (genre2 == "12") {
      return i18n.getString("genre_adult");
    }
  }
  return null;
};

Channel.prototype.parseSchedule = function (data) {
  var newPrograms = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(data, XML_MIME);
  var events = doc.getElementsByTagNameNS(TVA_ns, "ScheduleEvent");
  var programs = doc.getElementsByTagNameNS(TVA_ns, "ProgramInformation");
  for (var i = 0; i < events.length; i++) {
    var program = {};
    var programId = events[i].getElementsByTagNameNS(TVA_ns, "Program")[0].getAttribute("crid");
    program.programId = programId;
    program.start = events[i]
      .getElementsByTagNameNS(TVA_ns, "PublishedStartTime")[0]
      .childNodes[0].nodeValue.toUTCDate();
    program.end = iso6801end(
      events[i].getElementsByTagNameNS(TVA_ns, "PublishedDuration")[0].childNodes[0].nodeValue,
      program.start
    );
    var instanceDescriptions = events[i].getElementsByTagNameNS(TVA_ns, "InstanceDescription");
    if (instanceDescriptions.length > 0) {
      var otherIdentifiers = instanceDescriptions[0].getElementsByTagNameNS(TVA_ns, "OtherIdentifier");
      for (var j2 = 0; j2 < otherIdentifiers.length; j2++) {
        var type = otherIdentifiers[j2].getAttribute("type");
        if (type == "CPSIndex") {
          program.cpsIndex = otherIdentifiers[j2].childNodes[0].nodeValue;
        }
      }
    }
    program.prglen = (program.end.getTime() - program.start.getTime()) / (1000 * 60);
    for (var j1 = 0; j1 < programs.length; j1++) {
      if (programs[j1].getAttribute("programId") == programId) {
        var description = programs[j1].getElementsByTagNameNS(TVA_ns, "BasicDescription")[0];
        var titles = description.getElementsByTagNameNS(TVA_ns, "Title");
        var AVAttributes = programs[j1].getElementsByTagNameNS(TVA_ns, "AVAttributes")[0];
        program.titles = [];
        for (var j = 0; j < titles.length; j++) {
          var element = titles[j];
          var text = {};
          var lang = elementLanguage(element);
          if (!lang) {
            lang = "default";
          }
          text.lang = lang;
          text.text = element.childNodes[0].nodeValue;
          text.type = element.getAttribute("type");
          program.titles.push(text);
        }
        program.title = titles[0].childNodes[0].nodeValue;
        var synopsis = description.getElementsByTagNameNS(TVA_ns, "Synopsis");
        if (synopsis.length > 0) {
          program.descriptions = [];
          for (var j3 = 0; j3 < synopsis.length; j3++) {
            var element2 = synopsis[j3];
            var text2 = {};
            var lang2 = elementLanguage(element2);
            if (!lang2) {
              lang2 = "default";
            }
            text2.lang = lang2;
            text2.text = element2.childNodes[0].nodeValue;
            text2.textLength = element2.getAttribute("length");
            program.descriptions.push(text2);
          }
        }
        var genre = description.getElementsByTagNameNS(TVA_ns, "Genre");
        if (genre.length > 0) {
          var genreValue = this.getGenre(genre[0].getAttribute("href"));
          if (genreValue != null) {
            program.genre = genreValue;
          }
        }
        var parentalGuidance = description.getElementsByTagNameNS(TVA_ns, "ParentalGuidance");
        var parentals = [];
        for (var k = 0; k < parentalGuidance.length; k++) {
          var rating = {};
          var minimumAge = parentalGuidance[k].getElementsByTagNameNS(MPEG7_ns, "MinimumAge");
          if (minimumAge.length > 0) {
            //assume single element
            rating.minimumage = minimumAge[0].childNodes[0].nodeValue;
          }
          var parentalRating = parentalGuidance[k].getElementsByTagNameNS(MPEG7_ns, "ParentalRating");
          if (parentalRating.length > 0) {
            //assume single element
            rating.parentalRating = parentalRating[0].getAttribute("href");
          }
          var explanatoryText = parentalGuidance[k].getElementsByTagNameNS("*", "ExplanatoryText");
          if (explanatoryText.length > 0) {
            //multilingual
            rating.explanatoryText2 = [];
            for (var l = 0; l < explanatoryText.length; l++) {
              var t = {};
              t.lang = elementLanguage(explanatoryText[l]);
              t.text = explanatoryText[l].textContent;
              rating.explanatoryText2.push(t);
            }
          }
          parentals.push(rating);
        }
        program.parentalRating = parentals;
        var relatedMaterial = description.getElementsByTagNameNS(TVA_ns, "RelatedMaterial");
        for (var k1 = 0; k1 < relatedMaterial.length; k1++) {
          var howRelated = relatedMaterial[k1].getElementsByTagNameNS(TVA_ns, "HowRelated")[0].getAttribute("href");
          if (howRelated == TVA_Promotional_Still_Image) {
            //Program still image
            program.mediaimage = relatedMaterial[k1].getElementsByTagNameNS(
              TVA_ns,
              "MediaUri"
            )[0].childNodes[0].nodeValue;
            break;
          }
        }
        var creditsList = description.getElementsByTagNameNS(TVA_ns, "CreditsList");
        if (creditsList.length > 0) {
          program.creditsItems = [];
          var creditsItems = description.getElementsByTagNameNS(TVA_ns, "CreditsItem");
          for (var k2 = 0; k2 < creditsItems.length; k2++) {
            creditsItem = {};
            creditsItem.role = creditsItems[k2].getAttribute("role");
            var organizations = creditsItems[k2].getElementsByTagNameNS(TVA_ns, "OrganizationName");
            if (organizations.length > 0) {
              creditsItem.organizations = [];
              for (var l2 = 0; l2 < organizations.length; l2++) {
                creditsItem.organizations.push(organizations[l2].childNodes[0].nodeValue);
              }
            }
            var persons = creditsItems[k2].getElementsByTagNameNS(TVA_ns, "PersonName");
            if (persons.length > 0) {
              var person = {};
              var givenNames = persons[0].getElementsByTagNameNS(MPEG7_ns, "GivenName");
              if (givenNames.length > 0) {
                person.givenName = givenNames[0].childNodes[0].nodeValue;
              }
              var familyName = persons[0].getElementsByTagNameNS(MPEG7_ns, "FamilyName");
              if (familyName.length > 0) {
                person.familyName = familyName[0].childNodes[0].nodeValue;
              }
              creditsItem.person = person;
            }
            persons = creditsItems[k2].getElementsByTagNameNS(TVA_ns, "Character");
            if (persons.length > 0) {
              var person2 = {};
              var givenNames2 = persons[0].getElementsByTagNameNS(MPEG7_ns, "GivenName");
              if (givenNames2.length > 0) {
                person2.givenName = givenNames2[0].childNodes[0].nodeValue;
              }
              var familyName2 = persons[0].getElementsByTagNameNS(MPEG7_ns, "FamilyName");
              if (familyName2.length > 0) {
                person2.familyName = familyName2[0].childNodes[0].nodeValue;
              }
              creditsItem.character = person2;
            }
            program.creditsItems.push(creditsItem);
          }
        }
        var keywords = description.getElementsByTagNameNS(TVA_ns, "Keyword");
        if (keywords.length > 0) {
          program.keywords = [];
          for (var k3 = 0; k3 < keywords.length; k3++) {
            keyword = {};
            keyword.type = keywords[k3].getAttribute("role");
            keyword.value = keywords[k3].childNodes[0].nodeValue;
            program.keywords.push(keyword);
          }
        }
        if (AVAttributes) {
          var accessibility_attributes = AVAttributes.getElementsByTagNameNS(TVA_ns, "AccessibilityAttributes");
          if (accessibility_attributes)
            program.accessibility_attributes = ParseTVAAccessibilityAttributes(accessibility_attributes[0]);
        }
        break;
      }
    }
    newPrograms.push(new Program(program, null, this));
  }
  return newPrograms;
};

Channel.prototype.getServiceRef = function () {
  return this.contentGuideServiceRef ? this.contentGuideServiceRef : this.id;
};

//Returns the service instance with the highest priority
Channel.prototype.getServiceInstance = function () {
  var instance = null;
  for (var i = 0; i < this.serviceInstances.length; i++) {
    if (instance == null) {
      if (isServiceInstanceAvailable(this.serviceInstances[i])) {
        instance = this.serviceInstances[i];
      }
    } else if (
      instance.priority > this.serviceInstances[i].priority &&
      isServiceInstanceAvailable(this.serviceInstances[i])
    ) {
      instance = this.serviceInstances[i];
    }
  }
  return instance;
};

Channel.prototype.hasAvailability = function () {
  for (var i = 0; i < this.serviceInstances.length; i++) {
    if (this.serviceInstances[i].availability) {
      return true;
    }
  }
  return false;
};

Channel.prototype.getServiceInstanceByCPSIndex = function (cpsIndex) {
  if (cpsIndex) {
    for (var i = 0; i < this.serviceInstances.length; i++) {
      if (this.serviceInstances[i].contentProtection) {
        for (var j = 0; j < this.serviceInstances[i].contentProtection.length; j++) {
          var contentProtection = this.serviceInstances[i].contentProtection[j];
          if (contentProtection.cpsIndex == cpsIndex) {
            return this.serviceInstances[i];
          }
        }
      }
    }
  }
  return null;
};

Channel.prototype.getMoreEpisodes = function (programId, callback) {
  var self = this;
  if (this.moreEpisodesURI && typeof callback == "function") {
    $.get(
      this.moreEpisodesURI + "?pid=" + programId + "&type=ondemand",
      function (data) {
        var episodes = self.parseSchedule(data);
        callback.call(callback, episodes);
      },
      "text"
    );
  } else if (typeof callback == "function") {
    callback.call(null);
  }
};

Channel.prototype.getProgramInfo = function (programId, callback) {
  var self = this;
  if (this.programInfoURI && typeof callback == "function") {
    $.get(
      this.programInfoURI + "?pid=" + programId,
      function (data) {
        var episodes = self.parseSchedule(data);
        if (episodes.length > 0) {
          callback.call(callback, episodes[0]);
        } else {
          callback.call(null);
        }
      },
      "text"
    );
  } else if (typeof callback == "function") {
    callback.call(null);
  }
};

Channel.prototype.getRanking = function () {
  if (!this.prominences || this.prominences.length == 0) {
    return null;
  }
  var region = getLocalStorage("region");
  var countryList = null;
  var i = 0;
  if (region && serviceList && serviceList.regions) {
    for (i = 0; i < serviceList.regions.length; i++) {
      if (serviceList.regions[i].regionID === region) {
        countryList = serviceList.regions[i].countryCodes;
        break;
      }
    }
  }
  if (region) {
    //Region should be unque, no need to check the country
    for (i = 0; i < this.prominences.length; i++) {
      if (this.prominences[i].region === region) {
        return this.prominences[i].ranking;
      }
    }
  }
  if (countryList) {
    //no region specific prominence found, try country specific
    for (i = 0; i < this.prominences.length; i++) {
      if (
        this.prominences[i].country &&
        countryList.indexOf(this.prominences[i].country) != -1 &&
        !this.prominences[i].region
      ) {
        return this.prominences[i].ranking;
      }
    }
  }
  //general prominence, no country or region specified
  for (i = 0; i < this.prominences.length; i++) {
    if (!this.prominences[i].country && !this.prominences[i].region) {
      return this.prominences[i].ranking;
    }
  }
  return null;
};

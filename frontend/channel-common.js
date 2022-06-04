Channel.prototype.getGenre = function(genre) {
    if(typeof genre === 'string' && genre.substring(0,  "urn:dvb:metadata:cs:ContentSubject:2019:".length) == "urn:dvb:metadata:cs:ContentSubject:2019:") {
        var genre2 = genre.substring(genre.lastIndexOf(":")+1);
        if(genre2 == "1") {
            return "Movie/Drama";
        }
        else if(genre2 == "2") {
            return "News/Current affairs";
        }
        else if(genre2 == "3") {
            return "Show/Game show";
        }
        else if(genre2 == "4") {
            return "Sports";
        }
        else if(genre2 == "5") {
            return "Children's/Youth programmes";
        }
        else if(genre2 == "6") {
            return "Music/Ballet/Dance";
        }
        else if(genre2 == "7") {
            return "Arts/Culture";
        }
        else if(genre2 == "8") {
            return "Social/Political issues/Economics";
        }
        else if(genre2 == "9") {
            return "Education/Science/Factual topics";
        }
        else if(genre2 == "10") {
            return "Leisure hobbies";
        }
        else if(genre2 == "11") {
            return "Special characteristics";
        }
        else if(genre2 == "12") {
            return "Adult";
        }
    }
    return null; 
};

Channel.prototype.parseSchedule = function(data) {
    var newPrograms = [];     
    var parser = new DOMParser();
    var doc = parser.parseFromString(data,"text/xml");
    var events = doc.getElementsByTagName("ScheduleEvent");
    var programs = doc.getElementsByTagName("ProgramInformation");
    for(var i=0;i<events.length;i++) {      
        var program = {};
        var programId = events[i].getElementsByTagName("Program")[0].getAttribute("crid");
        program.programId = programId;
        program.start = events[i].getElementsByTagName("PublishedStartTime")[0].childNodes[0].nodeValue.toUTCDate();
        program.end  = iso6801end(events[i].getElementsByTagName("PublishedDuration")[0].childNodes[0].nodeValue, program.start);
        var instanceDescriptions = events[i].getElementsByTagName("InstanceDescription");
        if(instanceDescriptions.length > 0) {
          var otherIdentifiers = instanceDescriptions[0].getElementsByTagName("OtherIdentifier");
          for(var j2 = 0;j2 < otherIdentifiers.length;j2++) {
              var type = otherIdentifiers[j2].getAttribute("type");
              if(type == "CPSIndex") {
                  program.cpsIndex = otherIdentifiers[j2].childNodes[0].nodeValue;
              }
          }
        }
        program.prglen = (program.end.getTime() - program.start.getTime())/(1000*60);
        for(var j1=0;j1<programs.length;j1++) {
            if(programs[j1].getAttribute("programId") == programId) {
                var description = programs[j1].getElementsByTagName("BasicDescription")[0];
                var titles = description.getElementsByTagName("Title");
                program.titles = [];
                for(var j = 0;j < titles.length;j++) {
                  var element = titles[j];
                  var text = {};
                  var lang = elementLanguage(element);
                  if(!lang) {
                    lang = "default";
                  }
                  text.lang = lang;
                  text.text =  element.childNodes[0].nodeValue;
                  text.type =  element.getAttribute("type");
                  program.titles.push(text);
                }
                program.title = titles[0].childNodes[0].nodeValue;
                var synopsis = description.getElementsByTagName("Synopsis");
                if(synopsis.length > 0) {
                   program.descriptions = [];
                   for(var j3 = 0;j3 < synopsis.length;j3++) {
                    var element2 = synopsis[j3];
                    var text2 = {};
                    var lang2 = elementLanguage(element2);
                    if(!lang2) {
                      lang2 = "default";
                    }
                    text2.lang = lang2;
                    text2.text =  element2.childNodes[0].nodeValue;
                    explanatoryText2.textLength =  element2.getAttribute("length");
                    program.descriptions.push(text2);
                  }
                }
                var genre = description.getElementsByTagName("Genre");
                if(genre.length > 0) {
                    var genreValue = this.getGenre(genre[0].getAttribute("href"));
                    if(genreValue != null) {
                        program.genre = genreValue;
                    }
                }
                var parentalGuidance =  description.getElementsByTagName("ParentalGuidance");
                var parentals = [];
                for(var k=0;k<parentalGuidance.length;k++) {
                    var rating = {};
                    var minimumAge = parentalGuidance[k].getElementsByTagNameNS("urn:tva:mpeg7:2008","MinimumAge");
                    if(minimumAge.length > 0) { //assume single element
                        rating.minimumage = minimumAge[0].childNodes[0].nodeValue;
                    }
                    var parentalRating = parentalGuidance[k].getElementsByTagNameNS("urn:tva:mpeg7:2008","ParentalRating");
                    if(parentalRating.length > 0) { //assume single element
                        rating.parentalRating = parentalRating[0].getAttribute("href");
                    }
                    var explanatoryText = parentalGuidance[k].getElementsByTagName("ExplanatoryText");
                    if(explanatoryText.length > 0) { //multilingual
                      rating.explanatoryText2=[];
                      for (var l=0; l<explanatoryText.length; l++) {
                          var t={};
                          t.lang = elementLanguage(explanatoryText[l]);
                          t.text = explanatoryText[l].textContent;
                          rating.explanatoryText2.push(t);
                      }
                    }
                    parentals.push(rating);
                }
                program.parentalRating = parentals;
                var relatedMaterial =  description.getElementsByTagName("RelatedMaterial");
                for(var k1=0;k1<relatedMaterial.length;k1++) {
                    var howRelated = relatedMaterial[k1].getElementsByTagName("HowRelated")[0].getAttribute("href");
                    if(howRelated == "urn:tva:metadata:cs:HowRelatedCS:2012:19") { //Program still image
                        program.mediaimage = relatedMaterial[k1].getElementsByTagName("MediaUri")[0].childNodes[0].nodeValue;
                        break;
                    }
                }
                var creditsList = description.getElementsByTagName("CreditsList");
                if(creditsList.length > 0) {
                  program.creditsItems = [];
                  var creditsItems = description.getElementsByTagName("CreditsItem");
                  for(var k2 = 0;k2 < creditsItems.length; k2++) {
                    creditsItem = {};
                    creditsItem.role = creditsItems[k2].getAttribute("role");
                    var organizations = creditsItems[k2].getElementsByTagName("OrganizationName");
                    if(organizations.length > 0) {
                      creditsItem.organizations = [];
                      for(var l2 = 0;l2 < organizations.length; l2++) {
                        creditsItem.organizations.push(organizations[l2].childNodes[0].nodeValue);
                      }
                    }
                    var persons = creditsItems[k].getElementsByTagName("PersonName");
                    if(persons.length > 0) {
                      var person = {};
                      var givenNames = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","GivenName");
                      if(givenNames.length > 0 ) {
                        person.givenName = givenNames[0].childNodes[0].nodeValue;
                      }
                      var familyName = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","FamilyName");
                      if(familyName.length > 0 ) {
                        person.familyName = familyName[0].childNodes[0].nodeValue;
                      }
                      creditsItem.person = person;
                    }
                    persons = creditsItems[k].getElementsByTagName("Character");
                    if(persons.length > 0) {
                      var person2 = {};
                      var givenNames2 = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","GivenName");
                      if(givenNames2.length > 0 ) {
                        person2.givenName = givenNames2[0].childNodes[0].nodeValue;
                      }
                      var familyName2 = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","FamilyName");
                      if(familyName2.length > 0 ) {
                        person2.familyName = familyName2[0].childNodes[0].nodeValue;
                      }
                      creditsItem.character = person2;
                    }
                    program.creditsItems.push(creditsItem);
                  }
                }
                var keywords = description.getElementsByTagName("Keyword");
                if(keywords.length > 0) {
                  program.keywords = [];
                  for(var k3 = 0;k3 < keywords.length; k3++) {
                    keyword = {};
                    keyword.type = keywords[k3].getAttribute("role");
                    keyword.value =  keywords[k3].childNodes[0].nodeValue;
                    program.keywords.push(keyword );
                  }
                }
                break;
            }
        }
        var program2 = new Program(program, this.element_id + "_program_" + i, this);
        program2.bilingual = this.bilingual;
        program2.channelimage = this.image;
        program2.channel_streamurl = this.streamurl;
        newPrograms.push(program2);
    }
    return newPrograms;
};


Channel.prototype.getServiceRef = function() {
     return (this.contentGuideServiceRef) ? this.contentGuideServiceRef : this.id;
};

//Returns the service instance with the highest priority
Channel.prototype.getServiceInstance = function() {
    var instance = null;
    for(var i=0;i<this.serviceInstances.length;i++) {
        if(instance == null) {
            if( isServiceInstanceAvailable(this.serviceInstances[i])) {
              instance = this.serviceInstances[i];
            }
        }
        else if(instance.priority > this.serviceInstances[i].priority && isServiceInstanceAvailable(this.serviceInstances[i])) {
            instance = this.serviceInstances[i];
        }
    }
    return instance;
};

Channel.prototype.hasAvailability = function() {
  for(var i=0;i<this.serviceInstances.length;i++) {
    if(this.serviceInstances[i].availability) {
      return true;
    }
  }
  return false;
};

Channel.prototype.getServiceInstanceByCPSIndex = function(cpsIndex) {
  if(cpsIndex) {
    for(var i=0;i<this.serviceInstances.length;i++) {
      console.log(this.serviceInstances[i]);
      if(this.serviceInstances[i].contentProtection) {
        for(var j=0;j<this.serviceInstances[i].contentProtection.length;j++) {
          var contentProtection = this.serviceInstances[i].contentProtection[j];
          if(contentProtection.cpsIndex == cpsIndex) {
            return this.serviceInstances[i];
          }
        }
      }
    }
  }
  return null;
};

Channel.prototype.getMoreEpisodes = function(programId,callback) {
  var self = this;
  if(this.moreEpisodesURI && typeof(callback) == "function") {
    $.get( this.moreEpisodesURI+"?pid="+programId+"&type=ondemand", function( data ) {
      var episodes = self.parseSchedule(data);
      callback.call(callback,episodes);
    },"text");
  }
  else if(typeof(callback) == "function"){
   callback.call(null);
  }
};

Channel.prototype.getProgramInfo = function(programId,callback) {
  var self = this;
  if(this.programInfoURI && typeof(callback) == "function") {
    $.get( this.programInfoURI+"?pid="+programId, function( data ) {
      var episodes = self.parseSchedule(data);
      if(episodes.length > 0) {
        callback.call(callback,episodes[0]);
      }
      else {
       callback.call(null);
      }
    },"text");
  }
  else if(typeof(callback) == "function"){
   callback.call(null);
  }
};

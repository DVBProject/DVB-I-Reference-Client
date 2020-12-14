Channel.prototype.getGenre = function(genre) {
    if(typeof genre === 'string' && genre.substring(0,  "urn:dvb:metadata:cs:ContentSubject:2019:".length) == "urn:dvb:metadata:cs:ContentSubject:2019:") {
        var genre = genre.substring(genre.lastIndexOf(":")+1);
        if(genre == "1") {
            return "Movie/Drama";
        }
        else if(genre == "2") {
            return "News/Current affairs";
        }
        else if(genre == "3") {
            return "Show/Game show";
        }
        else if(genre == "4") {
            return "Sports";
        }
        else if(genre == "5") {
            return "Children's/Youth programmes";
        }
        else if(genre == "6") {
            return "Music/Ballet/Dance";
        }
        else if(genre == "7") {
            return "Arts/Culture";
        }
        else if(genre == "8") {
            return "Social/Political issues/Economics";
        }
        else if(genre == "9") {
            return "Education/Science/Factual topics";
        }
        else if(genre == "10") {
            return "Leisure hobbies";
        }
        else if(genre == "11") {
            return "Special characteristics";
        }
        else if(genre == "12") {
            return "Adult";
        }
    }
    return null; 
}

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
          for(var j = 0;j < otherIdentifiers.length;j++) {
              var type = otherIdentifiers[j].getAttribute("type");
              if(type == "CPSIndex") {
                  program.cpsIndex = otherIdentifiers[j].childNodes[0].nodeValue;
              }
          }
        }
        program.prglen = (program.end.getTime() - program.start.getTime())/(1000*60);
        for(var j=0;j<programs.length;j++) {
            if(programs[j].getAttribute("programId") == programId) {
                var description = programs[j].getElementsByTagName("BasicDescription")[0];
                var titles = description.getElementsByTagName("Title");
                program.titles = [];
                for(var j = 0;j < titles.length;j++) {
                  var element = titles[j];
                  var text = {};
                  var lang = element.getAttributeNS("http://www.w3.org/XML/1998/namespace","lang");
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
                   for(var j = 0;j < synopsis.length;j++) {
                    var element = synopsis[j];
                    var text = {};
                    var lang = element.getAttributeNS("http://www.w3.org/XML/1998/namespace","lang");
                    if(!lang) {
                      lang = "default";
                    }
                    text.lang = lang;
                    text.text =  element.childNodes[0].nodeValue;
                    text.textLength =  element.getAttribute("length");
                    program.descriptions.push(text);
                  }
                }
                var genre = description.getElementsByTagName("Genre")
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
                    if(explanatoryText.length > 0) { //assume single element
                        rating.explanatoryText = explanatoryText[0].childNodes[0].nodeValue;
                    }
                    parentals.push(rating);
                }
                program.parentalRating = parentals;
                var relatedMaterial =  description.getElementsByTagName("RelatedMaterial");
                for(var k=0;k<relatedMaterial.length;k++) {
                    var howRelated = relatedMaterial[k].getElementsByTagName("HowRelated")[0].getAttribute("href");
                    if(howRelated == "urn:tva:metadata:cs:HowRelatedCS:2012:19") { //Program still image
                        program.mediaimage = relatedMaterial[k].getElementsByTagName("MediaUri")[0].childNodes[0].nodeValue;
                        break;
                    }
                }
                var creditsList = description.getElementsByTagName("CreditsList");
                if(creditsList.length > 0) {
                  program.creditsItems = [];
                  var creditsItems = description.getElementsByTagName("CreditsItem");
                  for(var k = 0;k < creditsItems.length; k++) {
                    creditsItem = {};
                    creditsItem.role = creditsItems[k].getAttribute("role");
                    var organizations = creditsItems[k].getElementsByTagName("OrganizationName");
                    if(organizations.length > 0) {
                      creditsItem.organizations = [];
                      for(var l = 0;l < organizations.length; l++) {
                        creditsItem.organizations.push(organizations[l].childNodes[0].nodeValue);
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
                      var person = {};
                      var givenNames = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","GivenName");
                      if(givenNames.length > 0 ) {
                        person.givenName = givenNames[0].childNodes[0].nodeValue;
                      }
                      var familyName = persons[0].getElementsByTagNameNS("urn:tva:mpeg7:2008","FamilyName");
                      if(familyName.length > 0 ) {
                        person.familyName = familyName[0].childNodes[0].nodeValue;
                      }
                      creditsItem.character = person;
                    }
                    program.creditsItems.push(creditsItem);
                  }
                }
                var keywords = description.getElementsByTagName("Keyword");
                if(keywords.length > 0) {
                  program.keywords = [];
                  for(var k = 0;k < keywords.length; k++) {
                    keyword = {};
                    keyword.type = keywords[k].getAttribute("role");
                    keyword.value =  keywords[k].childNodes[0].nodeValue;
                    program.keywords.push(keyword );
                  }
                }
                break;
            }
        }
        var program = new Program(program, this.element_id + "_program_" + i, this);
        program.bilingual = this.bilingual;
        program.channelimage = this.image;
        program.channel_streamurl = this.streamurl;
        newPrograms.push(program);
    }
    return newPrograms;
}


Channel.prototype.getServiceRef = function() {
     return (this.contentGuideServiceRef) ? this.contentGuideServiceRef : this.id;
}

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
}

Channel.prototype.hasAvailability = function() {
  for(var i=0;i<this.serviceInstances.length;i++) {
    if(this.serviceInstances[i].availability) {
      return true;
    }
  }
  return false;
}

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
}

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
}

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
}

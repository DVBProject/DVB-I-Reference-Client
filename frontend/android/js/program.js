function Program(programdata, element_id, channel) {
  this.init(programdata, channel);
}

Program.prototype.init = function (programdata, channel) {
  for (var field in programdata) {
    this[field] = programdata[field];
  }
  this.channel = channel;
};

Program.prototype.populate = function () {
  var self = this;

  if (self.element == null) {
    var element = document.createElement("a");
    element.addClass("list-group-item list-group-item-action row d-flex px-2 py-1");
    element.setAttribute("href", "#");
    element.addEventListener(
      "click",
      function () {
        openProgramInfo(self);
      },
      false
    );
    var now = new Date();
    if (self.start < now) {
      if (self.end < now) {
        element.addClass("past");
      } else {
        element.addClass("current");
      }
    }
    var startTime = document.createElement("div");
    startTime.addClass("col-4 col-md-2 col-xl-1 pl-0");
    startTime.innerHTML = self.start.create24HourTimeString();
    element.appendChild(startTime);
    var title = document.createElement("div");
    title.addClass("col-6 col-md-8 col-xl-10 px-0 text-truncate");
    title.innerHTML = self.getTitle();
    if (self.parentalRating && self.parentalRating.length > 0) {
      for (var i = 0; i < self.parentalRating.length; i++) {
        if (self.parentalRating[i].minimumage) {
          title.innerHTML += "(" + self.parentalRating[i].minimumage + ")";
          break;
        }
      }
    }
    element.appendChild(title);
    if (self.cpsIndex) {
      var cpsInstance = self.channel.getServiceInstanceByCPSIndex(self.cpsIndex);
      if (cpsInstance) {
        $(element).append(
          $(
            '<div class="chdrm col-2 col-md-2 col-xl-1 px-0 d-block text-right"><img src="images/lock.svg" class="icon-green"></div>'
          )
        );
      } else {
        $(element).append(
          $(
            '<div class="chdrm col-2 col-md-2 col-xl-1 px-0 d-block text-right"><img src="images/lock.svg" class="icon-red"></div>'
          )
        );
      }
    }
    self.element = element;
  }
  return self.element;
};

/**
 * return the localised value of an element when available. If not available, return the default
 * language version for the instance document
 *
 * @param {*} elems - array of localise values in the form {lang: , text:}
 * @param {*} language - the language of the localised element to return - or use DEFAULT_LANGUAGE if not present
 */
function UseLocalisation(elems, language) {
  var ret = "",
    includes;
  for (i = 0; i < elems.length; i++) if (elems[i].lang == language) ret = elems[i].text;
  if (ret == "") for (i = 0; i < elems.length; i++) if (elems[i].lang == DEFAULT_LANGUAGE) ret = elems[i].text;
  if (ret == "") ret = "****";
  return ret;
}

Program.prototype.populateProgramInfo = function () {
  var i;
  $("#info_chicon").attr("src", this.channel.image || "./images/empty.png");
  $("#info_chnumber").text(this.channel.lcn);
  $(".chdrm_prginfo").remove();
  if (this.cpsIndex) {
    var cpsInstance = this.channel.getServiceInstanceByCPSIndex(this.cpsIndex);
    if (cpsInstance) {
      $(
        '<span class="chdrm chdrm_prginfo d-inline-block col-2 h4"><img src="images/lock.svg" class="icon-green"></span>'
      ).insertAfter(".title");
    } else {
      $(
        '<span class="chdrm chdrm_prginfo d-inline-block col-2 h4"><img src="images/lock.svg" class="icon-red"></span>'
      ).insertAfter(".title");
    }
  }
  $("#info_chname").text(getLocalizedText(this.channel.titles, language_settings.ui_language));
  $(".title").text(this.getTitle());
  $("#description").html(this.getDescription());
  $(".img").attr("src", this.mediaimage || "./images/empty.png");
  $(".date").text(this.start.getDate() + "." + (this.start.getMonth() + 1) + ".");
  $(".starttime").text(this.start.create24HourTimeString());
  $(".endtime").text(this.end.create24HourTimeString());
  $(".duration").text("" + this.prglen + i18n.getString("minutes_abbreviation"));
  if (this.parentalRating && this.parentalRating.length > 0) {
    var parental = [];
    for (i = 0; i < this.parentalRating.length; i++) {
      if (this.parentalRating[i].minimumage) {
        parental.push(i18n.getString("minimum_age_label") + ":" + this.parentalRating[i].minimumage);
      }
      if (this.parentalRating[i].parentalRating) {
        parental.push(i18n.getString("rating_label") + ":" + getParentalRating(this.parentalRating[i].parentalRating));
      }
      if (this.parentalRating[i].explanatoryText2) {
        parental.push(
          i18n.getString("reason_label") +
            ":" +
            UseLocalisation(this.parentalRating[i].explanatoryText2, language_settings.ui_language)
        );
      }
    }
    $(".parentalrating").text(parental.join(" "));
  } else {
    $(".parentalrating").text(" ");
  }
  $("#select_service_button").attr("href", "javascript:channelSelected('" + this.channel.id + "')");
  this.channel.getMoreEpisodes(this.programId, function (episodes) {
    if (episodes) {
      var episodeList = i18n.getString("more_episodes_label") + ":<br/>";
      for (i = 0; i < episodes.length; i++) {
        episodeList +=
          episodes[i].getTitle() +
          " " +
          episodes[i].start.getDate() +
          "." +
          (episodes[i].start.getMonth() + 1) +
          ". " +
          episodes[i].start.create24HourTimeString() +
          "-" +
          episodes[i].end.create24HourTimeString() +
          "<br/>";
      }
      $("#more_episodes").html(episodeList);
    } else {
      $("#more_episodes").html("");
    }
  });
  this.channel.getProgramInfo(this.programId, function (info) {
    var i;
    if (info) {
      //console.log(typeof info);
      var extendedData = "";
      if (info.creditsItems) {
        for (i = 0; i < info.creditsItems.length; i++) {
          var role = i18n.getString(creditsTypes[info.creditsItems[i].role]);
          if (role) {
            extendedData += role + ": ";
          }
          if (info.creditsItems[i].organizations && info.creditsItems[i].organizations.length > 0) {
            extendedData += info.creditsItems[i].organizations.join(",");
          }
          if (info.creditsItems[i].person) {
            extendedData += info.creditsItems[i].person.givenName + " " + info.creditsItems[i].person.familyName;
          }
          if (info.creditsItems[i].character) {
            extendedData +=
              " (" + info.creditsItems[i].character.givenName + " " + info.creditsItems[i].character.familyName + ")";
          }
          extendedData += "<br/>";
        }
      }
      if (info.keywords) {
        extendedData += i18n.getString("label_keywords") + ": ";
        for (i = 0; i < info.creditsItems.length; i++) {
          extendedData += info.keywords[i].value + ",";
        }
        extendedData = extendedData.substring(0, extendedData.length - 1);
      }
      $("#extended_info").html(extendedData);
      var longDesc = info.getLongDescription();
      if (longDesc) {
        $("#description").html(longDesc);
      }
      if (info.accessibility_attributes) {
        $("#accessibility_info").html(formatAccessibilityAttributes(info.accessibility_attributes));
      }
    } else {
      $("#extended_info").html("");
      $("#accessibility_info").html("");
    }
  });
};

Program.prototype.getTitle = function () {
  if (this.titles.length == 1) {
    return this.titles[0].text;
  } else if (this.titles.length > 1) {
    var defaultTitle = null;
    for (var i = 0; i < this.titles.length; i++) {
      if (this.titles[i].type == "main" && this.titles[i].lang == language_settings.ui_language) {
        return this.titles[i].text;
      } else if (this.titles[i].type == "main" && this.titles[i].lang == "default") {
        defaultTitle = this.titles[i].text;
      }
    }
    if (defaultTitle != null) {
      return defaultTitle;
    } else {
      return this.titles[0].text;
    }
  }
  return "";
};

Program.prototype.getDescription = function () {
  if (this.descriptions.length == 1) {
    return this.descriptions[0].text;
  } else if (this.descriptions.length > 1) {
    var defaultDesc = null;
    for (var i = 0; i < this.descriptions.length; i++) {
      if (this.descriptions[i].lang == language_settings.ui_language) {
        return this.descriptions[i].text;
      } else if (this.descriptions[i].lang == "default") {
        defaultDesc = this.descriptions[i].text;
      }
    }
    if (defaultDesc != null) {
      return defaultDesc;
    } else {
      return this.descriptions[0].text;
    }
  }
  return "No description";
};

Program.prototype.getLongDescription = function () {
  var defaultDesc = null;
  for (var i = 0; i < this.descriptions.length; i++) {
    if (this.descriptions[i].lang == language_settings.ui_language && this.descriptions[i].textLength == "long") {
      return this.descriptions[i].text;
    } else if (this.descriptions[i].lang == "default" && this.descriptions[i].textLength == "long") {
      defaultDesc = this.descriptions[i].text;
    }
  }
  if (defaultDesc != null) {
    return defaultDesc;
  }
  return null;
};

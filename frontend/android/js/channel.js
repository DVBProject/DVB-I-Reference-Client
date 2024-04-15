Channel.prototype.getNowNext = function (callback) {
  var self = this;
  if (self.contentGuideURI) {
    $.get(
      self.contentGuideURI + "?sid=" + self.getServiceRef() + "&now_next=true",
      function (data) {
        var now_next = {};
        var newPrograms = self.parseSchedule(data);
        if (newPrograms.length > 0) {
          var program = new Program(newPrograms[0], this.element_id + "_program_" + 0, self);
          program.bilingual = this.bilingual;
          program.channelimage = this.image;
          program.channel_streamurl = this.streamurl;
          now_next["now"] = program;
        }
        if (newPrograms.length > 1) {
          var program = new Program(newPrograms[1], this.element_id + "_program_" + 0, self);
          program.bilingual = this.bilingual;
          program.channelimage = this.image;
          program.channel_streamurl = this.streamurl;
          now_next["next"] = program;
        }
        self.now_next = now_next;
        if (typeof callback == "function") {
          callback.call();
        }
      },
      "text"
    );
  }
};

Channel.prototype.getSchedule = function (callback) {
  var self = this;
  self.programs = [];

  if (self.contentGuideURI) {
    $.get(
      self.contentGuideURI + "?sid=" + self.getServiceRef() + "&start=" + self.epg.start + "&end=" + self.epg.end,
      function (data) {
        var programData = self.parseSchedule(data);
        self.programs = [];
        for (var i = 0; i < programData.length; i++) {
          var program2 = new Program(programData[i], this.element_id + "_program_" + i, self);
          program2.bilingual = this.bilingual;
          program2.channelimage = this.image;
          program2.channel_streamurl = this.streamurl;
          self.programs.push(program2);
        }
        if (typeof callback == "function") {
          callback.call();
        }
      },
      "text"
    );
  }
};

Channel.prototype.init = function (init_obj, channel_index) {
  this.center = 1;
  this.open = false;
  this.element_id = channel_index;
  this.selected = false;
  var self = this;
  $.each(init_obj, function (f, field) {
    self[f] = field;
  });
  self.getNowNext();
  self.element = document.getElementById("channel_" + channel_index);
  if (self.element == null) {
    var newTextbox = document.createElement("a");
    newTextbox.href = "javascript:channelSelected('" + self.id + "')";
    newTextbox.classList.add("d-flex");
    var span1 = document.createElement("span");
    span1.classList.add("chicon", "pl-1", "order-3");
    var img = document.createElement("img");
    img.setAttribute("src", self.image || "./images/empty.png");
    span1.appendChild(img);
    newTextbox.appendChild(span1);
    var span = document.createElement("span");
    span.classList.add("chnumber", "px-1");
    span.appendChild(document.createTextNode(self.lcn));
    newTextbox.appendChild(span);
    span = document.createElement("span");
    span.classList.add("chname", "text-truncate");
    span.appendChild(document.createTextNode(getLocalizedText(self.titles, language_settings.ui_language)));
    newTextbox.appendChild(span);
    var li = document.createElement("li");
    li.classList.add("list-group-item");
    li.id = "channel_" + channel_index;
    var container = document.createElement("div");
    var ranking = this.getRanking();
    if (ranking) {
      if (ranking <= 10) {
        newTextbox.classList.add("ranking_" + ranking);
      } else if (ranking <= 100) {
        newTextbox.classList.add("ranking_100");
      } else if (ranking <= 1000) {
        newTextbox.classList.add("ranking_1000");
      } else {
        newTextbox.classList.add("ranking_10000");
      }
    }
    container.classList.add("d-flex", "justify-content-end");
    container.appendChild(newTextbox);
    if (this.serviceInstances.length == 0) {
      container.classList.add("unavailable");
    }
    li.appendChild(container);
    self.element = li;
  }
};

Channel.prototype.languageChanged = function () {
  var chname = this.element.getElementsByClassName("chname")[0];
  chname.innerHTML = "";
  chname.appendChild(document.createTextNode(getLocalizedText(this.titles, language_settings.ui_language)));
  if (this.selected) {
    document.getElementsByClassName("menuitem_chname")[0].innerHTML = getLocalizedText(
      this.titles,
      language_settings.ui_language
    );
  }
  this.epg_element = null;
  if (this.programs) {
    for (var i = 0; i < this.programs.length; i++) {
      this.programs[i].element = null;
    }
  }
};

Channel.prototype.unselected = function () {
  var self = this;
  if (self.availablityTimer) {
    clearInterval(self.availablityTimer);
    self.availablityTimer = null;
  }
  self.selected = false;
  self.element.classList.remove("active");
  player.attachSource(null);
};

Channel.prototype.getMediaPresentationApp = function (serviceInstance) {
  var self = this,
    i,
    mediaPresentationApp;
  if (serviceInstance && serviceInstance.mediaPresentationApps) {
    for (i = 0; i < serviceInstance.mediaPresentationApps.length; i++) {
      mediaPresentationApp = serviceInstance.mediaPresentationApps[i];
      if (mediaPresentationApp.contentType == XML_MIME || mediaPresentationApp.contentType == XHTML_MIMR) {
        return mediaPresentationApp.url;
      }
    }
  }
  if (self.mediaPresentationApps) {
    for (i = 0; i < self.mediaPresentationApps.length; i++) {
      mediaPresentationApp = self.mediaPresentationApps[i];
      if (mediaPresentationApp.contentType == XML_MIME || mediaPresentationApp.contentType == XHTML_MIME) {
        return mediaPresentationApp.url;
      }
    }
  }
  return null;
};

Channel.prototype.checkAvailability = function () {
  var instance = this.getServiceInstance();
  if (instance != this.serviceInstance) {
    console.log("different service instace, select service");
    this.channelSelected();
  }
  this.availablityTimer = setTimeout(this.checkAvailability.bind(this), 60 * 1000);
};

Channel.prototype.channelSelected = function () {
  var self = this;
  $("#notification").hide();
  self.element.classList.add("active");
  self.selected = true;
  var update = function () {
    self.serviceInstance = self.getServiceInstance();
    if (self.availablityTimer) {
      clearInterval(self.availablityTimer);
    }
    if (self.hasAvailability()) {
      self.availablityTimer = setTimeout(self.checkAvailability.bind(self), (60 - new Date().getSeconds()) * 1000);
    }
    if (self.serviceInstance == null) {
      $("#notification").show();
      $("#notification").removeClass();
      $("#notification").addClass("noservice");
      if (self.out_of_service_image) {
        $("#notification").html('<img src="' + self.out_of_service_image + '" class="img-fluid position-relative"/>');
      } else {
        $("#notification").text("Service not available");
      }
    }
    self.setProgramChangedTimer();
    self.updateChannelInfo();
    var mediaPresentationApp = self.getMediaPresentationApp(self.serviceInstance);
    if (mediaPresentationApp) {
      window.location = mediaPresentationApp;
    } else if (self.isProgramAllowed()) {
      $("#parentalpin").hide();
      if (self.serviceInstance) {
        player.attachSource(self.serviceInstance.dashUrl);
      }
    } else {
      player.attachSource(null);
      checkParentalPIN(
        "Enter parental PIN to watch service",
        function () {
          $("#notification").hide();
          try {
            if (player.getSource() != self.serviceInstance.dashUrl) {
              player.attachSource(self.serviceInstance.dashUrl);
            }
          } catch (e) {
            //player throws an error is there is no souce attached
            player.attachSource(self.serviceInstance.dashUrl);
          }
        },
        function () {
          $("#notification").show();
          $("#notification").removeClass();
          $("#notification").text(i18n.getString("parental_block"));
        }
      );
    }
  };
  if (self.nowNextUpdateRequired()) {
    self.getNowNext(update);
  } else {
    update.call();
  }
};

Channel.prototype.programChanged = function () {
  var self = this;
  var update = function () {
    self.updateChannelInfo();
    var serviceInstance = self.getServiceInstance();
    if (self.isProgramAllowed()) {
      $("#parentalpin").hide();
      $("#notification").hide();
      try {
        if (player.getSource() != serviceInstance.dashUrl) {
          player.attachSource(serviceInstance.dashUrl);
        }
      } catch (e) {
        //player throws an error is there is no souce attached
        player.attachSource(serviceInstance.dashUrl);
      }
    } else {
      player.attachSource(null);
      checkParentalPIN(
        "Enter parental PIN to watch service",
        function () {
          $("#notification").hide();
          try {
            if (player.getSource() != serviceInstance.dashUrl) {
              player.attachSource(serviceInstance.dashUrl);
            }
          } catch (e) {
            //player throws an error is there is no souce attached
            player.attachSource(serviceInstance.dashUrl);
          }
        },
        function () {
          $("#notification").show();
          $("#notification").removeClass();
          $("#notification").text(i18n.getString("parental_block"));
        }
      );
    }
    self.setProgramChangedTimer();
  };
  self.getNowNext(update);
};

Channel.prototype.setProgramChangedTimer = function () {
  var self = this;
  if (programChangeTimer) {
    clearTimeout(programChangeTimer);
  }
  if (self.now_next) {
    curTime = new Date();
    var now = self.now_next["now"];
    if (now) {
      if (curTime < now.end) {
        programChangeTimer = setTimeout(self.programChanged.bind(self), now.end - curTime);
      }
    }
  }
};

Channel.prototype.nowNextUpdateRequired = function () {
  var self = this;
  if (!self.contentGuideURI) {
    return false;
  }
  if (self.now_next) {
    curTime = new Date();
    var now = self.now_next["now"];
    if (now) {
      if (curTime < now.end) {
        return false;
      }
    }
  }
  return true;
};

Channel.prototype.updateChannelInfo = function () {
  var self = this,
    i,
    parental,
    info,
    cpsInstance;
  var channelInfo = $("#channel_info");
  channelInfo.empty();
  channelInfo.append(
    '<span class="menuitem_chicon d-inline-block"><img src="' + (self.image || "./images/empty.png") + '"></span>'
  );
  channelInfo.append(
    '<span class="menuitem_chnumber d-inline-block">' +
      self.lcn +
      '.</span><span class="menuitem_chname d-inline-block">' +
      getLocalizedText(this.titles, language_settings.ui_language) +
      "</span>"
  );
  if (self.provider) {
    channelInfo.append('<br/><span class="menuitem_provider d-inline-block col-12 px-0">' + self.provider + "</span>");
  }
  if (self.now_next) {
    curTime = new Date();
    var now = self.now_next["now"];
    if (now) {
      parental = "";
      if (now.parentalRating && now.parentalRating.length > 0) {
        for (i = 0; i < now.parentalRating.length; i++) {
          if (now.parentalRating[i].minimumage) {
            parental = "(" + now.parentalRating[i].minimumage + ")";
            break;
          }
        }
      }
      info = $(
        '<span class="menuitem_now d-inline-block col-auto px-0">Now: ' +
          now.getTitle() +
          parental +
          " " +
          Math.max(0, Math.round((now.end.getTime() - curTime.getTime()) / 1000 / 60)) +
          " mins remaining</span>"
      );
      channelInfo.append(info);
      if (now.cpsIndex) {
        cpsInstance = this.getServiceInstanceByCPSIndex(now.cpsIndex);
        if (cpsInstance) {
          channelInfo.append(
            '<span class="chdrm d-inline-block col-2 px-2"><img src="images/lock.svg" class="icon-green"></span>'
          );
        } else {
          channelInfo.append(
            '<span class="chdrm d-inline-block col-2 px-2"><img src="images/lock.svg" class="icon-red"></span>'
          );
        }
      }
      info.click(function () {
        openProgramInfo(now);
      });
    }
    var next = self.now_next["next"];
    if (next) {
      parental = "";
      if (next.parentalRating && next.parentalRating.length > 0) {
        for (i = 0; i < next.parentalRating.length; i++) {
          if (next.parentalRating[i].minimumage) {
            parental = "(" + next.parentalRating[i].minimumage + ")";
            break;
          }
        }
      }
      info = $(
        '<br/><span class="menuitem_next d-inline-block col-auto px-0">Next: ' +
          next.getTitle() +
          parental +
          " " +
          next.start.create24HourTimeString() +
          " Duration " +
          Math.max(0, Math.round((next.end.getTime() - next.start.getTime()) / 1000 / 60)) +
          " mins</span>"
      );
      channelInfo.append(info);
      if (next.cpsIndex) {
        cpsInstance = this.getServiceInstanceByCPSIndex(next.cpsIndex);
        if (cpsInstance) {
          channelInfo.append(
            '<span class="chdrm d-inline-block col-2 px-2"><img src="images/lock.svg" class="icon-green"></span>'
          );
        } else {
          channelInfo.append(
            '<span class="chdrm d-inline-block col-2 px-2"><img src="images/lock.svg" class="icon-red"></span>'
          );
        }
      }
      info.click(function () {
        openProgramInfo(next);
      });
    }
  }
  if (self.accessibility_attributes) {
    channelInfo.append(
      '<br/><span class="menuitem_accessibility d-inline-block col-auto px-0">' +
        formatAccessibilityAttributes(self.accessibility_attributes) +
        "</span>"
    );
  }
};

Channel.prototype.showEPG = function () {
  var self = this;
  var programList = null;
  if (self.epg_element == null) {
    var element = document.createElement("div");
    element.addClass("channelCol col-4 mx-0 px-0");
    if (selectedChannel == this) {
      element.addClass("selected");
    }
    var header = document.createElement("div");
    header.addClass("epg_chinfo align-items-center sticky-top px-2");
    var logo = document.createElement("img");
    logo.setAttribute("src", self.image || "./images/empty.png");
    logo.setAttribute("alt", "channel icon");
    logo.addClass("chicon img-fluid d-block");
    header.appendChild(logo);
    var number = document.createElement("span");
    number.addClass("chnumber d-inline-block float-left");
    number.innerHTML = self.lcn;
    header.appendChild(number);
    var name = document.createElement("span");
    name.addClass("chname text-truncate d-inline-block");
    name.innerHTML = getLocalizedText(self.titles, language_settings.ui_language);
    header.appendChild(name);
    element.appendChild(header);
    this.programList = document.createElement("ul");
    this.programList.addClass("list list-group-flush list-programs container-fluid");
    element.appendChild(this.programList);
    self.epg_element = element;
  } else {
    $(this.programList).empty();
  }
  if (!self.programs) {
    this.getSchedule(self.populateEPG.bind(self));
  } else {
    this.populateEPG();
  }
  return self.epg_element;
};

Channel.prototype.populateEPG = function () {
  var self = this;
  if (self.programs) {
    for (var i = 0; i < self.programs.length; i++) {
      this.programList.appendChild(self.programs[i].populate());
    }
  }
};

//Called when user changes parental rating in the settings
//Program information should be up to date, updated with the programChangeTimer
Channel.prototype.parentalRatingChanged = function (callback) {
  var self = this;
  var serviceInstance = self.getServiceInstance();
  if (self.isProgramAllowed()) {
    $("#parentalpin").hide();
    $("#notification").hide();
    try {
      if (player.getSource() != serviceInstance.dashUrl) {
        player.attachSource(serviceInstance.dashUrl);
      }
    } catch (e) {
      //player throws an error is there is no souce attached
      player.attachSource(serviceInstance.dashUrl);
    }
  } else {
    player.attachSource(null);
    checkParentalPIN(
      "Enter parental PIN to watch service",
      function () {
        $("#notification").hide();
        try {
          if (player.getSource() != serviceInstance.dashUrl) {
            player.attachSource(serviceInstance.dashUrl);
          }
        } catch (e) {
          //player throws an error is there is no souce attached
          player.attachSource(serviceInstance.dashUrl);
        }
      },
      function () {
        $("#notification").show();
        $("#notification").removeClass();
        $("#notification").text(i18n.getString("parental_block"));
      }
    );
  }
};

Channel.prototype.isProgramAllowed = function () {
  if (parentalEnabled && this.now_next) {
    var now = this.now_next["now"];
    if (now && now.parentalRating && now.parentalRating.length > 0) {
      for (var i = 0; i < now.parentalRating.length; i++) {
        if (now.parentalRating[i].minimumage && minimumAge < now.parentalRating[i].minimumage) {
          return false;
        }
      }
    }
  }
  return true;
};

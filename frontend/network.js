function NetworkRequest(url, settings) {
  // settings.accepts= { mycustomtype: "application/vnd.dvb.dvbi.r8" },

  settings.beforeSend = function (req) {
    // Chrome:: Refused to set unsafe header "User-Agent"
    // req.setRequestHeader("User-Agent", "DVB-I/A177r8");
    req.setRequestHeader("Accept", "text/plain, */*, application/vnd.dvb.dvbi.r8");
  };

  settings.url = url;
  return $.ajax(settings);
}

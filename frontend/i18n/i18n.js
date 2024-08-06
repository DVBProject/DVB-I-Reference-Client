function I18n() {
  this.languages = [
    { lang: "en", name: "English" },
    { lang: "zh", name: "Chinese" },
    { lang: "de", name: "German" },
    { lang: "fi", name: "Suomi" },
    { lang: "it", name: "Italian" },
  ];
  this.languageData = null;
  this.currentLanguage = null;
  this.texts = [
    "epg_button",
    "settings_button",
    "subtitle_button",
    "audio_button",
    "settings_title",
    "close_button",
    "pause_button",
    "play_button",
    "epg_page_title",
    "tune_to_channel",
    "stats_video_resolution",
    "stats_video_bitrate",
    "stats_audio_bitrate",
    "stats_latency",
    "stats_settings",
    "minutes_abbreviation",
    "minimum_age_label",
    "rating_label",
    "reason_label",
    "more_episodes_label",
    "sl_select_page",
    "select_sl",
    "select_region",
    "default_region",
    "slrquery_params_title",
    "slrquery_provider_field",
    "slrquery_language_field",
    "slrquery_genre_field",
    "slrquery_country_field",
    "slrquery_regulator_field",
    "slrquery_multi_vals",
    "slrquery_filter_button",
    "settings_menu_latency",
    "settings_menu_parental",
    "settings_menu_language",
    "settings_menu_servicelist",
    "settings_menu_streaminfo",
    "low_latency_settings_page",
    "ll_mode",
    "ll_target",
    "ll_min_drift",
    "ll_catchup_rate",
    "parental_settings_page",
    "parental_block_enabled",
    "parental_min_age",
    "parental_pin",
    "parental_pin_reenter",
    "language_settings_page",
    "language_setting_subtitle",
    "language_setting_audio",
    "language_setting_accessible_audio",
    "language_setting_ui",
    "request_region",
    "region_select_postcode",
    "region_filter_button",
    "label_keywords",
    "label_none",
    "prod_co",
    "presenter",
    "actor",
    "genre_movie",
    "genre_news",
    "genre_game",
    "genre_sports",
    "genre_childrens",
    "genre_music",
    "genre_arts",
    "genre_social",
    "genre_education",
    "genre_leisure",
    "genre_special",
    "genre_adult",
  ];
}

I18n.prototype.getSupportedLanguages = function () {
  return this.languages;
};

I18n.prototype.loadLanguage = function (language, callback) {
  var found = false;
  for (var i = 0; i < this.languages.length; i++) {
    if (this.languages[i].lang == language) {
      found = true;
      break;
    }
  }
  if (!found) {
    return false;
  }
  var jsFileLocation = $("script[src*=i18n]").attr("src"); // the js file path
  jsFileLocation = jsFileLocation.replace("i18n.js", "");
  console.log(language);
  var self = this;
  this.currentLanguage = language;
  $.get(
    jsFileLocation + language + ".json",
    function (data) {
      self.languageData = data;
      if (typeof callback == "function") {
        callback.call();
      }
    },
    "json"
  );
  return true;
};

I18n.prototype.getString = function (key) {
  if (this.languageData == null) {
    return null;
  }
  return this.languageData[key];
};

I18n.prototype.getLanguageName = function (lang) {
  if (this.languageData == null) {
    return lang;
  }
  let langStr = this.languageData[`lang_${lang.toLowerCase()}`];
  return langStr ? langStr : lang;
};

I18n.prototype.getCurrentLanguage = function () {
  return this.currentLanguage;
};

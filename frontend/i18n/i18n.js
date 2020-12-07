function I18n(){
    this.languages = [{"lang":"eng","name":"English"},{"lang":"fin","name":"Suomi"}];
    this.languageData = null;
    this.currentLanguage = null;
    this.texts = ["epg_button","settings","subtitle_button","audio_button","settings_title","close_button"];

}

I18n.prototype.getSupportedLanguages = function() {
    return this.languages;
}

I18n.prototype.loadLanguage = function(language,callback) {
    var found = false;
    for (var i = 0; i < this.languages.length; i++) {
        if (this.languages[i].lang == language) {
            found = true;
            break;
        }
    }
    if(!found) {
        return false;
    }
    var jsFileLocation = $('script[src*=i18n]').attr('src');  // the js file path
    jsFileLocation = jsFileLocation.replace('i18n.js', '');
    console.log(language);
    var self = this;
    this.currentLanguage = language;
    $.get( jsFileLocation+language+".json", function( data ) {
         self.languageData = data; 
         if(typeof(callback) == "function"){
            callback.call();
         }   
    },"json");
    return true;
}

I18n.prototype.getString = function(key) {
    if(this.launguageData = null) {
        return null;
    }
    return this.languageData[key];
}

I18n.prototype.getCurrentLanguage = function() {
    return this.currentLanguage;
}

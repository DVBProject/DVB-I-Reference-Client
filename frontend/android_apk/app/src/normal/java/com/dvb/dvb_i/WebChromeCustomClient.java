package com.dvb.dvb_i;

import android.os.Message;
import android.webkit.WebView;

class WebChromeCustomClient extends WebChromeClientCustomPoster {
    private MainActivity mainActivity;
    private UrlNavigation urlNavigation;

    public WebChromeCustomClient(MainActivity mainActivity, UrlNavigation urlNavigation) {
        this.mainActivity = mainActivity;
        this.urlNavigation = urlNavigation;
    }

    @Override
    public void onCloseWindow(WebView window) {
        if (mainActivity.isNotRoot()) mainActivity.finish();
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        return urlNavigation.createNewWindow(resultMsg);
    }

}

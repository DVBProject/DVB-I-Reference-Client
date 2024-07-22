package com.dvb.dvb_i;

import android.view.ViewParent;

public interface WebviewInterface {
    void loadUrl(String url);
    void loadUrlDirect(String url);
    String getUrl();
    void reload();
    boolean canGoBack();
    void goBack();
    void onPause();
    void onResume();
    void stopLoading();
    ViewParent getParent();
    void destroy();
    int getProgress();
    void runJavascript(String js);
}

package com.dvb.dvb_i;

import android.app.Application;
import android.os.Message;
import android.webkit.ValueCallback;

public class DvbiReferenceApplication extends Application {

    private Message webviewMessage;
    private ValueCallback webviewValueCallback;

    @Override
    public void onCreate() {
        super.onCreate();
    }

    public Message getWebviewMessage() {
        return webviewMessage;
    }

    public void setWebviewMessage(Message webviewMessage) {
        this.webviewMessage = webviewMessage;
    }

    // Needed for Crosswalk
    @SuppressWarnings("unused")
    public ValueCallback getWebviewValueCallback() {
        return webviewValueCallback;
    }

    public void setWebviewValueCallback(ValueCallback webviewValueCallback) {
        this.webviewValueCallback = webviewValueCallback;
    }
}

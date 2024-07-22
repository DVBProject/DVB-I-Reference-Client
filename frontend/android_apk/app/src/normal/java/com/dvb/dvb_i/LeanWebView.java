package com.dvb.dvb_i;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class LeanWebView extends WebView implements WebviewInterface {
    private WebViewClient mClient = null;

    public LeanWebView(Context context) {
        super(context);
    }

    public LeanWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public LeanWebView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    protected void onWindowVisibilityChanged(int visibility) {
        if  (visibility != View.GONE && visibility != View.INVISIBLE) super.onWindowVisibilityChanged(visibility);
    }

    @Override
    public void setWebViewClient(WebViewClient client) {
        mClient = client;
        super.setWebViewClient(client);
    }

    @Override
    public void setWebChromeClient(android.webkit.WebChromeClient client) {
        super.setWebChromeClient(client);
    }

    @Override
    public void loadUrl(String url) {
        if (url == null) return;

        if (url.startsWith("javascript:"))
            runJavascript(url.substring("javascript:".length()));
        else if (mClient == null || !mClient.shouldOverrideUrlLoading(this, url)) {
            super.loadUrl(url);
        }
    }

    @Override
    public void reload() {
        if (mClient == null || !(mClient instanceof WebviewClient)) super.reload();
        else if(!((WebviewClient)mClient).shouldOverrideUrlLoading(this, getUrl(), true))
            super.reload();
    }

    @Override
    public void goBack() {
        runJavascript("javascript:document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':8}));\n");
    }

    public void loadUrlDirect(String url) {
        super.loadUrl(url);
    }

    public void runJavascript(String js) {
        evaluateJavascript(js, null);
    }
}

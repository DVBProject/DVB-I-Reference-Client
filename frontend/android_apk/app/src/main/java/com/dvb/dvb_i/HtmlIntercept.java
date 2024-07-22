package com.dvb.dvb_i;

import android.content.Context;
import android.webkit.WebResourceResponse;

public class HtmlIntercept {

    private Context context;
    private String interceptUrl;

    HtmlIntercept(Context context) {
        this.context = context;
    }

    public void setInterceptUrl(String interceptUrl) {
        this.interceptUrl = interceptUrl;
    }

    public WebResourceResponse interceptHtml(WebviewInterface view, String url, String referer) {
        return null;
    }

}

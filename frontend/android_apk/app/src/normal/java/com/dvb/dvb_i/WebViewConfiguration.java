package com.dvb.dvb_i;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.os.Message;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class WebViewConfiguration {
    private static final String TAG = WebViewConfiguration.class.getName();

    public static void setupWebviewForApplication(WebviewInterface webview, MainActivity activity) {
        if (!(webview instanceof LeanWebView)) {
            Log.e(TAG, "Expected webview to be of class LeanWebView and not " + webview.getClass().getName());
            return;
        }

        LeanWebView wv = (LeanWebView)webview;

        setupWebview(wv, activity);

        UrlNavigation urlNavigation = new UrlNavigation(activity);
        urlNavigation.setCurrentWebviewUrl(webview.getUrl());

        wv.setWebChromeClient(new WebChromeCustomClient(activity, urlNavigation));
        wv.setWebViewClient(new WebviewClient(activity, urlNavigation));
        WebView.setWebContentsDebuggingEnabled(true);

        wv.removeJavascriptInterface("android_interface");
        wv.addJavascriptInterface(activity.getAndroidJsInterface(), "android_interface");

        wv.getSettings().setUserAgentString("dvb-i-reference-application-" + Build.VERSION.SDK_INT);

        if (activity.getIntent().getBooleanExtra(MainActivity.EXTRA_WEBVIEW_WINDOW_OPEN, false)) {
            // send to other webview
            Message resultMsg = ((DvbiReferenceApplication)activity.getApplication()).getWebviewMessage();
            if (resultMsg != null) {
                WebView.WebViewTransport transport = (WebView.WebViewTransport)resultMsg.obj;
                if (transport != null) {
                    transport.setWebView(wv);
                    resultMsg.sendToTarget();
                }
            }
        }
    }

    @SuppressWarnings("deprecation")
    @SuppressLint("SetJavaScriptEnabled")
    public static void setupWebview(WebviewInterface webview, Context context) {
        if (!(webview instanceof LeanWebView)) {
            Log.e(TAG, "Expected webview to be of class LeanWebView and not " + webview.getClass().getName());
            return;
        }

        LeanWebView wv = (LeanWebView)webview;
        WebSettings webSettings = wv.getSettings();

        webSettings.setBuiltInZoomControls(false);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webSettings.setDisplayZoomControls(false);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);

        webSettings.setJavaScriptEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);

        webSettings.setMinimumFontSize(1);
        webSettings.setMinimumLogicalFontSize(1);

        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        CookieManager.getInstance().setAcceptThirdPartyCookies(wv, true);

        wv.setDrawingCacheEnabled(false);
        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);

        webSettings.setSaveFormData(false);
        webSettings.setSavePassword(false);
        webSettings.setUserAgentString("android");
        webSettings.setSupportMultipleWindows(true);
        webSettings.setGeolocationEnabled(false);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
    }

    public static void removeCallbacks(LeanWebView webview) {
        webview.setWebViewClient(null);
        webview.setWebChromeClient(null);
    }
}

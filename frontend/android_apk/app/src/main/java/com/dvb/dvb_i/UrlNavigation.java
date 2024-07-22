package com.dvb.dvb_i;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.net.http.SslError;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.security.KeyChain;
import android.security.KeyChainAliasCallback;
import android.util.Log;
import android.util.Pair;
import android.webkit.ClientCertRequest;
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;

import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.security.PrivateKey;
import java.security.cert.X509Certificate;

enum WebviewLoadState {
    STATE_UNKNOWN,
    STATE_START_LOAD, // we have decided to load the url in this webview in shouldOverrideUrlLoading
    STATE_PAGE_STARTED, // onPageStarted has been called
    STATE_DONE // onPageFinished has been called
}

public class UrlNavigation {
    public static final String STARTED_LOADING_MESSAGE = "com.dvb.dvb_i.webview.started";
    public static final String FINISHED_LOADING_MESSAGE = "com.dvb.dvb_i.webview.finished";
    public static final String CLEAR_POOLS_MESSAGE = "com.dvb.dvb_i.webview.clearPools";

    private static final String TAG = UrlNavigation.class.getName();

    public static final String OFFLINE_PAGE_URL = "file:///android_asset/offline.html";

	private final MainActivity mainActivity;
    private String currentWebviewUrl;
    private final HtmlIntercept htmlIntercept;
    private final Handler startLoadTimeout = new Handler();

    private WebviewLoadState state = WebviewLoadState.STATE_UNKNOWN;
    private boolean finishOnExternalUrl = false;

    UrlNavigation(MainActivity activity) {
		this.mainActivity = activity;
        this.htmlIntercept = new HtmlIntercept(activity);

        if (mainActivity.getIntent().getBooleanExtra(MainActivity.EXTRA_WEBVIEW_WINDOW_OPEN, false)) {
            finishOnExternalUrl = true;
        }

	}

    public boolean shouldOverrideUrlLoading(WebviewInterface view, String url) {
        return shouldOverrideUrlLoading(view, url, false);
    }

    private boolean shouldOverrideUrlLoadingNoIntercept(final WebviewInterface view, final String url,
                                                        @SuppressWarnings("SameParameterValue") final boolean noAction) {
        Log.d(TAG, "shouldOverrideUrl: " + url);

        // return if url is null (can happen if clicking refresh when there is no page loaded)
        if (url == null)
            return false;

        // check to see if the webview exists in pool.

        return false;
    }

    @SuppressLint("ApplySharedPref")
    public void onPageFinished(WebviewInterface view, String url) {
        Log.d(TAG, "onpagefinished " + url);
        state = WebviewLoadState.STATE_DONE;
        this.currentWebviewUrl = url;

        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mainActivity.showWebview(url);
            }
        });

        // post-load javascript
        if (mainActivity.postLoadJavascript != null) {
            String js = mainActivity.postLoadJavascript;
            mainActivity.postLoadJavascript = null;
            mainActivity.runJavascript(js);
        }

        // send broadcast message
        LocalBroadcastManager.getInstance(mainActivity).sendBroadcast(new Intent(UrlNavigation.FINISHED_LOADING_MESSAGE));

    }

    public static boolean urlsMatchOnPath(String url1, String url2) {
        try {
            Uri uri1 = Uri.parse(url1);
            Uri uri2 = Uri.parse(url2);
            String path1 = uri1.getPath();
            String path2 = uri2.getPath();

            if (path1.length() >= 2 && path1.startsWith("//"))
                path1 = path1.substring(1);
            if (path2.length() >= 2 && path2.startsWith("//"))
                path2 = path2.substring(1);

            if (path1.isEmpty()) path1 = "/";
            if (path2.isEmpty()) path2 = "/";

            String host1 = uri1.getHost();
            String host2 = uri2.getHost();
            if (host1.startsWith("www."))
                host1 = host1.substring(4);
            if (host2.startsWith("www."))
                host2 = host2.substring(4);

            return host1.equals(host2) && path1.equals(path2);
        } catch (Exception e) {
            return false;
        }
    }

	public boolean shouldOverrideUrlLoading(final WebviewInterface view, String url,
                                            @SuppressWarnings("unused") boolean isReload) {
        if (url == null) return false;

        boolean shouldOverride = shouldOverrideUrlLoadingNoIntercept(view, url, false);
        if (shouldOverride) {
            if (finishOnExternalUrl) {
                mainActivity.finish();
            }
            return true;
        } else {
            finishOnExternalUrl = false;
        }

        // intercept html
        this.htmlIntercept.setInterceptUrl(url);
        mainActivity.hideWebview();
        state = WebviewLoadState.STATE_START_LOAD;

        return false;
    }

	public void onPageStarted(String url) {
        state = WebviewLoadState.STATE_PAGE_STARTED;
        startLoadTimeout.removeCallbacksAndMessages(null);
        htmlIntercept.setInterceptUrl(url);

        // send broadcast message
        LocalBroadcastManager.getInstance(mainActivity).sendBroadcast(new Intent(UrlNavigation.STARTED_LOADING_MESSAGE));

    }

    @SuppressWarnings("unused")
    public void showWebViewImmediately() {
        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mainActivity.showWebviewImmediately();
            }
        });
    }

    public void onFormResubmission(WebviewInterface view, Message dontResend, Message resend) {
        resend.sendToTarget();
    }

    public void doUpdateVisitedHistory(@SuppressWarnings("unused") WebviewInterface view, String url, boolean isReload) {
        if (state == WebviewLoadState.STATE_START_LOAD) {
            state = WebviewLoadState.STATE_PAGE_STARTED;
            startLoadTimeout.removeCallbacksAndMessages(null);
        }

        if (!isReload && !url.equals(OFFLINE_PAGE_URL)) {
            mainActivity.addToHistory(url);
        }
    }

	public void onReceivedError(final WebviewInterface view,
                                @SuppressWarnings("unused") int errorCode,
                                String errorDescription, String failingUrl){
        if (errorDescription != null && errorDescription.contains("net::ERR_CACHE_MISS")) {
            mainActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    view.reload();
                }
            });
            return;
        }

        boolean showingOfflinePage = false;

        // show offline page if not connected to internet
        if (state == WebviewLoadState.STATE_PAGE_STARTED || state == WebviewLoadState.STATE_START_LOAD) {

            if (mainActivity.isDisconnected() ||
                    (errorCode == WebViewClient.ERROR_HOST_LOOKUP &&
                            failingUrl != null &&
                            view.getUrl() != null &&
                            failingUrl.equals(view.getUrl()))) {

                showingOfflinePage = true;

                mainActivity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        view.stopLoading();
                        view.loadUrlDirect(OFFLINE_PAGE_URL);

                        new Handler().postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                view.loadUrl(OFFLINE_PAGE_URL);
                            }
                        }, 100);
                    }
                });
            }
        }

        if (!showingOfflinePage) {
            mainActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mainActivity.showWebview(null);
                }
            });
        }
	}

    public void onReceivedSslError(SslError error) {
        int errorMessage;
        switch (error.getPrimaryError()) {
            case SslError.SSL_EXPIRED:
                errorMessage = R.string.ssl_error_expired;
                break;
            case SslError.SSL_DATE_INVALID:
            case SslError.SSL_IDMISMATCH:
            case SslError.SSL_NOTYETVALID:
            case SslError.SSL_UNTRUSTED:
                errorMessage = R.string.ssl_error_cert;
                break;
            case SslError.SSL_INVALID:
            default:
                errorMessage = R.string.ssl_error_generic;
                break;
        }
        Log.d(TAG, "SSL error: " + errorMessage);
    }

    @SuppressWarnings("unused")
    public String getCurrentWebviewUrl() {
        return currentWebviewUrl;
    }

    public void setCurrentWebviewUrl(String currentWebviewUrl) {
        this.currentWebviewUrl = currentWebviewUrl;
    }

    public boolean createNewWindow(Message resultMsg) {
        ((DvbiReferenceApplication)mainActivity.getApplication()).setWebviewMessage(resultMsg);
        return createNewWindow();
    }

    @SuppressWarnings("unused")
    public boolean createNewWindow(ValueCallback callback) {
        ((DvbiReferenceApplication) mainActivity.getApplication()).setWebviewValueCallback(callback);
        return createNewWindow();
    }

    private boolean createNewWindow() {
        Intent intent = new Intent(mainActivity.getBaseContext(), MainActivity.class);
        intent.putExtra("isRoot", false);
        intent.putExtra(MainActivity.EXTRA_WEBVIEW_WINDOW_OPEN, true);
        // need to use startActivityForResult instead of startActivity because of singleTop launch mode
        mainActivity.startActivityForResult(intent, MainActivity.REQUEST_WEB_ACTIVITY);

        return true;
    }

    private static class GetKeyTask extends AsyncTask<String, Void, Pair<PrivateKey, X509Certificate[]>> {
        private final Activity activity;
        private final ClientCertRequest request;

        public GetKeyTask(Activity activity, ClientCertRequest request) {
            this.activity = activity;
            this.request = request;
        }

        @Override
        protected Pair<PrivateKey, X509Certificate[]> doInBackground(String... strings) {
            String alias = strings[0];

            try {
                PrivateKey privateKey = KeyChain.getPrivateKey(activity, alias);
                X509Certificate[] certificates = KeyChain.getCertificateChain(activity, alias);
                return new Pair<>(privateKey, certificates);
            } catch (Exception e) {
                Log.e(TAG, "Erorr getting private key for alias " + alias, e);
                return null;
            }
        }

        @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
        @Override
        protected void onPostExecute(Pair<PrivateKey, X509Certificate[]> result) {
            if (result != null && result.first != null & result.second != null) {
                request.proceed(result.first, result.second);
            } else {
                request.ignore();
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void onReceivedClientCertRequest(String url, ClientCertRequest request) {
        Uri uri = Uri.parse(url);
        KeyChainAliasCallback callback = alias -> {
            if (alias == null) {
                request.ignore();
                return;
            }

            new GetKeyTask(mainActivity, request).execute(alias);
        };

        KeyChain.choosePrivateKeyAlias(mainActivity, callback, request.getKeyTypes(), request.getPrincipals(), request.getHost(),
                request.getPort(), null);
    }
}

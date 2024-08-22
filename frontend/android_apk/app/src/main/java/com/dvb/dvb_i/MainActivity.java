package com.dvb.dvb_i;

import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.StrictMode;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.net.CookieHandler;
import java.util.Observable;
import java.util.Observer;
import java.util.Stack;

public class MainActivity extends AppCompatActivity implements Observer {
    public static final String webviewCacheSubdir = "webviewAppCache";
    private static final String webviewDatabaseSubdir = "webviewDatabase";
	private static final String TAG = MainActivity.class.getName();
    public static final String INTENT_TARGET_URL = "targetUrl";
    public static final String EXTRA_WEBVIEW_WINDOW_OPEN = "MainActivity.Extra.WEBVIEW_WINDOW_OPEN";
    private static final int REQUEST_WEBFORM = 300;
    public static final int REQUEST_WEB_ACTIVITY = 400;


    private WebviewInterface mWebview;
    boolean isPoolWebview = false;
    private Stack<String> backHistory = new Stack<>();


    private ProgressBar mProgress;
	private ConnectivityManager cm = null;
    private boolean isRoot;
    private boolean webviewIsHidden = false;
    private int urlLevel = -1;
    private int parentUrlLevel = -1;
    private Handler handler = new Handler();
    private ConnectivityChangeReceiver connectivityReceiver;
    protected String postLoadJavascript;
    protected String postLoadJavascriptForRefresh;

    public AndroidJsInterface getAndroidJsInterface() {
        return androidJsInterface;
    }

    private AndroidJsInterface androidJsInterface;


    @Override
	protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ConfigUtil.AppConfig appConfig = ConfigUtil.getAppConfig(this);


        View decorView = getWindow().getDecorView();
        // Hide both the navigation bar and the status bar.
        // SYSTEM_UI_FLAG_FULLSCREEN is only available on Android 4.1 and higher, but as
        // a general rule, you should design your app to hide the status bar whenever you
        // hide the navigation bar.
        int uiOptions =
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE;

        decorView.setSystemUiVisibility(uiOptions);

        decorView.setOnSystemUiVisibilityChangeListener
                (visibility -> {
                    // Note that system bars will only be "visible" if none of the
                    // LOW_PROFILE, HIDE_NAVIGATION, or FULLSCREEN flags are set.
                    if ((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
                        final Handler handler = new Handler(Looper.getMainLooper());
                        handler.postDelayed(() -> {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    decorView.setSystemUiVisibility(uiOptions);
                                }
                            });
                        }, 3000);
                        // TODO: The system bars are visible. Make any desired
                        // adjustments to your UI, such as showing the action bar or
                        // other navigational controls.
                    } else {
                        // TODO: The system bars are NOT visible. Make any desired
                        // adjustments to your UI, such as hiding the action bar or
                        // other navigational controls.
                    }
                });

        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);

        setContentView(R.layout.main_activity);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // to save webview cookies to permanent storage
        CookieSyncManager.createInstance(getApplicationContext());

        // proxy cookie manager for httpUrlConnection (syncs to webview cookies)
        CookieHandler.setDefault(new WebkitCookieManagerProxy());

        isRoot = getIntent().getBooleanExtra("isRoot", true);
        parentUrlLevel = getIntent().getIntExtra("parentUrlLevel", -1);

        if (isRoot) {
            // html5 app cache (manifest)
            File cachePath = new File(getCacheDir(), webviewCacheSubdir);
            if (!cachePath.mkdirs()) {
                Log.v(TAG, "cachePath " + cachePath.toString() + " exists");
            }
            File databasePath = new File(getCacheDir(), webviewDatabaseSubdir);
            if (databasePath.mkdirs()) {
                Log.v(TAG, "databasePath " + databasePath.toString() + " exists");

            }

        }

        cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        mProgress = findViewById(R.id.progress);

        this.androidJsInterface = new AndroidJsInterface(this);

        this.mWebview = findViewById(R.id.webview);
        setupWebview(this.mWebview);

        // to save webview cookies to permanent storage
        CookieSyncManager.createInstance(getApplicationContext());
        // proxy cookie manager for httpUrlConnection (syncs to webview cookies)
        CookieHandler.setDefault(new WebkitCookieManagerProxy());

        this.postLoadJavascript = getIntent().getStringExtra("postLoadJavascript");
        this.postLoadJavascriptForRefresh = this.postLoadJavascript;

        Intent intent = getIntent();
        // load url
        String url = getUrlFromIntent(intent);

        if (url == null && savedInstanceState != null)
            url = savedInstanceState.getString("url");
        if (url == null && isRoot && appConfig != null) {
            url = appConfig.getInitialUrl();
            String platformString = "?platform=";
            platformString = platformString + "mobile";
            if (url.endsWith("/")) {
                url = url.substring(0, url.length() - 1);
            }
            url = url + platformString + "&date=" + System.currentTimeMillis();
        }
        // url from intent (hub and spoke nav)
        if (url == null) url = intent.getStringExtra("url");

        if (url != null) {
            this.mWebview.loadUrl(url);
        } else if (intent.getBooleanExtra(EXTRA_WEBVIEW_WINDOW_OPEN, false)) {
            // no worries, loadUrl will be called when this new web view is passed back to the message
        } else {
            Log.e(TAG, "No url specified for MainActivity");
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    private String getUrlFromIntent(Intent intent) {
        if (intent == null) return null;
        // first check intent in case it was created from push notification
        String targetUrl = intent.getStringExtra(INTENT_TARGET_URL);
        if (targetUrl != null && !targetUrl.isEmpty()){
            return targetUrl;
        }

        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            Uri uri = intent.getData();
            if (uri != null && (uri.getScheme().endsWith(".http") || uri.getScheme().endsWith(".https"))) {
                Uri.Builder builder = uri.buildUpon();
                if (uri.getScheme().endsWith(".https")) {
                    builder.scheme("https");
                } else if (uri.getScheme().endsWith(".http")) {
                    builder.scheme("http");
                }
                return builder.build().toString();
            } else {
                return intent.getDataString();
            }
        }

        return null;
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.mWebview.onResume();
        runJavascript("javascript:document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':'82'}));\n");

        retryFailedPage();
        // register to listen for connectivity changes
        this.connectivityReceiver = new ConnectivityChangeReceiver();
        registerReceiver(this.connectivityReceiver,
                new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
    }

    @Override
    protected void onPause() {
        super.onPause();
        this.mWebview.onPause();

        // unregister connectivity
        if (this.connectivityReceiver != null) {
            unregisterReceiver(this.connectivityReceiver);
        }
    }
    @Override
    protected void onStop() {
        this.mWebview.onPause();
        super.onPause();
        super.onStop();
    }

    public void exitApp() {
        runOnUiThread(() -> {
            android.os.Process.killProcess(android.os.Process.myPid());
            System.exit(1);
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            CookieManager.getInstance().flush();
        } catch (Exception e) {
            Log.e(TAG, "failed to flush cookies " + e.getMessage());
        }
        // destroy webview
        if (this.mWebview != null) {
            this.mWebview.stopLoading();
            // must remove from view hierarchy to destroy
            ViewGroup parent = (ViewGroup) this.mWebview.getParent();
            if (parent != null) {
                parent.removeView((View)this.mWebview);
            }
            if (!this.isPoolWebview) this.mWebview.destroy();
        }
    }

    private void retryFailedPage() {
        // skip if webview is currently loading
        if (this.mWebview.getProgress() < 100) return;

        // skip if webview has a page loaded
        String currentUrl = this.mWebview.getUrl();
        if (currentUrl != null && !currentUrl.equals(UrlNavigation.OFFLINE_PAGE_URL)) return;

        // skip if there is nothing in history
        if (this.backHistory.isEmpty()) return;

        // skip if no network connectivity
        if (this.isDisconnected()) return;

        // finally, retry loading the page
        this.loadUrl(this.backHistory.pop());
    }

    protected void onSaveInstanceState (Bundle outState) {
        outState.putString("url", mWebview.getUrl());
        outState.putInt("urlLevel", urlLevel);
        super.onSaveInstanceState(outState);
    }

    public void addToHistory(String url) {
        if (url == null) return;

        if (this.backHistory.isEmpty() || !this.backHistory.peek().equals(url)) {
            this.backHistory.push(url);
        }

        // this is a little hack to show the webview after going back in history in single-page apps.
        // We may never get onPageStarted or onPageFinished, hence the webview would be forever
        // hidden when navigating back in single-page apps. We do, however, get an updatedHistory callback.
        showWebview(0.3);
    }

    private void goBack() {
        Log.d(TAG, "should go back");
        this.mWebview.goBack();
    }

    public void loadUrl(String url) {
        loadUrl(url, false);
    }

    public void loadUrl(String url, boolean isFromTab) {
        if (url == null) return;
        this.postLoadJavascript = null;
        this.postLoadJavascriptForRefresh = null;
        this.mWebview.loadUrl(url);
    }

    public void runJavascript(String javascript) {
        if (javascript == null) return;
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Log.w(TAG, "run javascript:"+javascript);
                mWebview.runJavascript(javascript);
            }
        });
    }

	public boolean isDisconnected(){
		NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni == null || !ni.isConnected();
	}

	// configures webview settings
	private void setupWebview(WebviewInterface wv){
        WebViewConfiguration.setupWebviewForApplication(wv, this);
	}

    public void hideWebview() {

        this.webviewIsHidden = true;
        mProgress.setAlpha(1.0f);
        mProgress.setVisibility(View.VISIBLE);

        showWebview(10);
    }

    private void showWebview(double delay) {
        if (delay > 0) {
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    showWebview(null);
                }
            }, (int) (delay * 1000));
        } else {
            showWebview(null);
        }
    }

    // shows webview with no animation
    public void showWebviewImmediately() {
        webviewIsHidden = false;
        this.mProgress.setVisibility(View.INVISIBLE);
    }

    public void showWebview(String url) {
        if (!webviewIsHidden) {
            // don't animate if already visible
            mProgress.setVisibility(View.INVISIBLE);
            return;
        }

        webviewIsHidden = false;
        mProgress.animate().alpha(0.0f)
                .setDuration(60);
    }
	
	@Override
	protected void onPostCreate(Bundle savedInstanceState) {
		super.onPostCreate(savedInstanceState);
	}
	
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }
	
	@Override
    @TargetApi(21)
    // Lollipop target API for REQEUST_SELECT_FILE_LOLLIPOP
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (data != null && data.getBooleanExtra("exit", false))
            finish();

        String url = null;
        if (data != null) {
            url = data.getStringExtra("url");
        }

        if (requestCode == REQUEST_WEBFORM && resultCode == RESULT_OK) {
            if (url != null)
                loadUrl(url);
        }

        if (requestCode == REQUEST_WEB_ACTIVITY && resultCode == RESULT_OK) {
            if (url != null) {
                int urlLevel = data.getIntExtra("urlLevel", -1);
                if (urlLevel == -1 || parentUrlLevel == -1 || urlLevel > parentUrlLevel) {
                    // open in this activity
                    this.postLoadJavascript = data.getStringExtra("postLoadJavascript");
                    loadUrl(url);
                } else {
                    // urlLevel <= parentUrlLevel, so pass up the chain
                    setResult(RESULT_OK, data);
                    finish();
                }
            }
        }

    }

    @Override
    protected void onNewIntent(Intent intent) {
        Log.w(TAG, "Received intent");
        super.onNewIntent(intent);
    }

    public boolean isNotRoot() {
        return !isRoot;
    }

    @Override
    public void setTitle(CharSequence title) {
        super.setTitle(title);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(title);
        }
    }

    @Override
    public void update(Observable o, Object arg) {
        //
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int keyCode = event.getKeyCode();
        try {
            if (keyCode == KeyEvent.KEYCODE_TV) {
                this.onPause();
                return true;
            } else if (keyCode == KeyEvent.KEYCODE_VOLUME_UP
                    || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN
                    || keyCode == KeyEvent.KEYCODE_VOLUME_MUTE) {
                return super.onKeyDown(keyCode, event);
            } else if (keyCode == KeyEvent.KEYCODE_GUIDE) {
                runJavascript("javascript:document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:'172'}));\n");
                return true;
            } else if (
                    keyCode == KeyEvent.KEYCODE_DPAD_LEFT ||
                    keyCode == KeyEvent.KEYCODE_DPAD_RIGHT ||
                    keyCode == KeyEvent.KEYCODE_DPAD_UP ||
                    keyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
                Integer arrowKeyCode = 100;
                switch(keyCode) {
                    case KeyEvent.KEYCODE_DPAD_LEFT:
                        arrowKeyCode = 37;
                        break;
                    case KeyEvent.KEYCODE_DPAD_RIGHT:
                        arrowKeyCode = 39;
                        break;
                    case KeyEvent.KEYCODE_DPAD_UP:
                        arrowKeyCode = 38;
                        break;
                    case KeyEvent.KEYCODE_DPAD_DOWN:
                        arrowKeyCode = 40;
                        break;
                }
                if (event.getAction() == KeyEvent.ACTION_DOWN) {
                    Log.d("dvb_demo", "javascript:document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:'" + arrowKeyCode + "'}));\n");
                    runJavascript("javascript:document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:'" + arrowKeyCode + "'}));\n");
                }
                return true;
            }
            else {
                super.dispatchKeyEvent(event);
                return true;
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to dispatch keyevent " + e.getMessage());
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        Log.d(TAG, "back pressed");
        //Execute your code here
        goBack();
    }

    private class ConnectivityChangeReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            retryFailedPage();
        }
    }

}

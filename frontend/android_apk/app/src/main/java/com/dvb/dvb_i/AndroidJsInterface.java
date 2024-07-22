package com.dvb.dvb_i;

import android.webkit.JavascriptInterface;

public class AndroidJsInterface {

        MainActivity main;

        public AndroidJsInterface(MainActivity mainActivity) {
                main = mainActivity;
        }

        @JavascriptInterface
                public String getTest() {
                return "Android JS interface test success";
        }

}

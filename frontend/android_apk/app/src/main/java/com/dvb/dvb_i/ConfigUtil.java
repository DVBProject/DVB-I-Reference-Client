package com.dvb.dvb_i;

import android.app.Activity;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;

public class ConfigUtil {

    public ConfigUtil() {
    }

    public static AppConfig getAppConfig(Activity activity) {
        String json = null;
        try {
            InputStream is = activity.getAssets().open("appConfig.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
            JSONObject jsonObject = new JSONObject(json);
            String initialUrl = jsonObject.getString("initialUrl");
            String client = jsonObject.getString("client");
            return new AppConfig(initialUrl, client);
        } catch (IOException | JSONException ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public static class AppConfig {
        private String initialUrl;
        private String client;

        public AppConfig(String initialUrl, String client) {
            this.initialUrl = initialUrl;
            this.client = client;
        }

        public String getInitialUrl() {
            return initialUrl;
        }

        public String getClient() {
            return client;
        }

    }
}

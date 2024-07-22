package com.dvb.dvb_i;

import android.graphics.Bitmap;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;

public class WebChromeClientCustomPoster extends WebChromeClient {
    @Override
    public Bitmap getDefaultVideoPoster() {
        return Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888);
    }
    @Override
    public void onPermissionRequest(PermissionRequest request) {
        String[] resources = request.getResources();
        for (int i = 0; i < resources.length; i++) {
            if (PermissionRequest.RESOURCE_PROTECTED_MEDIA_ID.equals(resources[i])) {
                request.grant(resources);
                return;
            }
        }
        super.onPermissionRequest(request);
    }

    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        Log.d("com.dv.dvb_i.DvbiReferenceApplication.debug", consoleMessage.message() + " -- From line " +
                consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
        return true;
    }
}

package com.dvb.dvb_i;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class AndroidJsInterface {

        MainActivity main;
        private NsdManager nsdManager;
        private static final String SERVICE_TYPE  = "_dvbservdsc._tcp";

        public AndroidJsInterface(MainActivity mainActivity) {
                main = mainActivity;
        }

        private NsdManager.DiscoveryListener discoveryListener;

        private static final String TAG = "com.dv.dvb_i.DvbiReferenceApplication.debug.servicediscovery";

        private final JSONArray serviceList = new JSONArray();


        @JavascriptInterface
        public String getTest() {
                return "Android JS interface test success";
        }

        @JavascriptInterface
        public void startNIPDiscovery() {
                Log.d(TAG, "NIP discovery start");
                if(nsdManager == null) {
                        this.initializeDiscoveryListener();
                        Context context = main.getApplicationContext();
                        nsdManager = (NsdManager) context.getSystemService(Context.NSD_SERVICE);
                        nsdManager.discoverServices(
                                SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener);
                }
        }

        @JavascriptInterface
        public String getServices() {
                Log.d(TAG, "getServices");
                return serviceList.toString();
        }

        public NsdManager.ResolveListener initializeResolveListener(String serviceName) {
                return new NsdManager.ResolveListener() {

                        @Override
                        public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) {
                                // Called when the resolve fails. Use the error code to debug.
                                Log.e(TAG, "Resolve failed: " + errorCode);
                        }

                        @Override
                        public void onServiceResolved(NsdServiceInfo serviceInfo) {
                                if(serviceInfo.getServiceName().equals(serviceName)) {
                                        Log.e(TAG, "Resolve Succeeded. " + serviceInfo);
                                        JSONObject reply = new JSONObject();
                                        byte[] sep = serviceInfo.getAttributes().get("dvbi_sep");
                                        if (sep != null && sep.length > 0) {
                                            try {
                                                reply.put("dvbi_sep", new String(sep));
                                            } catch (JSONException e) {
                                                throw new RuntimeException(e);
                                            }
                                        }
                                        byte[] sl = serviceInfo.getAttributes().get("dvbi_sl");
                                        if (sl != null && sl.length > 0) {
                                                try {
                                                        reply.put("dvbi_sl", new String(sl));
                                                } catch (JSONException e) {
                                                        throw new RuntimeException(e);
                                                }
                                        }
                                        String[] positions = {"A", "B", "C", "D"};
                                        for (String pos : positions) {
                                                byte[] orbPos = serviceInfo.getAttributes().get("orb_pos_" + pos);
                                                if (orbPos != null && orbPos.length > 0) {
                                                        try {
                                                                reply.put("orb_pos_" + pos, new String(orbPos));
                                                        } catch (JSONException e) {
                                                                throw new RuntimeException(e);
                                                        }

                                                }
                                        }
                                        main.runJavascript("javascript:if(window.nip && typeof window.nip.serviceDiscovered === 'function') window.nip.serviceDiscovered(" + reply+ ");\n");
                                        serviceList.put(reply);
                                }
                        }
                };
        }
        public void initializeDiscoveryListener() {

                // Instantiate a new DiscoveryListener
                discoveryListener = new NsdManager.DiscoveryListener() {

                        // Called as soon as service discovery begins.
                        @Override
                        public void onDiscoveryStarted(String regType) {
                                Log.d(TAG, "Service discovery started: "+regType);
                        }

                        @Override
                        public void onServiceFound(NsdServiceInfo service) {
                                // A service was found! Do something with it.
                                Log.d(TAG, "Service discovery success " + service);
                                if (service.getServiceType().contains(SERVICE_TYPE)){
                                        Log.d(TAG, "Service Type found: " + service.getServiceType());
                                        nsdManager.resolveService(service, initializeResolveListener(service.getServiceName()));
                                }
                        }

                        @Override
                        public void onServiceLost(NsdServiceInfo service) {
                                // When the network service is no longer available.
                                // Internal bookkeeping code goes here.
                                Log.e(TAG, "service lost: " + service);
                        }

                        @Override
                        public void onDiscoveryStopped(String serviceType) {
                                Log.i(TAG, "Discovery stopped: " + serviceType);
                        }


                        @Override
                        public void onStartDiscoveryFailed(String serviceType, int errorCode) {
                                Log.e(TAG, "Discovery failed: Error code:" + errorCode);
                                nsdManager.stopServiceDiscovery(this);
                        }

                        @Override
                        public void onStopDiscoveryFailed(String serviceType, int errorCode) {
                                Log.e(TAG, "Discovery failed: Error code:" + errorCode);
                                nsdManager.stopServiceDiscovery(this);
                        }
                };
        }
}

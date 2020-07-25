package com.sudoplz.rninappupdates;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.util.Log;

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.InstallState;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.play.core.tasks.Task;

import java.util.HashMap;
import java.util.Map;

import static android.app.Activity.RESULT_OK;

public class SpInAppUpdatesModule extends ReactContextBaseJavaModule implements InstallStateUpdatedListener, ActivityEventListener {

    private AppUpdateManager appUpdateManager = null;

    public static String UPDATE_COMPLETE = "update_complete";
    public static String UPDATE_FAILED = "update_failed";

    public static String IN_APP_UPDATE_RESULT_KEY = "in_app_update_result";
    public static String IN_APP_UPDATE_STATUS_KEY = "in_app_update_status";

    public static int IN_APP_UPDATE_REQUEST_CODE = 42139;

    private boolean subscribedToUpdateStatuses = false;


    public SpInAppUpdatesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        // Creates instance of the manager.
        appUpdateManager = AppUpdateManagerFactory.create(reactContext);
        appUpdateManager.registerListener(this);
        reactContext.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "SpInAppUpdates";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("IN_APP_UPDATE_RESULT_KEY", IN_APP_UPDATE_RESULT_KEY);
        constants.put("IN_APP_UPDATE_STATUS_KEY", IN_APP_UPDATE_STATUS_KEY);

        constants.put("UPDATE_AVAILABLE", UpdateAvailability.UPDATE_AVAILABLE);
        constants.put("UPDATE_NOT_AVAILABLE", UpdateAvailability.UPDATE_NOT_AVAILABLE);
        constants.put("UPDATE_UNKNOWN", UpdateAvailability.UNKNOWN);
        constants.put("UPDATE_DEV_TRIGGERED", UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS);

        constants.put("UPDATE_CANCELED", InstallStatus.CANCELED);
        constants.put("UPDATE_DOWNLOADED", InstallStatus.DOWNLOADED);
        constants.put("UPDATE_DOWNLOADING", InstallStatus.DOWNLOADING);
        constants.put("UPDATE_FAILED", InstallStatus.FAILED);
        constants.put("UPDATE_INSTALLED", InstallStatus.INSTALLED);
        constants.put("UPDATE_INSTALLING", InstallStatus.INSTALLING);
        constants.put("UPDATE_PENDING", InstallStatus.PENDING);

        constants.put("APP_UPDATE_IMMEDIATE", AppUpdateType.IMMEDIATE);
        constants.put("APP_UPDATE_FLEXIBLE", AppUpdateType.FLEXIBLE);
        return constants;
    }

    @ReactMethod
    public void setStatusUpdateSubscription(Boolean active) {
        subscribedToUpdateStatuses = active;
    }

    @ReactMethod
    public void checkNeedsUpdate(Promise resolutionPromise) {
        // Returns an intent object that you use to check for an update.
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();

        // Checks that the platform will allow the specified type of update.
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            WritableMap map = Arguments.createMap();
            int availability = appUpdateInfo.updateAvailability();
            map.putInt("updateAvailability", availability);
            map.putBoolean("isImmediateUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE));
            map.putBoolean("isFlexibleUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE));
            map.putInt("updatePriority", appUpdateInfo.updatePriority());
            Integer clientVersionStaleness = appUpdateInfo.clientVersionStalenessDays();
            if (clientVersionStaleness != null) {
                map.putInt("dayStaleness", clientVersionStaleness.intValue());
            }

            map.putInt("versionCode", appUpdateInfo.availableVersionCode());
            String packageName = appUpdateInfo.packageName();
            if (packageName != null) {
                map.putString("packageName", packageName);
            }
            long totalBytes = appUpdateInfo.totalBytesToDownload();
            if (totalBytes >= 0) {
                map.putDouble("totalBytes", (double)totalBytes);
            }
            resolutionPromise.resolve(map);
        });
    }

    @ReactMethod
    public void startUpdate(int updateType, Promise resolutionPromise) {
        // Returns an intent object that you use to check for an update.
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();

        // Checks that the platform will allow the specified type of update.
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            if (appUpdateInfo.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE) {
                resolutionPromise.reject("Error", "Update unavailable, check checkNeedsUpdate.updateAvailability first");
            } else if (!appUpdateInfo.isUpdateTypeAllowed(updateType)) {
                resolutionPromise.reject("Error", "Update type unavailable, check checkNeedsUpdate.isImmediateUpdateAllowed or checkNeedsUpdate.isFlexibleUpdateAllowed first.");
            } else {
                try {
                    appUpdateManager.startUpdateFlowForResult(
                        // Pass the intent that is returned by 'getAppUpdateInfo()'.
                        appUpdateInfo,
                        // 'AppUpdateType.IMMEDIATE' Or 'AppUpdateType.FLEXIBLE'
                        updateType,
                        // The current activity making the update request.
                        getCurrentActivity(),
                        // Include a request code to later monitor this update request.
                        IN_APP_UPDATE_REQUEST_CODE
                    );
                    resolutionPromise.resolve("Done");
                } catch (IntentSender.SendIntentException e) {
                    resolutionPromise.reject("SendIntentException","Error while starting the update flow: "+e.toString());
                }
            }
        });
    }

    @ReactMethod
    public void installUpdate() {
        appUpdateManager.completeUpdate();
    }


    @Override
    public void onStateUpdate(InstallState state) {
        if (subscribedToUpdateStatuses) {
            WritableMap data = Arguments.createMap();

            data.putInt("status", state.installStatus());
            data.putString("bytesDownloaded", state.bytesDownloaded()+"");
            data.putString("totalBytesToDownload", state.totalBytesToDownload()+"");

            emitToJS(IN_APP_UPDATE_STATUS_KEY, data);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode != IN_APP_UPDATE_REQUEST_CODE) {
            return;
        }
        emitToJS(IN_APP_UPDATE_RESULT_KEY, (resultCode == RESULT_OK ? UPDATE_COMPLETE : UPDATE_FAILED)+":"+resultCode);
    }

    @Override
    public void onNewIntent(Intent intent) {
        // no-op
    }


    @MainThread
    private void emitToJS(String key, String value) {
        ReactContext reactContext = this.getReactApplicationContext();
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return;
        }

        try {
            reactContext.getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter.class
            ).emit(key, value);
        } catch (Exception e) {
            Log.wtf("InAppUpdates_EMITTER", "Error sending Event: sp_in_app_updates_" + key, e);
        }
    }

    @MainThread
    private void emitToJS(String key, ReadableMap value) {
        ReactContext reactContext = this.getReactApplicationContext();
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return;
        }

        try {
            reactContext.getJSModule(
                    DeviceEventManagerModule.RCTDeviceEventEmitter.class
            ).emit(key, value);
        } catch (Exception e) {
            Log.wtf("InAppUpdates_EMITTER", "Error sending Event: sp_in_app_updates_" + key, e);
        }
    }
}

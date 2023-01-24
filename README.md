# sp-react-native-in-app-updates

![In app update example](https://user-images.githubusercontent.com/8539174/88419625-6db0ef00-cddd-11ea-814e-389db852368b.gif)

## Getting started

<br>

### What is this?

This is a **react-native native module** that works on both **iOS** and **Android**, and checks the stores (play/app) for a new version of your app and can prompt your user for an update.

It uses **embedded** [in-app-updates via Play-Core](https://developer.android.com/guide/playcore/in-app-updates) on Android (to check & download google play patches natively from within the app), and [react-native-siren](https://github.com/GantMan/react-native-siren) on iOS (to check & navigate the user to the AppStore).

### Why?
Because to this day I'm not aware of any react-native libraries that use play core to offer embedded in-app-updates besides this one


<br>

## Installation

`$ npm install sp-react-native-in-app-updates --save`

<br>

##### iOS only:

On **iOS** you may need to also add the following lines in your Info.plist to be able to launch the store deep link.

```
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>itms-apps</string>
</array>
```
<br>

##### Note:

This project uses [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info#installation) in the background. Install it to ensure everything works correctly.

## Usage



```javascript
import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(
  false // isDebug
);
// curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
inAppUpdates.checkNeedsUpdate({ curVersion: '0.0.8' }).then((result) => {
  if (result.shouldUpdate) {
    let updateOptions: StartUpdateOptions = {};
    if (Platform.OS === 'android') {
      // android only, on iOS the user will be promped to go to your app store page
      updateOptions = {
        updateType: IAUUpdateKind.FLEXIBLE,
      };
    }
    inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
  }
});
```
### Usage with app updates for specific country (iOS only)
```javascript
//                              👇🏻 (optional)
inAppUpdates.checkNeedsUpdate({ country: 'it' }).then(result => {
  if (result.shouldUpdate) {
    const updateOptions: StartUpdateOptions = Platform.select({
      ios: {
        title: 'Update available',
        message: "There is a new version of the app available on the App Store, do you want to update it?",
        buttonUpgradeText: 'Update',
        buttonCancelText: 'Cancel',
        country: 'it', // 👈🏻 the country code for the specific version to lookup for (optional)
      },
      android: {
        updateType: IAUUpdateKind.IMMEDIATE,
      },
    });
    inAppUpdates.startUpdate(updateOptions);
  }
});
```
<br>
<br>

### Methods:
<br>

#### `checkNeedsUpdate(checkOptions: CheckOptions) : Promise<NeedsUpdateResponse>`

Checks if there are any updates available.

Where:
`CheckOptions`

| Options | Type  | Description  |
|---|---|---|
| curVersion  | (required) String | The semver of your current app version  |
|  toSemverConverter | (optional) Function  |  This will run right after the store version is fetched in case you want to change it before it's compared as a semver |
|  customVersionComparator | (optional) Function  | By default this library uses `semver` behind the scenes to compare the store version with the `curVersion` value, but you can pass your own version comparator if you want to |
|  country (iOS only) | (optional) String  | default `undefined`, it will filter by country code while requesting an update, The value should be [ISO 3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) |

and `NeedsUpdateResponse`:

| Result | Type  | Description  |
|---|---|---|
|  shouldUpdate  | Boolean | Wether there's a newer version on the store or not  |
|  storeVersion | String  |  The latest app/play store version we're aware of |
|  other | Object  | Other info returned from the store (differs on Android/iOS) |

<br>

#### `startUpdate(updateOptions: StartUpdateOptions) : Promise`

Shows pop-up asking user if they want to update, giving them the option to download said update.


Where:
`StartUpdateOptions `

| Option                            | Type                                                                                                                          | Description                                                                                                                                                                                                                 |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| updateType (Android ONLY)         | (required on Android) [IAUUpdateKind](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78) | Either `IAUUpdateKind.FLEXIBLE` or `IAUUpdateKind.IMMEDIATE`. This uses play-core below the hood, read more [here](https://developer.android.com/guide/playcore/in-app-updates) about the two modes.                        |
| title (iOS only)                  | (optional) String                                                                                                             | The title of the alert prompt when there's a new version. (default: `Update Available`)                                                                                                                                     |
| message (iOS only)                | (optional) String                                                                                                             | The content of the alert prompt when there's a new version (default: `There is an updated version available on the App Store. Would you like to upgrade?`)                                                                  |
| buttonUpgradeText (iOS only)      | (optional) String                                                                                                             | The text of the confirmation button on the alert prompt (default: `Upgrade `)                                                                                                                                               |
| buttonCancelText (iOS only)       | (optional) String                                                                                                             | The text of the cancelation button on the alert prompt (default: `Cancel`)                                                                                                                                                  |
| forceUpgrade (iOS only)           | (optional) Boolean                                                                                                            | If set to true the user won't be able to cancel the upgrade (default: `false`)                                                                                                                                              |
| bundleId (iOS only)               | (optional) String                                                                                                             | The id that identifies the app (ex: com.apple.mobilesafari). If undefined, it will be retrieved with react-native-device-info. (default: `undefined`)                                                                       |
| country (iOS only)                | (optional) String                                                                                                             | If set, it will filter by country code while requesting an update, The value should be [ISO 3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) (default: `undefined`) |
| versionSpecificOptions (iOS only) | (optional) Array\<IosStartUpdateOptionWithLocalVersion>                                                                       | An array of IosStartUpdateOptionWithLocalVersion that specify rules dynamically based on what version the device is currently running. (default: `undefined`)                                                               |

<br>

#### `installUpdate() : void` (Android only)

Installs a downloaded update.
<br>

#### `addStatusUpdateListener(callback: (status: StatusUpdateEvent) : void) : void` (Android only)

Adds a listener for tracking the current status of the update download.

Where: `StatusUpdateEvent`

| Option | Type  | Description  |
|---|---|---|
|  status | [AndroidInstallStatus](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L1) | The status of the installation (https://developer.android.com/reference/com/google/android/play/core/install/model/InstallStatus) |
|  bytesDownloaded | int | How many bytes were already downloaded |
|  totalBytesToDownload | int | The total amount of bytes in the update |

<br>

#### `removeStatusUpdateListener(callback: (status: StatusUpdateEvent) : void): void` (Android only)

Removes an existing download status listener.
<br>
<br>

## Example:
[Example project](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/v1/Example/App.tsx#L38)
<br>
<br>



## Typical debugging workflow we had success with:

Debugging in-app-updates is tricky, so arm yourself with patience, enable debug logs by passing true to our library constructor. To enable `console.log` for _release_ you may need `react-native log-android` or `react-native log-ios`.

First of all use a **REAL device**.

##### Step 1: Enable **internal app sharing** (google it) on your android device

##### Step 2: Create a release apk (or aab) with the lower version of your app (i.e version 100)

(you don't like the debug variant right? Neither do we, but we couldn't find an easier way to check that everything's working fine - debug builds don't work with in-app-updates unfortunately)

##### Step 3: Create a release apk (or aab) with the higher version of your app (i.e version 101)

This is what you'd be updating to

##### Step 4: Upload both apk's to internal app sharing

##### Step 5: Install the version 100 on your device.

##### Step 6: Open the internal app sharing link of version 101 on your device but DON'T install it

Make sure that the button within that link says UPDATE (and NOT install)

That means google play knows there's an available update

##### Step 7: Open the installed (100) version of the app, and make sure that your code works (that you see an update popup)

Haven't really found any easier ways to test that everything works, but hey.. it get's the job done

<br>

## Troubleshooting
Keep in mind that this library is JUST a **WRAPPER** of the in-app-update api, so if you have trouble making in-app-updates work it's most probably because you're doing something wrong with google play.
<br>

- In-app updates works only with devices running Android 5.0 (**API level 21**) or higher.
- Testing this won’t work on a debug build. You would need a release build signed with the same key you use to sign your app before uploading to the Play Store (dummy signing can be used). It would be a good time to use the internal testing track.
- In-app updates are available only to user accounts that own the app. So, make sure the account you’re using has downloaded your app from Google Play at least once before using the account to test in-app updates.
- Because Google Play can only update an app to a higher version code, make sure the app you are testing as a lower version code than the update version code.
- Make sure the account is eligible and the Google Play cache is up to date. To do so, while logged into the Google Play Store account on the test device, proceed as follows:
Make sure you completely close the Google Play Store App.
Open the Google Play Store app and go to the My Apps & Games tab.

**Important: If the app you are testing doesn’t appear with an available update, don't bother checking for updates programmatically, because you'll probably never see any available updates via code either.**

<br>

## Contributing:

This library is offered as is, if you'd like to change something please open a PR

<br>

## Changelog

Read the [CHANGELOG.md](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/CHANGELOG.md) file

## License
MIT

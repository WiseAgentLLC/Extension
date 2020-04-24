# Setup
1. Clone Repo
2. Open Chrome and go to `chrome://extensions/`
3. Optional - If you have the real extension installed, disable it to avoid confusion
4. Turn on Development Mode
5. Click "Load unpacked"
6. Navigate to Repo and select the `/Chrome` folder
7. Find the ID of the unpacked extension and copy
8. Paste the ID over the value of the `extensionId` variable in `addViewCtrl.js`

# Going live
1. Paste the original ID of the official Chrome Extension for the `extensionId` value of the `extensionId` variable in `addViewCtrl.js`
    >elpiekaehikfeikdafacpofkjenfipke
2. Update the version number in `manifest.json`
3. Zip the `/Chrome` folder and send to Eleni
4. Once it passes google's review, it will automatically update in the next day or two
   To check if your version had updated, open `chrome://extensions/` and check if the version number is the same is was updated in `manifest.json`.
5. Once it is live, test the real extension.
   (Make sure you enable the real extension again)

# Code Base

### Background code
##### Manifest.json
* Controls chrome settings in extension (Including permissions)
* See: https://developer.chrome.com/apps/manifest

##### `background.js`
* The part of the extension that has permission to send web requests and access storage.
  * Given in `manifest.json`
* It acts as a go-between for our server, the extension's storage, and the javascript injected on the page.

##### `apiKey.js`
* The popup that opens when you click the extension icon in the browser.
* Saves apikey in extension's storage

##### `content.js`
* Injects the code that runs on the DOM into the DOM

### DOM Code
##### `gmail.js`
* The library we use to parse gmail html in the browser
* Needs jquery
* See: https://github.com/KartikTalwar/gmail.js/

#### `jquery.js`
* Required by `gmail.js` library and used by us to build the in-page view.

#### `addContactViewCtrl.js`
* Consumes `gmail.js` to parse the html
* Adds the button to the view
* Builds and controls the Add Contact view.
* Todo: remove the html built in jquery and use a static html file instead.

/*	This javascript runs in the background at all times

	It acts as the go between for the javascript inserted on the page and wiseagent.com

	It listens for messages from addContactViewCtrl and passes them to WiseAgent
	Then it forwards the response to addContactViewCtrl.js

	To view the console:
		go to chrome://extensions/
		find the extension
		click "background page"

	To make changes:
		go to chrome://extensions/
		find the extension
		click "reload"
	(changes will not be made to the extension until it is reloaded)
*/

// adds listener for messages from the chrome extension
chrome.runtime.onMessageExternal.addListener( function(request, sender, sendResponse) {
	chrome.storage.local.get("apiKey", function(localData) {
		var apiKey = localData.apiKey;
		var action = request.action;
		var url = "";

		switch (action) {
			case "addContact":
				url = "https://www.thewiseagent.com/extension/EndPoint/EndPoint/?action=addClient";
				break;
			case "getSourceJson":
				url = "https://www.thewiseagent.com/extension/EndPoint/EndPoint/?action=getSourceJson";
				break;
			case "getCategoryJson":
				url = "https://www.thewiseagent.com/extension/EndPoint/EndPoint/?action=getCategoryJson";
				break;
			default:
				return;
		}

		sendMsg(request, apiKey, sendResponse, url);
	});

	// If chrome.runtime.onMessageExternal has async function calls inside, you must return true
	// synchronously to tell the function that it is async
	return true;
});

function sendMsg(request, apiKey, sendResponse, url) {
  	$.post(
  		url,
		request.data + "&apiKey=" + apiKey,
		function (response) {
			sendResponse(response);
	});
}

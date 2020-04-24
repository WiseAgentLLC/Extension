// This file has access to both the Chrome Extension and the Dom
// Appends files from the extension to the Dom 

// Add JQuery
var j = document.createElement('script');
j.src = chrome.extension.getURL("/scripts/lib/jquery-3.2.1.min.js");
(document.head || document.documentElement).appendChild(j);

// Add the gmail.js library script
var g = document.createElement('script');
g.src = chrome.extension.getURL("/scripts/lib/gmail.js",);
(document.head || document.documentElement).appendChild(g);

// Add our javascript
var s = document.createElement('script');
s.src = chrome.extension.getURL("/scripts/src/addContactViewCtrl.js");
(document.head || document.documentElement).appendChild(s);

// Add the CSS
var link = document.createElement("link");
link.href = chrome.extension.getURL("/css/clientView.css");
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

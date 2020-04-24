
window.addEventListener("load", function(){
	console.log("loading")
	document.getElementById("apiKeyBtn").addEventListener("click", function() {

		var key = document.getElementById("apiKey").value;
		toggleView();
		$.post("https://www.thewiseagent.com/extension/EndPoint/EndPoint/?action=apiKey", {"apiKey" : $("#apiKey").val() })
			.done(function(resp) {
				console.log(resp + "resp");
				if(resp == "success") {
					setView(key);
					saveApiKey(key);
				}
				else {
					setView("");
					saveApiKey("");
					$("#error").show();
				}

				$("#loader").hide();
			});
	});
	document.getElementById("apiKeyAdded").addEventListener("click", function() {
		$("#form-div").toggle();
		$("#apiKeyAdded").toggle();
	});

	initView();
});


function saveApiKey(apiKey) {
	chrome.storage.local.set({"apiKey" : apiKey});
}

function initView() {
	chrome.storage.local.get("apiKey", function(result) {
		console.log("apiKey: -" + result.apiKey + "-");
		setView(result.apiKey);
	});
}

function setView(key) {
	if (isEmpty(key)) {
		$("#form-div").show();
		$("#apiKeyAdded").hide();
	}
	else {
		$("#apiKeyAdded").show();
		$("#form-div").hide();
	}
}

function toggleView() {
	$("#loader").toggle();
	$("#form-div").toggle();
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

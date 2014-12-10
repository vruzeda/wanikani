document.addEventListener("DOMContentLoaded", function () {
	chrome.storage.sync.get("apiKey", function (settings) {
		chrome.storage.local.get("error", function (data) {
			var message;
			if (data.error.code === "user_not_found") {
				if (settings.apiKey) {
					message = "Invalid API key.";
				} else {
					message = "You must set the API key in the options page for this extension to work.";
				}
			} else {
				message = data.error.message;
			}
			document.getElementById("error-message").innerText = message;
		});
	});
});
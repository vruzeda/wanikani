// Is injected when the review page is visited. Updates the review count.

var oldAvailable;

chrome.storage.sync.get("hideNumbers", function (settings) {
	if (settings.hideNumbers) {
		document.querySelector("#available-count").innerText = "+";
	}
});

document.body.addEventListener("DOMNodeInserted", function (event) {
	var newAvailable;
	if (event.target.parentNode.id === "available-count") {
		newAvailable = parseInt(event.target.data);
		if (newAvailable !== oldAvailable) {
			chrome.extension.sendMessage({"updatedReviewsAvailable": true, "reviewsAvailable": newAvailable});
		}
		oldAvailable = newAvailable;
		chrome.storage.sync.get("hideNumbers", function (settings) {
			if (settings.hideNumbers) {
				event.target.data = "+";
			}
		});
	}
});
if (document.body.innerHTML.match(/no more reviews/)) {
	chrome.extension.sendMessage({"completedReviews": true});
}
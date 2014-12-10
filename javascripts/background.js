// check if you actually have to login or if maintenance mode is in effect
// (it contains an iframe with a src of http://s3.wanikani.com/maintenance.html)

function parseStudyQueueData(input, data) {
	var json = JSON.parse(input),
		data = data || {};
	if (json.error) {
		return {"error": json.error};
	}
	data.nextReviewDate = json.requested_information.next_review_date * 1000;
	data.reviewsAvailable = json.requested_information.reviews_available;
	data.lessonsAvailable = json.requested_information.lessons_available;
	data.username = json.user_information.username;
	data.gravatar = json.user_information.gravatar;
	data.level = json.user_information.level;
	data.title = json.user_information.title;

	data.reviewsAvailableNextHour = json.requested_information.reviews_available_next_hour;
	data.reviewsAvailableNextDay = json.requested_information.reviews_available_next_day;
	return data;
}

function parseLevelProgressionData(input, data) {
	var json = JSON.parse(input),
		data = data || {};
	if (json.error) {
		return {"error": json.error};
	}
	data.radicalsProgress = json.requested_information.radicals_progress;
	data.radicalsTotal = json.requested_information.radicals_total;
	data.kanjiProgress = json.requested_information.kanji_progress;
	data.kanjiTotal = json.requested_information.kanji_total;
	return data;
}

function ajaxGet(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		callback(xhr.responseText);
	};
	chrome.storage.sync.get("apiKey", function (settings) {
		xhr.open("GET", url, true);
		xhr.send();
	});
}

function fetchStudyInformation(callback) {
	chrome.storage.sync.get("apiKey", function (settings) {
		ajaxGet("https://www.wanikani.com/api/user/" + settings.apiKey + "/study-queue", function (responseText) {
			var data = parseStudyQueueData(responseText);
			ajaxGet("https://www.wanikani.com/api/user/" + settings.apiKey + "/level-progression", function (responseText) {
				parseLevelProgressionData(responseText, data);
				callback(data);
			});
		});
	});
}

function updateBadge(newReviewCount) {
	chrome.storage.sync.get("hideNumbers", function (settings) {
		var text;
		if (newReviewCount === 0) {
			text = "";
		} else if (settings.hideNumbers) {
			text = "+";
		} else {
			text = newReviewCount.toString();
		}
		chrome.browserAction.setBadgeText({"text": text});
	});
}

function scheduleUpdate(when) {
	console.log("scheduled update for", new Date(when));
	chrome.alarms.create("update", {"when": when});
}

function scheduleUpdateAccordingToSettings() {
	chrome.storage.sync.get("updateFrequency", function (settings) {
		scheduleUpdate(Date.now() + settings.updateFrequency * 1000 * 60);
	});
}

function handleStudyInformation(data, allowNotification, callback) {
	var next;
	if (data.error) {
		chrome.storage.local.set({"error": data.error}, function () {
			chrome.browserAction.setBadgeText({"text": "!"});
			chrome.browserAction.setPopup({"popup": "pages/errorPopup.html"});
		});
	} else {
		data.error = null;
		updateBadge(data.reviewsAvailable);
		next = data.nextReviewDate;
		if (next < Date.now()) {
			scheduleUpdateAccordingToSettings();
			data.usedUpdateFrequency = true;
		} else {
			scheduleUpdate(next);
			data.usedUpdateFrequency = false;
		}
		chrome.storage.local.get("reviewsAvailable", function (oldData) {
			chrome.storage.local.set(data, function () {
				chrome.storage.sync.get(["showNotification", "alwaysShowNotification"], function (settings) {
					chrome.browserAction.setPopup({"popup": "pages/statsPopup.html"});
					if (allowNotification &&
						data.reviewsAvailable > oldData.reviewsAvailable &&
						data.reviewsAvailable > 0 &&
						(oldData.reviewsAvailable === 0 || settings.alwaysShowNotification))
					{
						showNotification();
					}
					if (callback) {
						callback();
					}
				});
			});
		});
	}
}

function update(allowNotification, callback) {
	allowNotification = allowNotification === undefined ? true : allowNotification;
	fetchStudyInformation(function (data) { handleStudyInformation(data, allowNotification, callback); });
}

function playSound(callback) {
	chrome.storage.sync.get("soundEffect", function (settings) {
		var audio;
		if (settings.soundEffect !== "none") {
			audio = new Audio();
			audio.addEventListener("canplaythrough", function () {
				audio.play();
				callback();
			});
			audio.src = "audio/" + settings.soundEffect;
			audio.load();
		}
	});
}

function showNotification() {
	chrome.storage.sync.get("autoHideNotification", function (settings) {
		playSound(function () {
			chrome.storage.local.get("reviewsAvailable", function (data) {
				var notification = webkitNotifications.createNotification(
					"images/icon-48.png",
					"WaniKani Notifier",
					"There are " + data.reviewsAvailable + " reviews available at WaniKani!");
				if (settings.autoHideNotification) {
					notification.addEventListener("display", function () {
						setTimeout(function() {
							notification.cancel();
						}, 5 * 1000);
					});
				}
				notification.addEventListener("click", function () {
					goToWaniKani("review");
					notification.cancel();
				});
				notification.show();
			});
		});
	});
}

function goToWaniKani(urlSuffix) {
	urlSuffix = urlSuffix || "";
	update(false, function () {
		chrome.tabs.create({"url": "https://www.wanikani.com/" + urlSuffix});
	});
}

chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name === "update") {
		update(); // check if on /review
	}
});

chrome.webNavigation.onCompleted.addListener(function (details) {
	if (details.url.match(/dashboard/)) { // fixme: doesn't work when just visiting /
		chrome.tabs.executeScript(details.tabId, {"file": "javascripts/dashboardUpdate.js"});
	} else if (details.url.match(/review\/session\/?$/)) { // review
		chrome.tabs.executeScript(details.tabId, {"file": "javascripts/reviewUpdate.js"});
	} else {
		chrome.tabs.executeScript(details.tabId, {"file": "javascripts/reviewsCompleted.js"});
	}
}, {"url": [{"hostSuffix": "wanikani.com", "pathEquals": "/dashboard"}, {"hostSuffix": "wanikani.com", "pathEquals": "/review/session"}, {"hostSuffix": "wanikani.com", "pathEquals": "/review"}]});

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.visitedDashboard || request.completedReviews || request.updatedApiKey) {
		update();
	} else if (request.updatedFrequency) {
		scheduleUpdateAccordingToSettings();
	} else if (request.updatedHideNumbers) {
		chrome.storage.local.get("reviewsAvailable", function (data) {
			updateBadge(data.reviewsAvailable);
		});
	} else if (request.goToReviews) {
		goToWaniKani("review");
	} else if (request.goToLessons) {
		goToWaniKani("lesson");
	} else if (request.updatedReviewsAvailable) {
		chrome.storage.local.set({"reviewsAvailable": request.reviewsAvailable}, function () {
			updateBadge(request.reviewsAvailable);
		});
	}
});

chrome.storage.sync.get(["apiKey", "showNotification", "updateFrequency", "autoHideNotification", "alwaysShowNotification", "soundEffect", "hideNumbers"], function (settings) {
	settings.apiKey = settings.apiKey || "";
	settings.showNotification = settings.showNotification === undefined ? true : settings.showNotification;
	settings.updateFrequency = settings.updateFrequency || 15;
	settings.autoHideNotification = settings.autoHideNotification === undefined ? true : settings.autoHideNotification;
	settings.alwaysShowNotification = settings.alwaysShowNotification === undefined ? false : settings.alwaysShowNotification;
	settings.soundEffect = settings.soundEffect || "altair.ogg";
	settings.hideNumbers = settings.hideNumbers === undefined ? false : settings.hideNumbers;
	chrome.storage.sync.set(settings, function () {
		update();
	});
});

chrome.idle.onStateChanged.addListener(function (status) {
	if (status === "active") {
		update();
	}
});

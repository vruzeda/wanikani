document.addEventListener("DOMContentLoaded", function () {
	var soundEffect = document.getElementById("sound-effect"),
		showNotification = document.getElementById("show-notification"),
		updateFrequency = document.getElementById("update-frequency"),
		autoHideNotification = document.getElementById("auto-hide-notification"),
		alwaysShowNotification = document.getElementById("always-show-notification"),
		apiKey = document.getElementById("api-key"),
		hideNumbers = document.getElementById("hide-numbers"),
		oldApiKeyValue,
		oldUpdateFrequencyValue,
		oldHideNumbersValue;
	document.getElementById("save").addEventListener("click", function () {
		var updateFrequencyValue = parseInt(updateFrequency.value);
		chrome.storage.sync.set({
			"soundEffect": soundEffect.value,
			"showNotification": showNotification.checked,
			"updateFrequency": updateFrequencyValue,
			"autoHideNotification": autoHideNotification.checked,
			"alwaysShowNotification": alwaysShowNotification.checked,
			"hideNumbers": hideNumbers.checked,
			"apiKey": apiKey.value
		}, function () {
			var status = document.getElementById("status");
			status.innerText = "Options saved!";
			setTimeout(function () {
				status.innerText = "";
			}, 3000);
			if (oldUpdateFrequencyValue !== updateFrequencyValue) {
				chrome.extension.sendMessage({"updatedFrequency": true});
			}
			if (oldApiKeyValue !== apiKey.value) {
				chrome.extension.sendMessage({"updatedApiKey": true});
			}
			console.log(oldHideNumbersValue, hideNumbers.checked);
			if (oldHideNumbersValue !== hideNumbers.checked) {
				chrome.extension.sendMessage({"updatedHideNumbers": true});
			}
			oldUpdateFrequencyValue = updateFrequencyValue;
			oldApiKeyValue = apiKey.value;
			oldHideNumbersValue = hideNumbers.checked;
		});
	});
	showNotification.addEventListener("click", function () {
		autoHideNotification.disabled = !showNotification.checked;
		alwaysShowNotification.disabled = !showNotification.checked;
	});
	chrome.storage.sync.get(["soundEffect", "showNotification", "updateFrequency", "autoHideNotification", "alwaysShowNotification", "apiKey", "hideNumbers"], function (items) {
		soundEffect.value = items.soundEffect;
		showNotification.checked = items.showNotification;
		updateFrequency.value = items.updateFrequency;
		autoHideNotification.checked = items.autoHideNotification;
		autoHideNotification.disabled = !items.showNotification;
		alwaysShowNotification.checked = items.alwaysShowNotification;
		alwaysShowNotification.disabled = !items.showNotification;
		apiKey.value = items.apiKey;
		oldApiKeyValue = items.apiKey;
		oldUpdateFrequencyValue = items.updateFrequency;
		hideNumbers.checked = items.hideNumbers;
		oldHideNumbersValue = items.hideNumbers;
	});
});
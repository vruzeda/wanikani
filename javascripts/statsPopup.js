document.addEventListener("DOMContentLoaded", function () {
	var toGet = [
		"gravatar", 
		"username", 
		"reviewsAvailable", 
		"lessonsAvailable", 
		"kanjiTotal", 
		"kanjiProgress",
		"radicalsTotal",
		"radicalsProgress",
		"reviewsAvailableNextHour",
		"reviewsAvailableNextDay",
		"level",
		"title"
	];
	chrome.storage.local.get(toGet, function (data) {
		chrome.storage.sync.get("hideNumbers", function (settings) {
			var progress = (data.kanjiProgress / data.kanjiTotal + data.radicalsProgress / data.radicalsTotal) / 2 * 100,
				reviews = document.getElementById("reviews"),
				username = document.getElementById("username"),
				level = document.getElementById("level"),
				progressBar = document.getElementById("progress-bar"),
				avatar = document.querySelector("#avatar > img"),
				lessons = document.getElementById("lessons"),
				nextHour = document.getElementById("next-hour"),
				nextDay = document.getElementById("next-day");
			reviews.innerText = settings.hideNumbers ? (data.reviewsAvailable > 0 ? "Some" : "No") : data.reviewsAvailable;
			username.innerText = data.username + " of Sect " + data.title;
			level.innerText = data.level;
			progressBar.querySelector("div").style.width = progress + "%";
			progressBar.querySelector("span").innerText = progress.toFixed(1) + "%";
			avatar.src = "http://www.gravatar.com/avatar/" + data.gravatar + "?s=100";
			lessons.innerText = settings.hideNumbers ? (data.lessonsAvailable > 0 ? "Some" : "No") : data.lessonsAvailable;
			nextHour.innerText = settings.hideNumbers ? (data.reviewsAvailableNextHour > 0 ? "some" : "none") : data.reviewsAvailableNextHour;
			nextDay.innerText = settings.hideNumbers ? (data.reviewsAvailableNextDay > 0 ? "some" : "none") : data.reviewsAvailableNextDay;
			
			function clickedLink(linkName) {
				var params = {};
				params["goTo" + linkName] = true;
				return function () {
					chrome.extension.sendMessage(params);
					document.body.innerHTML = "Loading...";
				};
			}
			
			reviews.parentNode.addEventListener("click", clickedLink("Reviews"));
			lessons.parentNode.addEventListener("click", clickedLink("Lessons"));
		});
	});
});
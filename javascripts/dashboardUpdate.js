// Is injected when the dashboard is visited. Updates the review count.

chrome.extension.sendMessage({"visitedDashboard": true, "html": document.body.innerHTML});
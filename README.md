WaniKani Notifier
=================

An extension for Chrome that notifies you when there are new reviews available at WaniKani.

Installation
------------

Since I'm not up to being a Chrome Web Store developer, I'm not planning on actually publishing this there.
Who knows, maybe I'll publish an Android widget (since I already paid the Android's Developer fee).

That being said, to install this application, you have to enable Developer Mode inside the Extensions settings for Chrome, and load this as an unpacked extension.
Let me guide you step by step:

1. Go to "Extensions"
2. Check the "Developer Mode" checkbox
3. Click on "Load unpacked extension..."
4. Navigate to the extension's directory
5. Select it

Now you have it!

Just to make sure, after you've done all that, you still have to input your Public API Key in the extension's settings.
To do that:

1. Go to your [WaniKani's account page](https://www.wanikani.com/account/).
2. Copy your "Public API Key".
3. Right click the extension's button.
4. Select "Options".
5. Paste your "Public API Key" there!
6. (Optional) I strongly advise you to use "Review Time!" as your "Sound effect", it's amazing! (Thanks again, Koichi!)

頑張って！ (I'm not in that kanji level, so がんばって！)

Apologies
---------

This application is a complete rip-off of another extension, written by kaerigan, that you can find [here](https://chrome.google.com/webstore/detail/wanikani-notifier/mnfjhdckfnpadljgejoahopllkipaokd).
In its description, kaerigan said that he/she wasn't going to maintain this extension anymore, but, because the WaniKani API is now HTTPS, it's no longer working.

This project here is just a fix for that problem (basically, I just changed every HTTP request to HTTPS).

To kaerigan: if this project, by any means, violates anything, just message me, and I'll take it down.

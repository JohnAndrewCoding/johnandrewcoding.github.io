// sw.js - Background Push Event Listener
self.addEventListener('push', function(event) {
    let payload = "Update your picks before kickoff!";
    
    if (event.data) {
        try {
            // Check if ntfy packaged the message as a JSON object
            const json = event.data.json();
            payload = json.message || json.title || payload;
        } catch (e) {
            // Fallback if it sent raw text
            payload = event.data.text();
        }
    }

    const options = {
        body: payload,
        icon: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
        badge: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
        vibrate: [200, 100, 200],
        data: { url: self.registration.scope } 
    };

    event.waitUntil(
        self.registration.showNotification("CFB Pick'em", options)
    );
});

// Optional: Open the app immediately when someone taps the notification banner
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

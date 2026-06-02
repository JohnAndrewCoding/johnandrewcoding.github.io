// sw.js - Simple background listener for incoming streams
self.addEventListener('push', function(event) {
    const payload = event.data ? event.data.text() : 'Update your picks!';
    
    const options = {
        body: payload,
        icon: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
        badge: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification("CFB Pick'em", options)
    );
});

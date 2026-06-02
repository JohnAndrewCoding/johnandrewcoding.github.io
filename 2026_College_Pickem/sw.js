// sw.js - Stays alive in the iOS background
self.addEventListener('push', function(event) {
  // Wakes up when GitHub Actions pings the network
  const payload = event.data ? event.data.text() : 'Update your picks!';
  
  const options = {
    body: payload,
    // Optional: Use a high-res sports emoji as your notification icon
    icon: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
    badge: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c8.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification("CFB Pick'em", options)
  );
});

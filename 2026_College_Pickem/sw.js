// No more manual service worker registrations or conversion math here!

document.getElementById("enable-alerts-btn").addEventListener("click", function() {
    // If the PushAlert script is loaded, trigger their native iOS prompt
    if (typeof pushalert !== 'undefined') {
        pushalert.subscribe();
        
        // Match your beautiful retro styling on success
        this.innerText = "ALERTS CONNECTED ✅";
        this.style.backgroundColor = "var(--retro-green)";
        this.style.color = "#000000";
    } else {
        alert("System initializing. Please wait a second and tap again!");
    }
});

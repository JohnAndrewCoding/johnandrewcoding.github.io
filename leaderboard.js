// Initialize Firebase
const firebaseConfig = { apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU", 
                        authDomain: "college-football-pickem-68eed.firebaseapp.com", 
                        projectId: "college-football-pickem-68eed", 
                        storageBucket: "college-football-pickem-68eed.appspot.com", 
                        messagingSenderId: "650202039805",
                        appId: "1:650202039805:web:70e51177aab22e4d614594" };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to load leaderboard
async function loadLeaderboard() {
  const leaderboardContainer = document.getElementById('leaderboard');
  leaderboardContainer.innerHTML = '<p>Loading leaderboard...</p>';

  try {
    const snapshot = await db.collection('usersRecords').get();
    const users = [];

    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    // Sort by wins (descending), then losses (ascending)
    users.sort((a, b) => {
      if (b.wins === a.wins) return a.losses - b.losses;
      return b.wins - a.wins;
    });

    leaderboardContainer.innerHTML = ''; // Clear loading message

    users.forEach((user, index) => {
      const div = document.createElement('div');
      div.style.padding = "10px";
      div.style.marginBottom = "8px";
      div.style.borderBottom = "1px solid #ccc";
      div.textContent = `${index + 1}. ${user.name} — ${user.wins}W / ${user.losses}L`;
      leaderboardContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Error loading leaderboard:", error);
    leaderboardContainer.innerHTML = '<p style="color:red;">Error loading leaderboard.</p>';
  }
}

// Call leaderboard on page load
document.addEventListener('DOMContentLoaded', loadLeaderboard);

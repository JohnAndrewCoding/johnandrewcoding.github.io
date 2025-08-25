const firebaseConfig = {
  apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU",
  authDomain: "college-football-pickem-68eed.firebaseapp.com",
  projectId: "college-football-pickem-68eed",
  storageBucket: "college-football-pickem-68eed.appspot.com",
  messagingSenderId: "650202039805",
  appId: "1:650202039805:web:70e51177aab22e4d614594"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// References
const leaderboardTable = document.getElementById('leaderboardTable');

// Load leaderboard
async function loadLeaderboard() {
  try {
    const snapshot = await db.collection('userRecords').get();
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        name: data.name || doc.id,
        wins: data.wins || 0,
        losses: data.losses || 0
      });
    });

    // Sort by wins descending, then losses ascending
    users.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    // Clear table body
    leaderboardTable.innerHTML = '';

    // Populate table
    users.forEach((user, index) => {
      const tr = document.createElement('tr');

      const rankTd = document.createElement('td');
      rankTd.textContent = index + 1;

      const nameTd = document.createElement('td');
      nameTd.textContent = user.name;

      const recordTd = document.createElement('td');
      recordTd.textContent = `${user.wins}-${user.losses}`;

      tr.appendChild(rankTd);
      tr.appendChild(nameTd);
      tr.appendChild(recordTd);

      leaderboardTable.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

// Optional: sign in user to identify name in leaderboard
document.getElementById("googleSignInBtn")?.addEventListener('click', () => {
  auth.signInWithPopup(provider);
});

document.getElementById("googleSignOutBtn")?.addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    console.log(`Signed in as ${user.displayName}`);
    loadLeaderboard();
  } else {
    console.log("Not signed in");
    loadLeaderboard();
  }
});

// Initial load
loadLeaderboard();


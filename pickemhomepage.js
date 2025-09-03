// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU",
  authDomain: "college-football-pickem-68eed.firebaseapp.com",
  projectId: "college-football-pickem-68eed",
  storageBucket: "college-football-pickem-68eed.appspot.com",
  messagingSenderId: "650202039805",
  appId: "1:650202039805:web:70e51177aab22e4d614594"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const weekNum = 1;
const picksCollection = `week${weekNum}Picks`;
const recordsCollection = 'userRecords';
const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902';

// --------------------
// Fetch game results dynamically
// --------------------
async function getGameResults() {
  const res = await fetch(apiUrl);
  const data = await res.json();

  const results = {};

  // Loop through all events returned by API
  data.events.forEach(event => {
    if(!event.competitions || !event.competitions[0]) return;
    const comp = event.competitions[0];

    if(comp.status.type.completed === false) return; // skip unfinished games

    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');

    if(!home || !away) return;

    const matchupKey = `${home.team.location} vs ${away.team.location}`;
    const homeScore = parseInt(home.score, 10);
    const awayScore = parseInt(away.score, 10);
    const winner = homeScore > awayScore ? home.team.location : away.team.location;

    results[matchupKey] = winner;
  });

  return results;
}

// --------------------
// Update user records
// --------------------
async function updateUserRecords() {
  const results = await getGameResults();
  const picksSnapshot = await db.collection(picksCollection).get();

  for (const doc of picksSnapshot.docs) {
    const data = doc.data();
    const userId = data.uid;
    const name = data.name || 'Anonymous';
    const userPicks = data.picks || {};

    let wins = 0;
    let losses = 0;

    Object.entries(userPicks).forEach(([matchupKey, pickedTeam]) => {
      if (results[matchupKey]) {
        if (pickedTeam === results[matchupKey]) wins++;
        else losses++;
      }
    });

    await db.collection(recordsCollection).doc(userId).set({
      name: name,
      wins: wins,
      losses: losses,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
}

// --------------------
// Render leaderboard
// --------------------
async function renderLeaderboard() {
  const tableBody = document.querySelector('#leaderboard tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  await updateUserRecords();

  const leaderboardSnapshot = await db.collection(recordsCollection)
    .orderBy('wins','desc')
    .orderBy('losses','asc')
    .get();

  let rank = 1;
  leaderboardSnapshot.forEach(doc => {
    const { name='Anonymous', wins=0, losses=0 } = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `<td>${rank}</td><td>${name}</td><td>${wins}-${losses}</td>`;
    tableBody.appendChild(row);
    rank++;
  });
}

// --------------------
// Auth listener
// --------------------
auth.onAuthStateChanged(user => {
  const loginBtn = document.getElementById('googleSignInBtn');
  const logoutBtn = document.getElementById('googleSignOutBtn');
  const authStatus = document.getElementById('authStatus');

  if(user){
    authStatus.textContent = `Signed in as ${user.displayName}`;
    if(loginBtn) loginBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    authStatus.textContent = 'Not signed in';
    if(loginBtn) loginBtn.style.display = 'inline-block';
    if(logoutBtn) logoutBtn.style.display = 'none';
  }

  renderLeaderboard();
});

// --------------------
// Sign-in / Sign-out buttons
// --------------------
document.getElementById('googleSignInBtn').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};
document.getElementById('googleSignOutBtn').onclick = () => auth.signOut();

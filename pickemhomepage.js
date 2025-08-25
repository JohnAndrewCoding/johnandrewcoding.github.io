// Firebase config (same as your games page)
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

// --------------------
// Render leaderboard table dynamically
// --------------------
async function renderLeaderboard() {
  const tableBody = document.querySelector('#leaderboard tbody');
  if (!tableBody) return;

  tableBody.innerHTML = ''; // clear old rows

  try {
    const usersSnapshot = await db.collection('users').orderBy('wins', 'desc').get();
    let rank = 1;

    usersSnapshot.forEach(doc => {
      const { displayName = 'Anonymous', wins = 0, losses = 0 } = doc.data();

      const row = document.createElement('tr');
      const rankCell = document.createElement('td');
      rankCell.textContent = rank;
      const nameCell = document.createElement('td');
      nameCell.textContent = displayName;
      const recordCell = document.createElement('td');
      recordCell.textContent = `${wins}-${losses}`;

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(recordCell);
      tableBody.appendChild(row);

      rank++;
    });

  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }
}

// --------------------
// Show current user's record
// --------------------
async function showUserRecord() {
  const user = auth.currentUser;
  const recordElem = document.getElementById('userRecord');
  if (!user || !recordElem) return;

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const { wins = 0, losses = 0 } = userDoc.exists ? userDoc.data() : { wins: 0, losses: 0 };
    recordElem.textContent = `Your Record: ${wins}-${losses}`;
  } catch (err) {
    console.error('Error fetching user record:', err);
  }
}

// --------------------
// Auth state listener
// --------------------
auth.onAuthStateChanged(user => {
  const loginBtn = document.getElementById('googleSignInBtn');
  const logoutBtn = document.getElementById('googleSignOutBtn');
  const authStatus = document.getElementById('authStatus');

  if (user) {
    authStatus.textContent = `Signed in as ${user.displayName}`;
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    showUserRecord();
  } else {
    authStatus.textContent = 'Not signed in';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    const recordElem = document.getElementById('userRecord');
    if (recordElem) recordElem.textContent = '';
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

document.getElementById('googleSignOutBtn').onclick = () => {
  auth.signOut();
};





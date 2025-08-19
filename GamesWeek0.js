// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU",
  authDomain: "college-football-pickem-68eed.firebaseapp.com",
  projectId: "college-football-pickem-68eed",
  storageBucket: "college-football-pickem-68eed.appspot.com",
  messagingSenderId: "650202039805",
  appId: "1:650202039805:web:70e51177aab22e4d614594"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const userSelections = {};
let currentUser = null;  // Store signed-in user UID

// Save picks
function savePicks(weekNum) {
  document.getElementById('Week0picksform').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Sign in first!");

    const docId = `${currentUser}_week${weekNum}`;
    const dbName = `week${weekNum}Picks`;

    try {
      await db.collection(dbName).doc(docId).set({
        uid: currentUser,
        week: weekNum,
        picks: userSelections,
        timestamp: new Date()
      });
      alert("Picks saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save picks.");
    }
  });
}

// Load picks
async function loadUserPicks(weekNum) {
  if (!currentUser) return;
  const docId = `${currentUser}_week${weekNum}`;
  const dbName = `week${weekNum}Picks`;

  try {
    const docRef = await db.collection(dbName).doc(docId).get();
    if (!docRef.exists) return;

    const picks = docRef.data().picks || {};
    Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
      const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
      if (!btnGroup) return;
      btnGroup.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active');
        btn.style.outline = 'none';
        btn.style.boxShadow = 'none';
        if (btn.textContent.trim() === selectedTeam) {
          btn.classList.add('active');
          btn.style.outline = '2px solid white';
          btn.style.boxShadow = '0 0 10px white';
          userSelections[matchupKey] = selectedTeam;
        }
      });
    });
  } catch (err) {
    console.error("Error loading picks:", err);
  }
}

// Initialize picks page
async function initPicks(weekNum) {
  document.getElementById('welcomeMessage').innerText = `Week ${weekNum} Picks`;
  savePicks(weekNum);
  await loadGames(weekNum);
  await loadUserPicks(weekNum);
}

// Google Sign-In / Sign-Out
document.getElementById("googleSignInBtn").onclick = () => {
  auth.signInWithPopup(provider).then(result => {
    currentUser = result.user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${result.user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(0);
  });
};

document.getElementById("googleSignOutBtn").onclick = () => {
  auth.signOut().then(() => {
    currentUser = null;
    document.getElementById("authStatus").innerText = "Not signed in";
    document.getElementById("googleSignInBtn").style.display = "inline-block";
    document.getElementById("googleSignOutBtn").style.display = "none";
  });
};

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(0);
  }
});

// Load games from ESPN API
async function loadGames(weekNum) {
  const form = document.getElementById('week0games');
  form.innerHTML = '';
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250823');
    const data = await res.json();

    data.events.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const matchupKey = `${home.location} vs ${away.location}`;

      const rowDiv = document.createElement('div');
      rowDiv.className = 'd-flex justify-content-between align-items-center mb-2';

      // Game info (left)
      const infoDiv = document.createElement('div');
      infoDiv.innerHTML = `<img src="${home.logo}" width="25"> ${home.location} vs <img src="${away.logo}" width="25"> ${away.location}`;

      // Buttons (right)
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';
      btnGroup.setAttribute('data-matchup', matchupKey);
      [home.location, away.location].forEach(team => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-light';
        btn.textContent = team;
        btn.onclick = () => {
          btnGroup.querySelectorAll('button').forEach(b => {
            b.classList.remove('active');
            b.style.outline = 'none';
            b.style.boxShadow = 'none';
          });
          btn.classList.add('active');
          btn.style.outline = '2px solid white';
          btn.style.boxShadow = '0 0 10px white';
          userSelections[matchupKey] = team;
        };
        btnGroup.appendChild(btn);
      });

      rowDiv.appendChild(infoDiv);
      rowDiv.appendChild(btnGroup);
      form.appendChild(rowDiv);
    });
  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

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
const userSelections = {};
let currentUser = null;
let picksInitialized = false;

document.body.style.backgroundColor = '#1c1c1c';

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

function adjustColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let g = ((num >> 8) & 0x00FF) + amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  let b = (num & 0x0000FF) + amount;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Save picks (with listener cleanup)
function savePicks(user, weekNum) {
  const form = document.getElementById('Week1picksform');

  // Remove previous submit listener to prevent duplicates
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const docId = `${user.uid}_week${weekNum}`;
    const dbName = `week${weekNum}Picks`;

    db.collection(dbName).doc(docId).set({
      uid: user.uid,
      name: user.displayName,
      week: weekNum,
      picks: userSelections,
      timestamp: new Date()
    }).then(() => alert("Picks saved successfully!"))
      .catch(err => console.error("Error saving picks:", err));
  });
}

// Load picks and apply to buttons
async function loadUserPicks(user, weekNum) {
  const docId = `${user.uid}_week${weekNum}`;
  const dbName = `week${weekNum}Picks`;
  const docRef = await db.collection(dbName).doc(docId).get();

  if (!docRef.exists) return;

  const picks = docRef.data().picks || {};
  Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
    const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
    if (!btnGroup) return;

    // Find the button by its data attribute instead of textContent
    const buttons = Array.from(btnGroup.querySelectorAll('button'));
    const matchBtn = buttons.find(b => (b.dataset.teamLocation || '') === selectedTeam);

    if (matchBtn) {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.style.outline = 'none';
        b.style.boxShadow = 'none';
      });
      matchBtn.classList.add('active');
      matchBtn.style.outline = '2px solid white';
      matchBtn.style.boxShadow = '0 0 10px white';
      userSelections[matchupKey] = selectedTeam;
    }
  });
}

// Load games and buttons
async function loadGames(weekNum, user) {
  const container = document.getElementById('week1games');
  container.innerHTML = ''; // Clear previous games

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902');
    const data = await res.json();
    const gameSlate = [
      data.events[0], data.events[7], data.events[14], data.events[20], data.events[24], data.events[25],
      data.events[28], data.events[33], data.events[37], data.events[48], data.events[67],
      data.events[72], data.events[81], data.events[84], data.events[86], data.events[88],
      data.events[89], data.events[90]
    ].filter(Boolean); // defensive: skip undefined

    gameSlate.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const matchupKey = `${home.location} vs ${away.location}`;

      // Row container
      const rowDiv = document.createElement('div');
      rowDiv.className = 'd-flex justify-content-between align-items-center mb-2';

      // Game info (left)
      const infoDiv = document.createElement('div');
      infoDiv.className = 'd-flex align-items-center';
      infoDiv.innerHTML = `
        <img src="${home.logo}" width="25" height="25" class="me-1" alt="${home.location}">
        ${home.location} vs
        <img src="${away.logo}" width="25" height="25" class="mx-1" alt="${away.location}">
        ${away.location}
      `;

      // Button group (right)
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';
      btnGroup.setAttribute('role', 'group');
      btnGroup.setAttribute('data-matchup', matchupKey);

      [home, away].forEach(team => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';

        // NEW: attach identity for later matching
        btn.dataset.teamLocation = team.location;    // what you currently save
        btn.dataset.teamId = team.id;                // optional future-proofing
        btn.title = team.displayName || team.location;

        const bgColor = `#${adjustColor(team.color, 40) || (team === home ? "007bff" : "6c757d")}`;
        btn.style.backgroundColor = bgColor;
        btn.style.border = '2px solid white';
        btn.style.borderRadius = '8px';
        btn.style.padding = '0.5rem';
        btn.style.margin = '0 0.2rem';
        btn.style.minWidth = '60px';
        btn.style.height = '60px';
        btn.style.display = 'flex';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';

        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.location;
        img.style.maxWidth = '80%';
        img.style.maxHeight = '80%';
        img.style.objectFit = 'contain';

        btn.appendChild(img);

        btn.onclick = () => {
          btnGroup.querySelectorAll('button').forEach(b => {
            b.classList.remove('active');
            b.style.outline = 'none';
            b.style.boxShadow = 'none';
          });
          btn.classList.add('active');
          btn.style.outline = '2px solid white';
          btn.style.boxShadow = '0 0 10px white';
          // Save by the same value we use to restore (location)
          userSelections[matchupKey] = btn.dataset.teamLocation;
        };

        btnGroup.appendChild(btn);
      });

      // Odds
      const oddsText = comp.odds && comp.odds.length > 0 ? comp.odds[0].details : 'N/A';
      const oddsDiv = document.createElement('div');
      oddsDiv.className = 'mt-1';
      oddsDiv.style.fontSize = '0.9rem';
      oddsDiv.textContent = `Odds: ${oddsText}`;

      rowDiv.appendChild(infoDiv);
      rowDiv.appendChild(btnGroup);
      rowDiv.appendChild(oddsDiv);
      container.appendChild(rowDiv);
    });

    // Apply previous picks after DOM is ready
    if (user) await loadUserPicks(user, weekNum);

  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

// Initialize picks
function initPicks(user) {
  if (picksInitialized) return;
  picksInitialized = true;

  const weekNum = 1;
  document.getElementById('welcomeMessage').innerText = `${user.displayName}'s Week ${weekNum} Picks`;
  savePicks(user, weekNum);
  loadGames(weekNum, user);
}

// Sign-in
document.getElementById("googleSignInBtn").onclick = () => {
  auth.signInWithPopup(provider);
};

// Sign-out (reset everything)
document.getElementById("googleSignOutBtn").onclick = () => {
  auth.signOut().then(() => {
    currentUser = null;
    picksInitialized = false;
    document.getElementById("authStatus").innerText = "Not signed in";
    document.getElementById("googleSignInBtn").style.display = "inline-block";
    document.getElementById("googleSignOutBtn").style.display = "none";
    document.getElementById('week1games').innerHTML = '';
    document.getElementById('welcomeMessage').innerText = '';
  });
};

// Detect auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(user);
  }
});

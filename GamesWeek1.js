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

// Set body background
document.body.style.backgroundColor = '#1c1c1c';

// Utility to get readable text color based on background
function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

// Adjust hex color brightness
function adjustColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let num = parseInt(color, 16);
  let r = (num >> 16) + amount; r = Math.max(Math.min(255, r), 0);
  let g = ((num >> 8) & 0x00FF) + amount; g = Math.max(Math.min(255, g), 0);
  let b = (num & 0x0000FF) + amount; b = Math.max(Math.min(255, b), 0);
  return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Save picks to Firestore
function savePicks(user, weekNum) {
  const form = document.getElementById('Week1picksform');
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener('submit', async function(e) {
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

// Load previous picks and mark active buttons
async function loadUserPicks(user, weekNum) {
  const docId = `${user.uid}_week${weekNum}`;
  const dbName = `week${weekNum}Picks`;
  const docRef = await db.collection(dbName).doc(docId).get();
  if (!docRef.exists) return;

  const picks = docRef.data().picks || {};
  Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
    const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
    if (!btnGroup) return;

    const buttons = Array.from(btnGroup.querySelectorAll('button'));
    const matchBtn = buttons.find(b => b.dataset.teamLocation === selectedTeam);

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

// Load games and create buttons with logo, name, and odds
async function loadGames(weekNum, user) {
  const container = document.getElementById('week1games');
  container.innerHTML = '';

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902');
    const data = await res.json();
    const gameSlate = [
      data.events[0], data.events[7], data.events[14], data.events[20], data.events[24], data.events[25],
      data.events[28], data.events[33], data.events[37], data.events[48], data.events[67],
      data.events[72], data.events[81], data.events[84], data.events[86], data.events[88],
      data.events[89], data.events[90]
    ].filter(Boolean);

    gameSlate.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const matchupKey = `${home.location} vs ${away.location}`;
      const homeOdds = comp.odds && comp.odds.length > 0 ? comp.odds[0].details.split(' ')[0] : '';
      const awayOdds = comp.odds && comp.odds.length > 0 ? comp.odds[0].details.split(' ')[2] : '';

      // Row container
      const rowDiv = document.createElement('div');
      rowDiv.className = 'd-flex flex-column mb-3 p-2 bg-dark rounded';

      // Matchup info
      const infoDiv = document.createElement('div');
      infoDiv.className = 'd-flex justify-content-center align-items-center mb-2 text-light';
      infoDiv.style.fontWeight = 'bold';
      infoDiv.innerHTML = `
        <img src="${home.logo}" width="20" height="20" class="me-1" alt="${home.location}">
        ${home.location} vs
        <img src="${away.logo}" width="20" height="20" class="mx-1" alt="${away.location}">
        ${away.location}
      `;

      // Button group
      const btnGroup = document.createElement('div');
      btnGroup.className = 'd-flex justify-content-between gap-2';
      btnGroup.setAttribute('data-matchup', matchupKey);

      const teams = [
        { ...home, odds: homeOdds, isFavorite: homeOdds.startsWith('-') },
        { ...away, odds: awayOdds, isFavorite: awayOdds.startsWith('-') }
      ];

      teams.forEach(team => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.dataset.teamLocation = team.location;

        // Style button
        btn.style.flex = '1';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.padding = '10px';
        btn.style.border = '2px solid white';
        btn.style.borderRadius = '10px';
        btn.style.backgroundColor = adjustColor(team.color || '444444', 40);
        btn.style.color = getContrastYIQ(team.color || '444444');
        btn.style.fontWeight = 'bold';
        btn.style.minHeight = '90px';

        // Button inner HTML
        btn.innerHTML = `
          <img src="${team.logo}" alt="${team.location}" style="width:30px;height:30px;margin-bottom:5px;">
          <span style="font-size:14px;">${team.location}</span>
          <span style="font-size:12px;color:${team.isFavorite ? '#ffd700' : '#ccc'};">${team.odds || ''}</span>
        `;

        btn.onclick = () => {
          btnGroup.querySelectorAll('button').forEach(b => {
            b.classList.remove('active');
            b.style.outline = 'none';
            b.style.boxShadow = 'none';
          });
          btn.classList.add('active');
          btn.style.outline = '2px solid white';
          btn.style.boxShadow = '0 0 10px white';
          userSelections[matchupKey] = btn.dataset.teamLocation;
        };

        btnGroup.appendChild(btn);
      });

      rowDiv.appendChild(infoDiv);
      rowDiv.appendChild(btnGroup);
      container.appendChild(rowDiv);
    });

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

// Sign-out
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

// Auth state detection
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(user);
  }
});

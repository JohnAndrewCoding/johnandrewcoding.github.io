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

// Utility to get contrasting text color
function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#','');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

// Adjust color brightness
function adjustColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let num = parseInt(color,16);
  let r = (num >> 16) + amount; r = Math.min(255, Math.max(0, r));
  let g = ((num >> 8) & 0x00FF) + amount; g = Math.min(255, Math.max(0, g));
  let b = (num & 0x0000FF) + amount; b = Math.min(255, Math.max(0, b));
  return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6,'0');
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
    }).then(()=>alert("Picks saved successfully!"))
      .catch(err=>console.error("Error saving picks:",err));
  });
}

// Load user's previous picks from Firestore
async function loadUserPicks(user, weekNum) {
  const docId = `${user.uid}_week${weekNum}`;
  const dbName = `week${weekNum}Picks`;
  const docRef = await db.collection(dbName).doc(docId).get();
  if (!docRef.exists) return; // No picks saved yet

  const picks = docRef.data().picks || {};
  Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
    const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
    if (!btnGroup) return;
    const matchBtn = Array.from(btnGroup.querySelectorAll('button'))
      .find(b => b.dataset.teamLocation === selectedTeam);
    if (matchBtn) {
      btnGroup.querySelectorAll('button').forEach(b => {
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

// Load games from ESPN API and generate buttons
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

      // Create matchup div with data-matchup
      const matchupDiv = document.createElement('div');
      matchupDiv.className = 'btn-group';          // ✅ Add class
      matchupDiv.dataset.matchup = matchupKey;     // ✅ Add dataset
      matchupDiv.style.display = 'flex';
      matchupDiv.style.flexDirection = 'row';
      matchupDiv.style.justifyContent = 'center';
      matchupDiv.style.alignItems = 'center';
      matchupDiv.style.marginBottom = '15px';
      matchupDiv.style.flexWrap = 'wrap';

      const oddsInfo


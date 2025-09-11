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
  const form = document.getElementById('Week3picksform');
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
  if (!docRef.exists) return; 

  const picks = docRef.data().picks || {};
  Object.entries(picks).forEach(([eventId, pickedTeamId]) => {
    const btnGroup = document.querySelector(`div.btn-group[data-event-id="${eventId}"]`);
    if (!btnGroup) return;
    const matchBtn = Array.from(btnGroup.querySelectorAll('button'))
      .find(b => b.dataset.teamId === pickedTeamId);
    if (matchBtn) {
      btnGroup.querySelectorAll('button').forEach(b => {
        b.classList.remove('active');
        b.style.outline = 'none';
        b.style.boxShadow = 'none';
      });
      matchBtn.classList.add('active');
      matchBtn.style.outline = '2px solid white';
      matchBtn.style.boxShadow = '0 0 10px white';
      userSelections[eventId] = pickedTeamId;
    }
  });
}

// Load games from ESPN API and generate buttons
async function loadGames(weekNum, user) {
  const container = document.getElementById('week3games');
  container.innerHTML = '';

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250911-20250914');
    const data = await res.json();
    const targetEventIds = ["401754531","401756893","401756888","401754623","401761608","401757168","401752705","401752949","401754638","401757256","401757258","401757233","401752700","401754536","401757234","401761607","401752699","401752707","401761604","401752704","401754534","401760368","401752840"];

    // ✅ Filter events by ID
    const gameSlate = data.events.filter(event => targetEventIds.includes(event.id));

    gameSlate.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const kickoffTime = new Date(event.date);

      const matchupDiv = document.createElement('div');
      matchupDiv.className = 'btn-group';
      matchupDiv.dataset.eventId = event.id; // ✅ store eventId
      matchupDiv.style.display = 'flex';
      matchupDiv.style.flexDirection = 'row';
      matchupDiv.style.justifyContent = 'center';
      matchupDiv.style.alignItems = 'center';
      matchupDiv.style.marginBottom = '15px';
      matchupDiv.style.flexWrap = 'wrap';

      const oddsInfo = comp.odds && comp.odds[0];
      let homeFav = false, awayFav = false;
      if (oddsInfo && oddsInfo.homeTeamOdds) {
        homeFav = oddsInfo.homeTeamOdds.favorite;
        awayFav = !homeFav;
      }

      [home, away].forEach((team, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.dataset.teamId = team.id;          // ✅ store teamId
        btn.dataset.teamName = team.displayName;
        btn.dataset.eventId = event.id;

        const bgColor = `#${adjustColor(team.color, 40) || (team === home ? "007bff" : "6c757d")}`;
        btn.style.backgroundColor = bgColor;
        btn.style.color = getContrastYIQ(bgColor);
        btn.style.border = '2px solid white';
        btn.style.borderRadius = '12px';
        btn.style.padding = '0.5rem';
        btn.style.margin = '5px';
        btn.style.minWidth = '140px';
        btn.style.height = '120px';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';
        btn.style.fontWeight = 'bold';

        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.location;
        img.style.maxWidth = '70px';
        img.style.maxHeight = '70px';
        img.style.objectFit = 'contain';
        btn.appendChild(img);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = team.location;
        btn.appendChild(nameSpan);

        const oddsSpan = document.createElement('span');
        if ((team === home && homeFav) || (team === away && awayFav)) {
          oddsSpan.textContent = oddsInfo.details;
          oddsSpan.style.fontSize = '0.85rem';
        }
        btn.appendChild(oddsSpan);

        // Disable pick if kickoff has passed
        if (new Date() >= kickoffTime) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
        } else {
          btn.onclick = () => {
            matchupDiv.querySelectorAll('button').forEach(b => {
              b.classList.remove('active');
              b.style.outline = 'none';
              b.style.boxShadow = 'none';
            });
            btn.classList.add('active');
            btn.style.outline = '2px solid white';
            btn.style.boxShadow = '0 0 10px white';
            userSelections[event.id] = btn.dataset.teamId; // ✅ save as {eventId: teamId}
          };
        }

        matchupDiv.appendChild(btn);

        if (index === 0) {
          const vsSpan = document.createElement('span');
          vsSpan.textContent = 'vs';
          vsSpan.style.margin = '0 10px';
          vsSpan.style.fontWeight = 'bold';
          vsSpan.style.fontSize = '1rem';
          matchupDiv.appendChild(vsSpan);
        }
      });

      container.appendChild(matchupDiv);
    });

    if (user) await loadUserPicks(user, weekNum);

  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

// Initialize picks for logged-in user
function initPicks(user) {
  if (picksInitialized) return;
  picksInitialized = true;
  const weekNum = 3;
  document.getElementById('welcomeMessage').innerText = `${user.displayName}'s Week ${weekNum} Picks`;
  savePicks(user, weekNum);
  loadGames(weekNum, user);
}

// Auth buttons
document.getElementById("googleSignInBtn").onclick = () => auth.signInWithPopup(provider);
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

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(user);
  }
});

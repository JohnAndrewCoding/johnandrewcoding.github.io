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

// Apply global page styles
document.body.style.backgroundColor = '#1c1c1c'; 
document.body.style.color = 'white';
document.body.style.fontFamily = 'Arial, sans-serif';


// Returns 'black' or 'white' depending on background color brightness
function getContrastYIQ(hexcolor){
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}


// Load games + picks (only games that exist in Firestore)
async function loadGamesAndPicks(weekNum) {
  const container = document.getElementById('picksContainer');
  container.innerHTML = '<p>Loading games...</p>';

  try {
    // 1. Get all picks from Firestore
    const picksSnapshot = await db.collection(`week${weekNum}Picks`).get();
    const allPicks = {};
    const gamesInDB = new Set(); // track matchups in DB

    picksSnapshot.forEach(doc => {
      const { picks, name } = doc.data();
      for (const [matchup, teamPick] of Object.entries(picks)) {
        if (!allPicks[matchup]) allPicks[matchup] = [];
        allPicks[matchup].push({ name, pick: teamPick });
        gamesInDB.add(matchup);
      }
    });

    if (gamesInDB.size === 0) {
      container.innerHTML = '<p>No games/picks available.</p>';
      return;
    }

    // 2. Fetch ESPN scoreboard data
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902');
    const data = await res.json();
    const games = data.events;

    container.innerHTML = ''; // clear loading message

    // 3. Render only games in Firestore
    games.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0];
      const away = comp.competitors[1];
      const matchupKey = `${home.team.location} vs ${away.team.location}`;

      if (!gamesInDB.has(matchupKey)) return; // skip games not in DB

      const status = event.status.type.description;
      const scoreHome = home.score || '0';
      const scoreAway = away.score || '0';
      const startTime = new Date(event.date).toLocaleString();

      // Game container
      const gameDiv = document.createElement('div');
      gameDiv.className = 'game-block mb-4 p-3 border rounded';
      gameDiv.style.backgroundColor = '#d3d3d3'; // dark green for each game
      gameDiv.style.backgroundColor = '#2a2a2a'; // dark green for each game
      gameDiv.style.color = 'white';

      // Game header
      gameDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <img src="${home.team.logo}" width="25" height="25" class="me-1"> ${home.team.location} (${scoreHome})
            vs
            ${away.team.location} (${scoreAway}) <img src="${away.team.logo}" width="25" height="25" class="ms-1">
          </div>
          <small>${status} | ${startTime}</small>
        </div>
      `;

      // Picks
      const picksDiv = document.createElement('div');
      picksDiv.className = 'picks-list ps-3';
      const picksForGame = allPicks[matchupKey] || [];

      if (picksForGame.length === 0) {
        picksDiv.innerHTML = '<p>No picks yet for this game.</p>';
      } else {
        picksForGame.forEach(userPick => {
          const p = document.createElement('p');
          p.textContent = `${userPick.name} → ${userPick.pick}`;
          picksDiv.appendChild(p);
        });
      }

      gameDiv.appendChild(picksDiv);
      container.appendChild(gameDiv);
    });

  } catch (err) {
    console.error('Error loading games/picks:', err);
    container.innerHTML = '<p>Error loading data. Check console.</p>';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const weekNum = 1;
  loadGamesAndPicks(weekNum);

  // Refresh every 30 seconds
  setInterval(() => loadGamesAndPicks(weekNum), 30000);
});

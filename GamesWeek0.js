// Firebase (v9 compat version)
// Make sure you also load Firebase SDKs in your HTML before this script
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
window.db = db;
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Utility function to get query param (e.g., ?name=Andrew)
// ... your existing firebase config and initialization ...

// Utility function to get query param (e.g., ?name=Andrew)
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const userSelections = {};

// Function to save picks to Firestore
function savePicks(userName, weekNum) {
  document.getElementById('Week0picksform').addEventListener('submit', async function (e) {
    e.preventDefault();

    const docId = `${userName}_week${weekNum}`; // e.g. "Andrew_week0"
    const dbName = `week${weekNum}Picks`;

    db.collection(dbName)
      .doc(docId)
      .set({
        name: userName,
        week: weekNum,
        picks: userSelections,
        timestamp: new Date()
      })
      .then(() => {
        alert("Picks saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving document: ", error);
        alert("Failed to save picks.");
      });
  });
}

// New function: Load existing picks from Firestore and auto-select buttons
async function loadUserPicks(userName, weekNum) {
  try {
    const docId = `${userName}_week${weekNum}`;
    const dbName = `week${weekNum}Picks`;
    const docRef = await db.collection(dbName).doc(docId).get();

    if (!docRef.exists) {
      console.log("No saved picks found for", userName);
      return;
    }

    const savedData = docRef.data();
    const picks = savedData.picks || {};

    // For each saved pick, find the correct button and "click" it or set active
    Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
      // Find the button group for the matchup
      const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
      if (!btnGroup) return; // safety check

      const buttons = btnGroup.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent.trim() === selectedTeam) {
          // Clear active state on all buttons in group
          buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.outline = 'none';
            btn.style.boxShadow = 'none';
          });
          // Set active styles on the saved pick button
          button.classList.add('active');
          button.style.outline = '2px solid white';
          button.style.boxShadow = '0 0 10px white';

          // Also update the global userSelections to keep in sync
          userSelections[matchupKey] = selectedTeam;
        }
      });
    });

  } catch (error) {
    console.error("Error loading picks:", error);
  }
}

// Fetch ESPN API for Week 0 games
fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250823')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  })
  .then(async data => {
    console.log(data);
    //odds
    console.log(data.events[2].competitions[0].odds[0].details);
    //date in weird format
    console.log(data.events[2].competitions[0].date);
    // boolean nuetral site
    console.log(data.events[2].competitions[0].neutralSite);
    // stadium
    console.log(data.events[2].competitions[0].venue.fullName);
    //scoreboard
    console.log(data.events[2].competitions[0].status);
    // channel
    console.log(data.events[2].competitions[0].broadcast);
    const form = document.getElementById('Week0picksform');

    data.events.forEach(event => {
      const competition = event.competitions[0];
      const home = competition.competitors[0].team;
      const away = competition.competitors[1].team;

      const homeTeamName = home.location;
      const awayTeamName = away.location;
      const homeTeamColor = home.color || "007bff"; // fallback blue, no #
      const awayTeamColor = away.color || "6c757d"; // fallback gray, no #

      const matchupKey = `${homeTeamName} vs ${awayTeamName}`;

      // Game label (with team logos)
      const gameLabel = document.createElement('p');

      const homeImg = document.createElement('img');
      homeImg.src = home.logo;
      homeImg.width = 25;
      homeImg.height = 25;

      const awayImg = document.createElement('img');
      awayImg.src = away.logo;
      awayImg.width = 25;
      awayImg.height = 25;

      gameLabel.appendChild(homeImg);
      gameLabel.appendChild(document.createTextNode(` ${homeTeamName} vs. `));
      gameLabel.appendChild(awayImg);
      gameLabel.appendChild(document.createTextNode(` ${awayTeamName}`));
      try{
      const odds = document.createTextNode(`  ${event.competitions[0].odds[0].details}`);
      gameLabel.appendChild(odds);
      }
      catch {

      }
      // Button group with matchup data attribute for easy querying later
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group mb-3';
      btnGroup.setAttribute('role', 'group');
      btnGroup.setAttribute('aria-label', 'Game picks');
      btnGroup.setAttribute('data-matchup', matchupKey);

      // Options buttons
      [homeTeamName, awayTeamName].forEach(teamName => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary';
        button.textContent = teamName;
        button.style.backgroundColor = `#${teamName === homeTeamName ? homeTeamColor : awayTeamColor}`;
        button.style.color = 'white';

        button.onclick = () => {
          // Remove 'active' from other buttons in this group
          btnGroup.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.outline = 'none';
            btn.style.boxShadow = 'none';
          });

          // Add styles to selected button
          button.classList.add('active');
          button.style.outline = '2px solid white';
          button.style.boxShadow = '0 0 10px white';

          // Save selection
          userSelections[matchupKey] = teamName;
          console.log(`Selected for ${matchupKey}: ${teamName}`);
        };

        btnGroup.appendChild(button);
      });

      // Add elements to the form
      form.appendChild(gameLabel);
      form.appendChild(btnGroup);
    });

    const userName = getQueryParam('name');
    const weekNum = 0;

    if (userName) {
      document.getElementById('welcomeMessage').innerText = `${userName}'s Week 0 Picks`;
      savePicks(userName, weekNum);
      await loadUserPicks(userName, weekNum); // <-- load saved picks & mark buttons
    }
  })
  .catch(error => {
    console.error("Failed to fetch games:", error);
  });


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

// Utility function to get query param (e.g., ?name=Andrew)
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Global selections object
const userSelections = {};

// Function to save picks to Firestore
function savePicks(userName, weekNum) {
  document.getElementById('Week0picksform').addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      const docRef = await db.collection("weekPicks").add({
        name: userName,
        week: weekNum,
        picks: userSelections,
        timestamp: new Date()
      });

      alert("Picks saved successfully! Document ID: " + docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save picks.");
    }
  });
}

// Fetch ESPN API for Week 0 games
fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250823')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    const form = document.getElementById('Week0picksform');

    data.events.forEach(event => {
      const competition = event.competitions[0];
      const home = competition.competitors[0].team;
      const away = competition.competitors[1].team;

      const homeTeamName = home.location;
      const awayTeamName = away.location;
      const homeTeamColor = home.color || "#007bff"; // fallback blue
      const awayTeamColor = away.color || "#6c757d"; // fallback gray

      const matchupKey = `${homeTeamName}_vs_${awayTeamName}`;

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

      // Button group
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group mb-3';
      btnGroup.setAttribute('role', 'group');
      btnGroup.setAttribute('aria-label', 'Game picks');

      // Options
      [homeTeamName, awayTeamName].forEach(teamName => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary';
        button.textContent = teamName;
        button.style.backgroundColor = teamName === homeTeamName ? `#${homeTeamColor}` : `#${awayTeamColor}`;
        button.style.color = 'white';

        button.onclick = () => {
          // Remove 'active' from other buttons
          // Remove styles from all buttons in this group
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

      // Add to form
      form.appendChild(gameLabel);
      form.appendChild(btnGroup);
    });

    // Handle user & form submit
    const userName = getQueryParam('name');
    const weekNum = 0;

    if (userName) {
      document.getElementById('welcomeMessage').innerText = `${userName}'s Week 0 Picks`;
      savePicks(userName, weekNum);
    }
  })
  .catch(error => {
    console.error("Failed to fetch games:", error);
  });

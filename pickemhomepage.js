
  // Firebase Config
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

  // === CONFIG ===
  const weekNum = 1;
  const picksCollection = `week${weekNum}Picks`;
  const recordsCollection = 'userRecords';
  const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902';

  // -------------------------
  // Fetch ESPN results
  // -------------------------
  async function getGameResults() {
    const res = await fetch(apiUrl);
    const data = await res.json();

    // Pull only relevant games
    const gameIndexes = [0, 7, 14, 20, 24, 25, 28, 33, 37, 48, 67, 72, 81, 84, 86, 88, 89, 90];
    const gameSlate = gameIndexes
      .map(i => data.events[i])
      .filter(Boolean);

    const results = {};
    gameSlate.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0];
      const away = comp.competitors[1];

      const homeTeam = home.team.location;
      const awayTeam = away.team.location;
      const matchupKey = `${homeTeam} vs ${awayTeam}`;

      const homeScore = parseInt(home.score, 10);
      const awayScore = parseInt(away.score, 10);
      const winner = homeScore > awayScore ? homeTeam : awayTeam;

      results[matchupKey] = winner;
    });

    return results;
  }

  // -------------------------
  // Update user records
  // -------------------------
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

    console.log("User records updated!");
  }

  // -------------------------
  // Render leaderboard
  // -------------------------
  async function renderLeaderboard() {
    const tableBody = document.querySelector('#leaderboard tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Update first (so leaderboard is fresh)
    await updateUserRecords();

    // Now fetch leaderboard
    const leaderboardSnapshot = await db.collection(recordsCollection)
      .orderBy('wins', 'desc')
      .orderBy('losses', 'asc')
      .get();

    let rank = 1;
    leaderboardSnapshot.forEach(doc => {
      const { name = 'Anonymous', wins = 0, losses = 0 } = doc.data();

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${rank}</td>
        <td>${name}</td>
        <td>${wins}-${losses}</td>
      `;
      tableBody.appendChild(row);

      rank++;
    });
  }

  // Run on load
  window.addEventListener('DOMContentLoaded', renderLeaderboard);



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

document.body.style.backgroundColor = "#1c1c1c";

// Utilities
function adjustColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let num = parseInt(color, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

// Save picks
function savePicks(user, weekNum) {
  const form = document.getElementById("Week1picksform");
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = `${user.uid}_week${weekNum}`;
    const dbName = `week${weekNum}Picks`;
    db.collection(dbName)
      .doc(docId)
      .set({
        uid: user.uid,
        name: user.displayName,
        week: weekNum,
        picks: userSelections,
        timestamp: new Date(),
      })
      .then(() => alert("Picks saved successfully!"))
      .catch((err) => console.error("Error saving picks:", err));
  });
}

// Load previous picks
async function loadUserPicks(user, weekNum) {
  const docId = `${user.uid}_week${weekNum}`;
  const dbName = `week${weekNum}Picks`;
  const docRef = await db.collection(dbName).doc(docId).get();
  if (!docRef.exists) return;

  const picks = docRef.data().picks || {};
  Object.entries(picks).forEach(([matchupKey, selectedTeam]) => {
    const btnGroup = document.querySelector(`div.btn-group[data-matchup="${matchupKey}"]`);
    if (!btnGroup) return;

    const matchBtn = Array.from(btnGroup.querySelectorAll("button")).find(
      (b) => b.dataset.teamLocation === selectedTeam
    );
    if (matchBtn) {
      btnGroup.querySelectorAll("button").forEach((b) => {
        b.classList.remove("active");
        b.style.outline = "none";
        b.style.boxShadow = "none";
      });
      matchBtn.classList.add("active");
      matchBtn.style.outline = "2px solid white";
      matchBtn.style.boxShadow = "0 0 10px white";
      userSelections[matchupKey] = selectedTeam;
    }
  });
}

// Load games
async function loadGames(weekNum, user) {
  const container = document.getElementById("week1games");
  container.innerHTML = "";

  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902"
    );
    const data = await res.json();

    const gameSlate = [
      data.events[0], data.events[7], data.events[14], data.events[20], data.events[24],
      data.events[25], data.events[28], data.events[33], data.events[37], data.events[48],
      data.events[67], data.events[72], data.events[81], data.events[84], data.events[86],
      data.events[88], data.events[89], data.events[90]
    ].filter(Boolean);

    gameSlate.forEach((event) => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const matchupKey = `${home.location} vs ${away.location}`;

      // Button group
      const btnGroup = document.createElement("div");
      btnGroup.className = "btn-group";
      btnGroup.setAttribute("role", "group");
      btnGroup.setAttribute("data-matchup", matchupKey);
      btnGroup.style.display = "flex";
      btnGroup.style.justifyContent = "center";
      btnGroup.style.marginBottom = "1rem";
      btnGroup.style.gap = "0.5rem";

      [home, away].forEach((team) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn";
        btn.dataset.teamLocation = team.location;

        // Button styles
        const bgColor = `#${adjustColor(team.color, 40)}`;
        btn.style.backgroundColor = bgColor;
        btn.style.color = getContrastYIQ(bgColor);
        btn.style.border = "2px solid white";
        btn.style.borderRadius = "12px";
        btn.style.padding = "0.5rem";
        btn.style.width = "140px";
        btn.style.height = "120px";
        btn.style.display = "flex";
        btn.style.flexDirection = "column";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "0.85rem";

        // Logo
        const img = document.createElement("img");
        img.src = team.logo;
        img.alt = team.location;
        img.style.maxWidth = "50%";
        img.style.maxHeight = "50%";
        img.style.objectFit = "contain";
        btn.appendChild(img);

        // Team name
        const nameDiv = document.createElement("div");
        nameDiv.textContent = team.location;
        btn.appendChild(nameDiv);

        // Odds
        const oddsDiv = document.createElement("div");
        if (comp.odds && comp.odds.length > 0) {
          const oddsText = comp.odds[0].details || "";
          if (oddsText.includes("-") && team === home) {
            oddsDiv.textContent = oddsText;
          }
        }
        oddsDiv.style.fontSize = "0.75rem";
        btn.appendChild(oddsDiv);

        btn.onclick = () => {
          btnGroup.querySelectorAll("button").forEach((b) => {
            b.classList.remove("active");
            b.style.outline = "none";
            b.style.boxShadow = "none";
          });
          btn.classList.add("active");
          btn.style.outline = "2px solid white";
          btn.style.boxShadow = "0 0 10px white";
          userSelections[matchupKey] = btn.dataset.teamLocation;
        };

        btnGroup.appendChild(btn);
      });

      container.appendChild(btnGroup);
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
  document.getElementById("welcomeMessage").innerText = `${user.displayName}'s Week ${weekNum} Picks`;
  savePicks(user, weekNum);
  loadGames(weekNum, user);
}

// Sign-in/out
document.getElementById("googleSignInBtn").onclick = () => auth.signInWithPopup(provider);

document.getElementById("googleSignOutBtn").onclick = () => {
  auth.signOut().then(() => {
    currentUser = null;
    picksInitialized = false;
    document.getElementById("authStatus").innerText = "Not signed in";
    document.getElementById("googleSignInBtn").style.display = "inline-block";
    document.getElementById("googleSignOutBtn").style.display = "none";
    document.getElementById("week1games").innerHTML = "";
    document.getElementById("welcomeMessage").innerText = "";
  });
};

// Detect auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user.uid;
    document.getElementById("authStatus").innerText = `Signed in as ${user.displayName}`;
    document.getElementById("googleSignInBtn").style.display = "none";
    document.getElementById("googleSignOutBtn").style.display = "inline-block";
    initPicks(user);
  }
});



  const firebaseConfig = {
  apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU",
  authDomain: "college-football-pickem-68eed.firebaseapp.com",
  projectId: "college-football-pickem-68eed",
  storageBucket: "college-football-pickem-68eed.appspot.com",
  messagingSenderId: "650202039805",
  appId: "1:650202039805:web:70e51177aab22e4d614594"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  const provider = new firebase.auth.GoogleAuthProvider();

  const signInBtn = document.getElementById("googleSignInBtn");
  const statusSpan = document.getElementById("authStatus");

  signInBtn.addEventListener("click", () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        statusSpan.innerText = `Signed in as ${user.displayName}`;
      })
      .catch(console.error);
  });

  // Automatically detect if user is already signed in
  auth.onAuthStateChanged(user => {
    if (user) {
      statusSpan.innerText = `Signed in as ${user.displayName}`;
    } else {
      statusSpan.innerText = `Not signed in`;
    }
  });

function goToUserPage(userName) {
  window.location.href = 'GamesWeek0.html?name=' + encodeURIComponent(userName);
}


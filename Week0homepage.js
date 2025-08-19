  const firebaseConfig = {
    // your config
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


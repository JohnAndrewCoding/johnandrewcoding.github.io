
/*
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCcBLA5xSQ_J1tg0zNkiZmC3Xfg3-SAo4",
  authDomain: "college-pickem-9acde.firebaseapp.com",
  databaseURL: "https://college-pickem-9acde-default-rtdb.firebaseio.com",
  projectId: "college-pickem-9acde",
  storageBucket: "college-pickem-9acde.firebasestorage.app",
  messagingSenderId: "872525753600",
  appId: "1:872525753600:web:8e878058eead8a4c1bd7e5",
  measurementId: "G-50QRGBXTPE"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function Get(yourUrl){
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET",yourUrl,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

<script type="module" src="collegepickem.mjs"></script>

const picksRef = ref(database, `users`);
var name = "";
onValue(picksRef, (snapshot) => {
const userData = snapshot.val();
}, (error) => {
  console.error('Error reading data:', error);
});


function submitPicks(){
  const gamesForm = document.getElementById("gamesForm");
  const user = localStorage.getItem("user");
  const userRef = ref(database, `users/${user}`);


  set(userRef, {
    name: getUserRef(user),
    picks: {
      week14: getFormData()
    }
  })
    .then(() => {
      console.log('User data updated successfully!');
    })
    .catch((error) => {
      console.error('Error updating user data:', error);
    });
}
document.getElementById("submitBtn").addEventListener("click",submitPicks);
*/


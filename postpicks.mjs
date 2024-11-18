// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, set, onValue, get, child} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// Read user data
const userRef = ref(database, `users`);
const picksRef = ref(database, `users/user1/picks/week13`);


function postAllPicks(userData){
   for(let j =0; j<4; j++){
    var picksString = '';
    for(let i = 0; i<userData[`user${j+1}`]['picks']['week13'].length; i++){
        picksString += `<br> ${userData[`user${j+1}`]['picks']['week13'][i]}`;
    }
    document.getElementById(`postPicks${userData[`user${j+1}`]['name']}`).innerHTML = picksString;
}
}

onValue(userRef, (snapshot) => {
  const userData = snapshot.val();
  postAllPicks(userData);
  console.log(postAllPicks(userData));
}, (error) => {
  console.error('Error reading data:', error);
});




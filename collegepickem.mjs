
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

// Define initial data
const initialData = {
  users: {
    user1: {
      name: 'Blayne Butler',
      age: [5, 6, 7, 8],
      city: 'Tifton'
    }
  }
};

// Write initial data to the database
set(ref(database), initialData)
  .then(() => {
    console.log('Data written successfully!');
  })
  .catch((error) => {
    console.error('Error writing data:', error);
  });

// Read user data
const userRef = ref(database, 'users/user1');

onValue(userRef, (snapshot) => {
  const userData = snapshot.val();
  console.log('User Data:', userData);
}, (error) => {
  console.error('Error reading data:', error);
});

document.getElementById("header").innerHTML = "We in there";


  
  
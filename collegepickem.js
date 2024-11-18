// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
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

const initialData = {
  users: {
    user1: {
      name: 'Blayne Butler',
      age: [5,6,7,8],
      city: 'Tifton'
    },
    user2: {
      name: 'Jane Smith',
      age: 25,
      city: 'Los Angeles'
    }
  },
  products: {
    product1: {
      name: 'Laptop',
      price: 1200
    },
    product2: {
      name: 'Smartphone',
      price: 800
    }
  }
};

set(ref(database), initialData)
  .then(() => {
    console.log('Data written successfully!');
  })
  .catch((error) => {
    console.error('Error writing data:', error);
  });

  // ... (Your Firebase initialization code)

// Get a reference to the user's dat
const userInputsRef = ref(database, 'users/user1');


onValue(userInputsRef, (snapshot) => {
  const userData = snapshot.val();
  console.log('User Data:', userData);
}, (error) => {
  console.error('Error reading data:', error);
});




  
  
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkSlyFKQNHYQgLa_dQuzjYSzXSISoCWKU",
  authDomain: "college-football-pickem-68eed.firebaseapp.com",
  projectId: "college-football-pickem-68eed",
  storageBucket: "college-football-pickem-68eed.firebasestorage.app",
  messagingSenderId: "650202039805",
  appId: "1:650202039805:web:70e51177aab22e4d614594"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/*db.collection('userInfo').add({
    user: 'Andrew',
    team: 'Texas',
    age:25
}); */


    //newnew

const options = ['Texas', 'Ohio State'];

  // Get container where buttons will be placed
  const container = document.getElementById('buttonContainer');

  // Create Bootstrap button group div
  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';
  btnGroup.setAttribute('role', 'group');
  btnGroup.setAttribute('aria-label', 'Toggle buttons');

  // Create and append buttons
  options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary';
    button.textContent = option;

    // Add click event listener
    button.onclick = function () {
      // Remove active class from all buttons
      const allButtons = btnGroup.querySelectorAll('button');
      allButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to the clicked one
      button.classList.add('active');

      // Log or use the selected value
      console.log('Selected:', button.textContent);
    };

    btnGroup.appendChild(button);
  });

  // Append the entire button group to the container
  container.appendChild(btnGroup);
  




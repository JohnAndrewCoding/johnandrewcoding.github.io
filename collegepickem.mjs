
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


function Get(yourUrl){
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET",yourUrl,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}
let espnUrl = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20241119-20241123";

var scoreboard = JSON.parse(Get(espnUrl));
console.log(scoreboard);
const para = document.createElement("p");
for(let i = 0; i < scoreboard['events'].length; i++){
let homeTeam = scoreboard['events'][i]['competitions'][0]['competitors'][0]['team']['location'];
let awayTeam = scoreboard['events'][i]['competitions'][0]['competitors'][1]['team']['location'];

var select = document.createElement("select");
var gameName = document.createElement("p");

const awayImg = document.createElement("img");
awayImg.src = scoreboard['events'][i]['competitions'][0]['competitors'][1]['team']['logo'];
awayImg.height = 50;
awayImg.width = 50;
gameName.appendChild(awayImg);
gameName.append(awayTeam + " @ ");

const homeImg = document.createElement("img");
homeImg.src = scoreboard['events'][i]['competitions'][0]['competitors'][0]['team']['logo'];
homeImg.height = 50;
homeImg.width = 50;
gameName.appendChild(homeImg)
gameName.append(homeTeam);



var option1 = document.createElement("option");
option1.value = "undecided";
option1.text = "undecided";
select.appendChild(option1);

var option2 = document.createElement("option");
option2.value = homeTeam;
option2.text = homeTeam;
select.appendChild(option2);


var option3 = document.createElement("option");
option3.value = awayTeam;
option3.text = awayTeam;
select.appendChild(option3);

var container = document.getElementById("gameslate");
var linebreak1 = document.createElement("br");
var linebreak2 = document.createElement("br");
container.append(gameName);
select.name = `game${i+1}`;
console.log(select.name);
container.appendChild(select);
container.append(linebreak1);
container.append(linebreak2);


}
function getFormData() {
const gamesForm = document.getElementById("gamesForm");
const picks = []
const user = gamesForm.elements["pickers"].value;
for(let i = 0; i < scoreboard['events'].length; i++){
picks.push(gamesForm.querySelectorAll("select")[i].value);
}
localStorage.setItem('picks', JSON.stringify(picks));
localStorage.setItem('picker', user);
console.log("it worked");
console.log(picks[0]);
location.href = "PostPicks.html";
}


  
  
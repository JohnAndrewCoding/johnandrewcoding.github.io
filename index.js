function Get(yourUrl){
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET",yourUrl,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}



let espnUrl = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20241126-20241130";
var scoreboard = JSON.parse(Get(espnUrl));

for(let i = 0; i < scoreboard['events'].length; i++){
let homeTeam = scoreboard['events'][i]['competitions'][0]['competitors'][0]['team']['location'];
let awayTeam = scoreboard['events'][i]['competitions'][0]['competitors'][1]['team']['location'];
let gameString = `${homeTeam} vs ${awayTeam}`;
const li = document.createElement("li");
li.textContent = gameString;
const newsList = document.getElementById("news-list");
newsList.appendChild(li);
document.getElementById("news-ticker").appendChild(newsList);

}


function checkTicker() {
  const ticker = document.getElementById('news-ticker').querySelector('ul');
  const firstItem = ticker.querySelector('li:first-child');

  if (firstItem.offsetWidth + firstItem.offsetLeft < ticker.offsetWidth) {
    const clone = firstItem.cloneNode(true);
    ticker.appendChild(clone);
  }

}
//}
// Check the ticker on window load and resize
window.addEventListener('load', checkTicker);
window.addEventListener('resize', checkTicker);


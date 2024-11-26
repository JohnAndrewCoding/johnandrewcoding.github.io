// Check if the ticker is fully visible, if not, clone the first item and append it to the end of the list
function checkTicker() {
  const ticker = document.getElementById('news-ticker').querySelector('ul');
  const firstItem = ticker.querySelector('li:first-child');

  if (firstItem.offsetWidth + firstItem.offsetLeft < ticker.offsetWidth) {
    const clone = firstItem.cloneNode(true);
    ticker.appendChild(clone);
  }

}

function Get(yourUrl){
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET",yourUrl,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

function sportsGames(){

}
// Check the ticker on window load and resize
window.addEventListener('load', checkTicker);
window.addEventListener('resize', checkTicker);

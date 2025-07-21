

fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250823') //eplace with your API endpoint
  .then(response => {
    // Check if the request was successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Parse the JSON response
    return response.json();
  })
  .then(data => {
    // Handle the retrieved data
    for(let i = 0; i < data.events.length; i ++) {
    const homeTeam = data.events[i].competitions[0].competitors[0].team.location;
    const versus = " vs. ";
    const awayTeam = data.events[i].competitions[0].competitors[1].team.location;

    const picksTable = document.getElementById("Week0pickstable");

const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  const gameName = homeTeam + versus + awayTeam;
  nameCell.textContent = gameName ;

  row.appendChild(nameCell);
      for (let j = 0; j<4; j++){
        const gameSelection = document.createElement('td');
        const selection = "Not Selected";
        gameSelection.textContent = selection;
        row.appendChild(gameSelection);
      }


document.querySelector('#Week0pickstable tbody').appendChild(row);


    }
    console.log(data);
  })
  .catch(error => {
    // Handle any errors during the fetch operation
    console.error('Error fetching data:', error);
  });

function goToUserPage(userName) {
  window.location.href = 'GamesWeek0.html?name=' + encodeURIComponent(userName);
}


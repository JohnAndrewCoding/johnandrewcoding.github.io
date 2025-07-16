fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250829') // Replace with your API endpoint
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
    var pickemStr = "";
    for(let i = 0; i < data.events.length; i ++) {
    pickemStr += data.events[i].name + "<br>";

    const homeTeam = document.createTextNode(data.events[i].competitions[0].competitors[0].team.location);
    const versus = document.createTextNode(" vs. ");
    const awayTeam = document.createTextNode(data.events[i].competitions[0].competitors[1].team.location);
    
    const homeImg = document.createElement('img');
    homeImg.src = data.events[i].competitions[0].competitors[0].team.logo;
    homeImg.width = 25;
    homeImg.height = 25;
    //homeImg.alt = homeTeamName;

    
      
    const awayImg = document.createElement('img');
    awayImg.src = data.events[i].competitions[0].competitors[1].team.logo;
    awayImg.width = 25;
    awayImg.height = 25;
    //homeImg.alt = homeTeamName;
    
    const gameName = document.createElement('p');
    
    gameName.appendChild(homeImg);
    gameName.appendChild(homeTeam);
    gameName.appendChild(versus);
    gameName.appendChild(awayImg);
    gameName.appendChild(awayTeam);
    
    document.getElementById("week0games").appendChild(gameName);
    const linebreak = document.createElement('br');
    document.getElementById("content").appendChild(linebreak);
    }
    console.log(data);
  })
  .catch(error => {
    // Handle any errors during the fetch operation
    console.error('Error fetching data:', error);
  });

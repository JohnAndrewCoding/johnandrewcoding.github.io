fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250823') // Replace with your APIendpoint
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
    }
    console.log(data);

    const options = ['Texas', 'Ohio State'];

  // Get container where buttons will be placed
  const container = document.getElementById('week0games');

  // Create Bootstrap button group div
  const btnGroup = document.createElement('div');
  //name of game
  btnGroup.className = 'btn-group';
  btnGroup.setAttribute('role', 'group');
  btnGroup.setAttribute('aria-label', 'Toggle buttons');

  // Create and append buttons
  options.forEach(option => {
    //add an image to the buttons
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
  })
  .catch(error => {
    // Handle any errors during the fetch operation
    console.error('Error fetching data:', error);
  });


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
    pickemStr += data.events[i] + "<br>";
    }
    document.getElementById("content").innerHTML = pickemStr;
    console.log(data);
  })
  .catch(error => {
    // Handle any errors during the fetch operation
    console.error('Error fetching data:', error);
  });

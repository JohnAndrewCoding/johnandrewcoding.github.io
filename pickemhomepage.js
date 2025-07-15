
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
    alert(datadata['events'][0]['competitions'][0]['status']['type']['detail']);
    console.log(data);
  })
  .catch(error => {
    // Handle any errors during the fetch operation
    console.error('Error fetching data:', error);
  });

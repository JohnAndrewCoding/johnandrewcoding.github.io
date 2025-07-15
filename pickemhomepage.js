
const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250829';


// Make a GET request
fetch(apiUrl)
  .then(response => {
    // Check if the network response was successful
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Parse the JSON data from the response
    return response.json();
  })
  .then(data => {
    
     alert(data['events'][47]['competitions'][0]['status']['type']['detail']);
    alert("[alert]-=-==-");
    // Handle the retrieved data
    console.log(data);
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch operation
    console.error('Error:', error);
  });

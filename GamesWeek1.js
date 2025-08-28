async function loadGames(weekNum, user) {
  const container = document.getElementById('week1games');
  container.innerHTML = '';

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250827-20250902');
    const data = await res.json();
    const gameSlate = [
      data.events[0], data.events[7], data.events[14], data.events[20], data.events[24], data.events[25],
      data.events[28], data.events[33], data.events[37], data.events[48], data.events[67],
      data.events[72], data.events[81], data.events[84], data.events[86], data.events[88],
      data.events[89], data.events[90]
    ].filter(Boolean);

    gameSlate.forEach(event => {
      const comp = event.competitions[0];
      const home = comp.competitors[0].team;
      const away = comp.competitors[1].team;
      const matchupKey = `${home.location} vs ${away.location}`;
      const kickoffTime = new Date(event.date); // ✅ Parse kickoff

      const matchupDiv = document.createElement('div');
      matchupDiv.className = 'btn-group';
      matchupDiv.dataset.matchup = matchupKey;
      matchupDiv.style.display = 'flex';
      matchupDiv.style.flexDirection = 'row';
      matchupDiv.style.justifyContent = 'center';
      matchupDiv.style.alignItems = 'center';
      matchupDiv.style.marginBottom = '15px';
      matchupDiv.style.flexWrap = 'wrap';

      const oddsInfo = comp.odds && comp.odds[0];
      let homeFav = false, awayFav = false;
      if (oddsInfo && oddsInfo.homeTeamOdds) {
        homeFav = oddsInfo.homeTeamOdds.favorite;
        awayFav = !homeFav;
      }

      [home, away].forEach((team, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.dataset.teamLocation = team.location;

        const bgColor = `#${adjustColor(team.color, 40) || (team === home ? "007bff" : "6c757d")}`;
        btn.style.backgroundColor = bgColor;
        btn.style.color = getContrastYIQ(bgColor);
        btn.style.border = '2px solid white';
        btn.style.borderRadius = '12px';
        btn.style.padding = '0.5rem';
        btn.style.margin = '5px';
        btn.style.minWidth = '140px';
        btn.style.height = '120px';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';
        btn.style.fontWeight = 'bold';

        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.location;
        img.style.maxWidth = '70px';
        img.style.maxHeight = '70px';
        img.style.objectFit = 'contain';
        btn.appendChild(img);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = team.location;
        btn.appendChild(nameSpan);

        const oddsSpan = document.createElement('span');
        if ((team === home && homeFav) || (team === away && awayFav)) {
          oddsSpan.textContent = oddsInfo.details;
          oddsSpan.style.fontSize = '0.85rem';
        }
        btn.appendChild(oddsSpan);

        // Disable pick if kickoff has passed
        if (new Date() >= kickoffTime) {
          btn.disabled = true;
          btn.style.opacity = '0.5'; // visually indicate disabled
        } else {
          btn.onclick = () => {
            matchupDiv.querySelectorAll('button').forEach(b => {
              b.classList.remove('active');
              b.style.outline = 'none';
              b.style.boxShadow = 'none';
            });
            btn.classList.add('active');
            btn.style.outline = '2px solid white';
            btn.style.boxShadow = '0 0 10px white';
            userSelections[matchupKey] = btn.dataset.teamLocation;
          };
        }

        matchupDiv.appendChild(btn);

        if (index === 0) {
          const vsSpan = document.createElement('span');
          vsSpan.textContent = 'vs';
          vsSpan.style.margin = '0 10px';
          vsSpan.style.fontWeight = 'bold';
          vsSpan.style.fontSize = '1rem';
          matchupDiv.appendChild(vsSpan);
        }
      });

      container.appendChild(matchupDiv);
    });

    if (user) await loadUserPicks(user, weekNum);

  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

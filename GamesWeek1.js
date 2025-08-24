[home, away].forEach(team => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-outline-light';
  btn.textContent = team.location;

  const bgColor = `#${team.color || (team === home ? "007bff" : "6c757d")}`;
  btn.style.backgroundColor = bgColor;
  btn.style.color = getContrastYIQ(bgColor); // ensures readable font

  btn.onclick = () => {
    btnGroup.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
      b.style.outline = 'none';
      b.style.boxShadow = 'none';
    });
    btn.classList.add('active');
    btn.style.outline = '2px solid white';
    btn.style.boxShadow = '0 0 10px white';
    userSelections[matchupKey] = team.location;
  };

  btnGroup.appendChild(btn);
});

// Display odds (if available)
const oddsText = comp.odds && comp.odds.length > 0 ? comp.odds[0].details : 'N/A';
const oddsDiv = document.createElement('div');
oddsDiv.className = 'mt-1';
oddsDiv.style.fontSize = '0.9rem';
oddsDiv.textContent = `Odds: ${oddsText}`;
rowDiv.appendChild(oddsDiv);


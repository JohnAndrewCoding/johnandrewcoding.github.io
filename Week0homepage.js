const picksTable = document.getElementById("Week0pickstable");

const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.textContent = "Ohio State";

  const oppCell = document.createElement('td');
  oppCell.textContent = "Penn State";

  row.appendChild(nameCell);
  row.appendChild(oppCell);


document.querySelector('#Week0pickstable tbody').appendChild(row);
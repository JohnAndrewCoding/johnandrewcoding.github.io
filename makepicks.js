const select = document.createElement("select");

  const option1 = document.createElement("option");
  option1.value = "value1";
  option1.text = "Option 1";
  select.appendChild(option1);

  const option2 = document.createElement("option");
  option2.value = "value2";
  option2.text = "Option 2";
  select.appendChild(option2);

  const container = document.getElementById("gameslate");
  container.appendChild(select);
alert("JavaScript is working!");

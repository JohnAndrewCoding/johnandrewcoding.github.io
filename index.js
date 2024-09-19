async function launch(params) {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxXIeYLGNAhJhZFfY_PggFSmSfQ9C79BuhSeAgxu75lvUyoaAfmNDjvYO6cZxfqUSeb-w/exec");

    const { data } = await res.json();
    document.getElementById("pickerHeader").innerHTML= data[0].picker;
    document.getElementById("game 1").innerHTML= data[0].game1;
    document.getElementById("game 2").innerHTML= data[0].game2;
    document.getElementById("game 3").innerHTML= data[0].game3;
    document.getElementById("game 4").innerHTML= data[0].game4;

    document.getElementById("picker1").innerHTML= data[1].picker;
    document.getElementById("wk0picker1game1").innerHTML= data[1].game1;
    document.getElementById("wk0picker1game2").innerHTML= data[1].game2;
    document.getElementById("wk0picker1game3").innerHTML= data[1].game3;
    document.getElementById("wk0picker1game4").innerHTML= data[1].game4;

    document.getElementById("picker2").innerHTML= data[2].picker;
    document.getElementById("wk0picker2game1").innerHTML= data[2].game1;
    document.getElementById("wk0picker2game2").innerHTML= data[2].game2;
    document.getElementById("wk0picker2game3").innerHTML= data[2].game3;
    document.getElementById("wk0picker2game4").innerHTML= data[2].game4;

    document.getElementById("picker3").innerHTML= data[3].picker;
    document.getElementById("wk0picker3game1").innerHTML= data[3].game1;
    document.getElementById("wk0picker3game2").innerHTML= data[3].game2;
    document.getElementById("wk0picker3game3").innerHTML= data[3].game3;
    document.getElementById("wk0picker3game4").innerHTML= data[3].game4; 

    document.getElementById("picker4").innerHTML= data[4].picker;
    document.getElementById("wk0picker4game1").innerHTML= data[4].game1;
    document.getElementById("wk0picker4game2").innerHTML= data[4].game2;
    document.getElementById("wk0picker4game3").innerHTML= data[4].game3;
    document.getElementById("wk0picker4game4").innerHTML= data[4].game4;
}
launch();



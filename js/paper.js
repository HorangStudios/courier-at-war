function createPaper(text) {
    let paperElem = document.createElement("div");
    paperElem.innerHTML = text;
    paperElem.id = "paper";

    document.getElementById("drawer").appendChild(paperElem);
    $(paperElem).draggable();
}

createPaper("MISSION: 67<br>LOCATION: FRANKLIN'S HOME<br><br>You must defend franklin's home");
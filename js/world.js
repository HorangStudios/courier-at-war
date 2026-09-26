var map = [
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []]
];

var currentPlayerPosition = { r: 0, c: 0 };

function addEnemies() {
    map.flat().forEach(element => {
        if (Math.random() > 0.5) element.push("MVSVH");
    });
}; addEnemies();

function terrain() {
    var canvas = document.getElementById("terrain");
    var ctx = canvas.getContext("2d");
    var noise = new THREE.ImprovedNoise();
    var terrainSize = 1024;

    for (var x = 0; x < terrainSize; x++) {
        for (var y = 0; y < terrainSize; y++) {
            ctx.fillStyle = noise.noise(x / 100, y / 100, 0) > 0.005 ? "darkgreen" : "green";
            ctx.fillRect(x, y, 1, 1);
        }
    }
}; terrain();

(function () {
    const layer = document.getElementById("map-layer");
    const terminal = document.getElementById("travel-terminal");
    const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    map.forEach((row, r) => {
        row.forEach((cell, c) => {
            const p = document.createElement("div");
            p.className = "map-point";
            p.style.left = ((c + 0.5) / row.length * 100) + "%";
            p.style.top = ((r + 0.5) / map.length * 100) + "%";
            const label = (rows[r] || r) + (c + 1);
            p.setAttribute("data-label", label);
            
            if (r === currentPlayerPosition.r && c === currentPlayerPosition.c) {
                p.classList.add("selected");
            }
            
            p.addEventListener("click", () => {
                if (r === currentPlayerPosition.r && c === currentPlayerPosition.c) return;

                const distance = Math.abs(r - currentPlayerPosition.r) + Math.abs(c - currentPlayerPosition.c);
                const eta = Math.min(distance * 10, 120);

                terminal.style.display = "block";
                terminal.innerHTML = `
                    <p>PorOS Heavy Industries copyright 1947</p>
                    <p>Travel request detected | Travel plan: ${(rows[currentPlayerPosition.r] || currentPlayerPosition.r) + (currentPlayerPosition.c + 1)} -> ${label} | ETA: ${eta}s</p>
                    <p>Confirm? [y/n]</p>
                    <p id="terminal-text">> </p>
                `;
                
                const textElement = document.getElementById("terminal-text");

                window.addEventListener("keyup", (e) => {
                    if (e.key === "Y" || e.key === "y") {
                        currentPlayerPosition = { r, c };
                        textElement.innerHTML = `> y`;
                        setTimeout(() => { terminal.innerHTML = `<p>Travelling to ${label}...</p>`; isShaking = true; }, 500);
                        document.querySelectorAll(".map-point").forEach(el => el.classList.remove("selected"));
                        p.classList.add("selected");
                        setTimeout(() => { terminal.style.display = "none"; }, 2500);
                        setTimeout(() => { isShaking = false; }, 3000);
                    } else if (e.key === "n" || e.key === "N") {
                        textElement.innerHTML = `> n`;
                        setTimeout(() => { terminal.innerHTML = `<p>Travel plan rejected.</p>`; }, 500);
                        setTimeout(() => { terminal.style.display = "none"; }, 1500);
                    }
                });
            });

            layer.appendChild(p);
        });
    });
})();
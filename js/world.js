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
    const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    map.forEach((row, r) => {
        row.forEach((cell, c) => {
            const p = document.createElement("div");
            p.className = "map-point";
            p.style.left = ((c + 0.5) / row.length * 100) + "%";
            p.style.top = ((r + 0.5) / map.length * 100) + "%";
            p.setAttribute("data-label", (rows[r] || r) + (c + 1));
            layer.appendChild(p);
        });
    });
})();
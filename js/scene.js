const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xcccccc, 0.001);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000000);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1e90ff);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

camera.position.x = -40.21;
camera.position.y = 4;
camera.position.z = -43.41;
camera.rotation.y = Math.PI / 2;
camera.fov = 90;
camera.updateProjectionMatrix();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, -50);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(-39.21, 7, -45.41);
dirLight.shadow.mapSize.set(256, 256);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = - 50;
dirLight.shadow.camera.near = 0.001;
dirLight.shadow.camera.far = 100000;
dirLight.shadow.radius = 0;
scene.add(dirLight);

const light = new THREE.AmbientLight(0x404040, 1);
scene.add(light);

const controls = new THREE.PointerLockControls(camera, renderer.domElement);
THREE.Cache.enabled = true;

//----------------------------------------------------------------------------------------------------------------------------

const loadingManager = new THREE.LoadingManager();
const mtlLoader = new THREE.MTLLoader(loadingManager);

mtlLoader.load('assets/map/map.mtl', function (materials) {
    materials.preload();

    const objLoader = new THREE.OBJLoader(loadingManager);
    objLoader.setMaterials(materials);
    objLoader.load('assets/map/map.obj', function (obj) {
        obj.traverse(function (node) {
            if (!node.isMesh) return;
            node.material.side = THREE.DoubleSide;
            node.material.dithering = true;
            node.castShadow = true;
            node.receiveShadow = true;

            if (node.name == "Part2003") {
                //window
                node.material.transparent = true;
                node.material = new THREE.MeshPhysicalMaterial({
                    metalness: .9,
                    roughness: .05,
                    envMapIntensity: 0.9,
                    clearcoat: 1,
                    transparent: true,
                    transmission: .95,
                    opacity: .5,
                    reflectivity: 0.2,
                    refractionRatio: 0.985,
                    ior: 0.9,
                    side: THREE.DoubleSide,
                });
                setTimeout(() => document.getElementById("gameloader").style.display = "none", 1000);
            } else if (node.name == "Union3") {
                node.visible = false;
            } else if (node.name == "Part1599") {
                //lamp
                node.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                node.material.needsUpdate = true;
            } else if (node.name == "Part1614") {
                node.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
                node.material.needsUpdate = true;
            } else {
                //default
                node.material.transparent = false;
            }
        });

        scene.add(obj);
        obj.castShadow = true;
        obj.receiveShadow = true;
    });
});

//----------------------------------------------------------------------------------------------------------------------------

const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

var outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.pulsePeriod = 2;
composer.addPass(outlinePass);

var pixelPass = new THREE.ShaderPass(THREE.PixelShader);
pixelPass.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
pixelPass.uniforms["resolution"].value.multiplyScalar(window.devicePixelRatio);
pixelPass.uniforms["pixelSize"].value = 2;
composer.addPass(pixelPass);

var dither = new THREE.ShaderPass(OrderedDitherShader);
dither.uniforms['scale'].value = 1;
//composer.addPass(dither);

var gamma_correction = new THREE.ShaderPass(THREE.GammaCorrectionShader);
composer.addPass(gamma_correction);

//----------------------------------------------------------------------------------------------------------------------------

var crosshair = document.getElementById("crosshair");
var computer = document.getElementById("computer");
var drawer = document.getElementById("drawer");
var radio = document.getElementById("radio");

function onWindowResize(windowresize = false) {
    var splitcanvas = renderer.domElement.clientHeight / window.innerHeight;

    camera.aspect = window.innerWidth / (window.innerHeight * splitcanvas);
    camera.fov = splitcanvas * 90;
    camera.updateProjectionMatrix();

    if (!windowresize) return;
    renderer.setSize(window.innerWidth, (window.innerHeight * splitcanvas));
    composer.setSize(window.innerWidth, (window.innerHeight * splitcanvas));
}; window.addEventListener('resize', () => { onWindowResize(true) }, false);

function animate() {
    if (renderer.domElement.style.display != "none") renderer.render(scene, camera);
    if (controls.isLocked) {
        renderer.domElement.style.filter = "";
    } else {
        renderer.domElement.style.filter = "grayscale(1)";
        crosshair.innerHTML = "<span>Click anywhere to resume game</span>";
    };
    
    onWindowResize();
    requestAnimationFrame(animate);
}; animate();

//----------------------------------------------------------------------------------------------------------------------------

function transition(renderer, element) {
    if (controls.isLocked) controls.unlock();
    element.style.height = "70vh";
    crosshair.style.display = "none";

    renderer.domElement.style.height = "30vh";
    renderer.domElement.style.animation = "";
}

function revertToPointer() {
    Object.values(document.getElementsByClassName("split")).forEach(e => { e.style.height = '0vh' });
    crosshair.style.display = "block";
    crosshair.innerHTML = "";

    renderer.domElement.style.height = "100vh";
    setTimeout(() => controls.lock(), 100);
}

async function select(hover) {
    var found = false;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length == 0) return;

    intersects.forEach(async (item, i) => {
        if (found || item.object.name == 'Union3') return;
        switch (item.object.name) {
            case "Part1614":
                if (hover) crosshair.innerHTML = "<span>[LMB] Use Computer</span>";
                else transition(renderer, computer);
                break;
            case "Filecabinet11":
                if (hover) crosshair.innerHTML = "<span>[LMB] Read Documents</span>";
                else transition(renderer, drawer);
                break;
            case "Phone1":
                if (hover) crosshair.innerHTML = "<span>[LMB] Call in strike</span>";
                else transition(renderer, radio);
                break;
            default:
                crosshair.innerHTML = `<span>${item.object.name}</span>`;
                outlinePass.selectedObjects = [item.object];
                break;
        }; found = true;
    })
}

document.addEventListener('keyup', (event) => { if (event.key == 'Escape') revertToPointer() });
renderer.domElement.addEventListener('mousemove', () => { if (controls.isLocked) select(true) });
renderer.domElement.addEventListener('pointerup', () => {
    if (controls.isLocked) select(false);
    else revertToPointer();
});
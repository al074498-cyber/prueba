// Tigrillo Bridge - Engine & UI Controller

let scene, camera, renderer, controls;
let bridgeGroup;
let analysisChart;

document.addEventListener("DOMContentLoaded", () => {
    init3D();
    initChart();
    setupEventListeners();
    renderBridgeModel();
});

// Initialize Three.js 3D Viewport
function init3D() {
    const container = document.getElementById("canvas3d");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11111b);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(40, 30, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights & Grid
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(200, 50, 0x45475a, 0x313244);
    scene.add(gridHelper);

    bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    window.addEventListener("resize", onWindowResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById("canvas3d");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Render Bridge Structure Geometry
function renderBridgeModel() {
    while(bridgeGroup.children.length > 0){ 
        bridgeGroup.remove(bridgeGroup.children[0]); 
    }

    const spans = parseInt(document.getElementById("num-spans").value);
    const spanLength = parseFloat(document.getElementById("span-length").value);
    const totalLength = spans * spanLength;

    // Deck Geometry
    const deckGeo = new THREE.BoxGeometry(totalLength, 1.2, 10);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x89b4fa, roughness: 0.4 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 10, 0);
    bridgeGroup.add(deck);

    // Piers (Pilas y Estribos)
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x6c7086 });
    for (let i = 0; i <= spans; i++) {
        const xPos = -totalLength / 2 + i * spanLength;
        const pierGeo = new THREE.CylinderGeometry(1.5, 1.5, 10, 16);
        const pier = new THREE.Mesh(pierGeo, pierMat);
        pier.position.set(xPos, 5, 0);
        bridgeGroup.add(pier);
    }
}

// Chart.js Envelopes & Influence Lines
function initChart() {
    const ctx = document.getElementById("analysisChart").getContext("2d");
    analysisChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: Array.from({length: 61}, (_, i) => (i * 1.0).toFixed(1)),
            datasets: [
                {
                    label: "Envolvente Momento Máx (kN·m)",
                    data: generateEnvelopeData(true),
                    borderColor: "#a6e3a1",
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: "Envolvente Momento Mín (kN·m)",
                    data: generateEnvelopeData(false),
                    borderColor: "#f38ba8",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#cdd6f4" } }
            },
            scales: {
                x: { grid: { color: "#313244" }, ticks: { color: "#a6adc8" } },
                y: { grid: { color: "#313244" }, ticks: { color: "#a6adc8" } }
            }
        }
    });
}

function generateEnvelopeData(isMax) {
    const points = 61;
    let data = [];
    for (let i = 0; i < points; i++) {
        let x = i / (points - 1);
        let val = isMax ? Math.sin(x * Math.PI * 2) * 1200 + 300 : -Math.sin(x * Math.PI * 2) * 800 - 150;
        data.push(val);
    }
    return data;
}

function setupEventListeners() {
    document.getElementById("num-spans").addEventListener("change", () => {
        renderBridgeModel();
        updateAnalysis();
    });
    document.getElementById("span-length").addEventListener("change", () => {
        renderBridgeModel();
        updateAnalysis();
    });
    document.getElementById("btn-run").addEventListener("click", updateAnalysis);
}

function updateAnalysis() {
    analysisChart.data.datasets[0].data = generateEnvelopeData(true);
    analysisChart.data.datasets[1].data = generateEnvelopeData(false);
    analysisChart.update();
}

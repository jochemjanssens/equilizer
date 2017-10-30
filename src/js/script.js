let analyzer;
const elements = 1024;
let audio;

const init = () => {
  setupEquilizer();
  createScene();
  createLights();
  createEquilizer();
};

const setupEquilizer = () => {
  audio = document.querySelector(`audio`);
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();

  const sourceNode = audioCtx.createMediaElementSource(audio);
  sourceNode.connect(analyzer);
  sourceNode.connect(audioCtx.destination);
};

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, HEIGHT, WIDTH;
const createScene = () => {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
  );

  camera.position.set(0, 100, 200);

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.querySelector(`.visual`);
  container.appendChild(renderer.domElement);
};

let hemisphereLight, shadowLight, ambientLight;
const createLights = () => {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

	// A directional light shines from a specific direction.
	// It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light
  shadowLight.position.set(150, 350, 350);

	// Allow shadow casting
  shadowLight.castShadow = true;

	// define the visible area of the projected shadow
  shadowLight.shadow.camera.left = - 400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = - 400;
  shadowLight.shadow.camera.near = 100;
  shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better,
	// but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

	// to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
};

//const minX = - 100;
//const maxX = 100;
//const minY = 0;
//const maxY = 200;

let xCounter = 0;
let yCounter = 0;

const bars = [];

const createEquilizer = () => {
  let bar;
  for (let i = 0;i < elements;i ++) {
    if (xCounter < 32) {
      xCounter ++;
    } else {
      xCounter = 0;
      yCounter ++;
    }
    bar = new Bar();
    bar.mesh.position.x = - 100 + ((200 / 32) * xCounter);
    bar.mesh.position.y = (200 / 32) * yCounter;
    bar.mesh.position.z = - 100;
    scene.add(bar.mesh);
    bars.push(bar);
  }
  renderFrame();
};

class Bar {
  constructor() {
    this.mesh = new THREE.Object3D();

    const geomBox = new THREE.BoxGeometry(2, 2, 2);
    const matBox = new THREE.MeshPhongMaterial({color: 0x00ff00});
    const box = new THREE.Mesh(geomBox, matBox);
    box.castShadow = true;
    box.receiveShadow = true;
    this.mesh.add(box);
  }
}

const renderFrame = () => {
  const data = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(data);

  renderer.render(scene, camera);
  for (let i = 0;i < data.length;i ++) {
    bars[i].mesh.position.z = - 100 + (data[i] / 2);
  }
  requestAnimationFrame(renderFrame);
};

init();

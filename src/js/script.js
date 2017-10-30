let analyzer;
const svgns = `http://www.w3.org/2000/svg`;
const elements = 1024;
let audio;

const init = () => {
  setupEquilizer();
};

const setupEquilizer = () => {
  audio = new Audio();
  audio.controls = true;
  audio.src = `../assets/audio/ultralife.mp3`;
  audio.addEventListener(`playing`, renderFrame);
  document.body.appendChild(audio);

  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();

  const sourceNode = audioCtx.createMediaElementSource(audio);
  sourceNode.connect(analyzer);
  sourceNode.connect(audioCtx.destination);

  createEquilizer();
  renderFrame();
};

const createEquilizer = () => {
  const $svg = document.querySelector(`.equilizer`);
  const width = $svg.getAttribute(`width`);
  const height = $svg.getAttribute(`height`);

  for (let i = 0;i < elements;i ++) {
    const rect = document.createElementNS(svgns, `rect`);
    rect.setAttributeNS(null, `x`, (width / elements) * i);
    rect.setAttributeNS(null, `y`, height);
    rect.setAttributeNS(null, `height`, 0);
    rect.setAttributeNS(null, `width`, (width / elements));
    rect.setAttributeNS(null, `fill`, `#000`);
    rect.classList.add(`item${i}`);
    $svg.appendChild(rect);
  }
};

const renderFrame = () => {
  const data = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(data);

  const $svg = document.querySelector(`.equilizer`);
  const height = $svg.getAttribute(`height`);

  for (let i = 0;i < elements;i ++) {
    const $item = $svg.querySelector(`.item${i}`);
    const itemData = data[i];
    $item.setAttribute(`height`, itemData);
    $item.setAttribute(`y`, height - itemData);
  }

  if (!audio.paused) {
    requestAnimationFrame(renderFrame);
  }
};



init();

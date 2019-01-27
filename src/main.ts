import { mat4, vec4 } from 'gl-matrix';
import { Camera } from './camera';
import { Input } from './input';
import { Renderer, ModelBuffer } from './renderer';

// @ts-ignore: parcel json import
import cubeJson5 from './models/cube.json5';

const models = {
  cube: cubeJson5,
};

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let camera: Camera;
let input: Input;
let renderer: Renderer;
let modelBuffers: {
  [key: string]: ModelBuffer[];
};

function main() {
  function initModels() {
    modelBuffers = {};

    // Pre-process models into GL attrib array
    for (const k in models) {
      const faces = models[k];
      modelBuffers[k] = [];

      for (const f in faces) {
        const faceVerts = new Float32Array(faces[f]);
        const buf = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

        modelBuffers[k].push({
          vertCount: faceVerts.length / 3,
          glBuffer: buf,
        });
      }
    }
  }

  function initRendering() {
    // Generate canvas DOM element
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.width = 1000;
    canvas.height = 600;

    // Extract GL context
    gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    renderer = new Renderer(gl, canvas.width, canvas.height);
    renderer.init();
  }

  let lastTimeSample = Date.now();
  let firstLoop = true;

  function gameLoop() {
    requestAnimationFrame(gameLoop);

    const currentTime = Date.now();
    let delta = (currentTime - lastTimeSample) / 1000; // use seconds
    if (firstLoop) {
      delta = 0;
    }

    camera.simulate(delta);
    renderer.update(camera.transform.mat, modelBuffers.cube);

    firstLoop = false;
    lastTimeSample = currentTime;
  }

  initRendering();
  initModels();

  input = new Input();
  input.init();

  camera = new Camera(input);
  camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

  gameLoop();
}

main();

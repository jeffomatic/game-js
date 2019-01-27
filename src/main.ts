import { mat4, vec4 } from 'gl-matrix';
import { Camera } from './camera';
import { Input } from './input';
import { Renderer, ModelBuffer } from './renderer';

// @ts-ignore: parcel json import
import cubeJson5 from './models/cube.json5';

const models = {
  cube: cubeJson5,
};

class Game {
  camera: Camera;
  renderer: Renderer;
  modelBuffers: {
    [key: string]: ModelBuffer[];
  };
}

declare global {
  interface Window {
    game: Game;
  }
}

const game = new Game();
window.game = game;

function main() {
  function initModels() {}

  function initRendering() {
    // Generate canvas DOM element
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.width = 1000;
    canvas.height = 600;

    // Extract GL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    game.renderer = new Renderer(gl, canvas.width, canvas.height);
    game.renderer.init();

    game.modelBuffers = {};

    // Pre-process models into GL attrib array
    for (const k in models) {
      const faces = models[k];
      game.modelBuffers[k] = [];

      for (const f in faces) {
        const faceVerts = new Float32Array(faces[f]);
        const buf = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

        game.modelBuffers[k].push({
          vertCount: faceVerts.length / 3,
          glBuffer: buf,
        });
      }
    }
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

    game.camera.simulate(delta);
    game.renderer.update(game.camera.transform.mat, game.modelBuffers.cube);

    firstLoop = false;
    lastTimeSample = currentTime;
  }

  initRendering();

  const input = new Input();
  input.init();

  game.camera = new Camera(input);
  game.camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

  gameLoop();
}

main();

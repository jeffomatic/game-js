import { mat4, vec4 } from 'gl-matrix';
import { Camera } from './camera';
import { Input } from './input';
import { Renderer, BufferedFace } from './renderer';

// @ts-ignore: parcel json import
import cubeJson5 from './models/cube.json5';
import { Transform } from './transform';

const models = {
  cube: cubeJson5,
};

class Game {
  camera: Camera;
  renderer: Renderer;
  bufferedModels: {
    [key: string]: BufferedFace[];
  };
}

declare global {
  interface Window {
    game: Game;
  }
}

function initRendering(game: Game) {
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

  game.bufferedModels = {};

  // Pre-process models into GL attrib array
  for (const k in models) {
    const faces = models[k];
    game.bufferedModels[k] = [];

    for (const f in faces) {
      const faceVerts = new Float32Array(faces[f]);
      const buf = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

      game.bufferedModels[k].push({
        vertCount: faceVerts.length / 3,
        glBuffer: buf,
      });
    }
  }
}

function main() {
  const game = new Game();
  window.game = game; // expose game to devtools console

  let lastTimeSample = Date.now();
  let firstLoop = true;

  const mat4Identity = mat4.create();
  mat4.identity(mat4Identity);

  initRendering(game);

  const entities = [];
  for (let i = 0; i < 3; i += 1) {
    const t = new Transform();
    t.setTranslate(vec4.fromValues(i * 1.5, 0, 0, 0));
    t.update();

    entities.push({
      transform: t,
      model: game.bufferedModels.cube,
    });
  }

  const input = new Input();
  input.init();

  game.camera = new Camera(input);
  game.camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

  function gameLoop() {
    requestAnimationFrame(gameLoop);

    const currentTime = Date.now();
    let delta = (currentTime - lastTimeSample) / 1000; // use seconds
    if (firstLoop) {
      delta = 0;
    }

    game.camera.simulate(delta);

    const renderables = entities.map((e) => {
      return { worldModel: e.transform.mat, faces: e.model };
    });
    game.renderer.render(game.camera.transform.mat, renderables);

    firstLoop = false;
    lastTimeSample = currentTime;
  }

  gameLoop();
}

main();

import { vec2 } from 'gl-matrix';
import { Game } from './game';
import { Keyboard } from './keyboard';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
if (!gl) {
  throw new Error('Could not initialize WebGL 2.0.');
}

const game = new Game(gl, new Keyboard());

let lastTimeSample = Date.now();
let firstLoop = true;

function syncViewportSize() {
  const size = vec2.fromValues(window.innerWidth, window.innerHeight);
  canvas.width = size[0];
  canvas.height = size[1];
  game.renderer.resizeCanvas(size);
}

syncViewportSize();
window.addEventListener('resize', syncViewportSize);

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const currentTime = Date.now();
  let delta = (currentTime - lastTimeSample) / 1000; // use seconds
  lastTimeSample = currentTime;

  if (firstLoop) {
    delta = 0;
    firstLoop = false;
  }

  game.update(delta);
}

gameLoop();

// expose game to devtools console
declare global {
  interface Window {
    game: Game;
  }
}

window.game = game;

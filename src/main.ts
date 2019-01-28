import { Game } from './game';
import { Input } from './input';

declare global {
  interface Window {
    game: Game;
  }
}

// Generate canvas DOM element
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const game = new Game(canvas, new Input());
window.game = game; // expose game to devtools console

let lastTimeSample = Date.now();
let firstLoop = true;

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const currentTime = Date.now();
  let delta = (currentTime - lastTimeSample) / 1000; // use seconds
  if (firstLoop) {
    delta = 0;
  }

  game.update(delta);

  firstLoop = false;
  lastTimeSample = currentTime;
}

gameLoop();

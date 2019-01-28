import { vec3 } from 'gl-matrix';
import { Keyboard } from '../keyboard';
import { Renderer } from '../renderer';
import { IGame } from './interface';
import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';
import { WorldTransformSystem } from '../systems/world_transform/impl';
import { CharacterSystem } from '../systems/character/impl';
import { IFirstPersonWasdSystem } from '../systems/first_person_wasd/interface';
import { FirstPersonWasdSystem } from '../systems/first_person_wasd/impl';

// @ts-ignore: parcel json import
import cubeJson5 from '../models/cube.json5';

export class Game implements IGame {
  canvas: HTMLCanvasElement;
  keyboard: Keyboard;
  renderer: Renderer;

  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;
  firstPersonWasd: IFirstPersonWasdSystem;

  constructor(canvas: HTMLCanvasElement, keyboard: Keyboard) {
    this.canvas = canvas;
    this.keyboard = keyboard;

    canvas.width = 1000;
    canvas.height = 600;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    this.renderer = new Renderer(gl, canvas.width, canvas.height);
    this.renderer.addModel('cube', cubeJson5);

    this.worldTransforms = new WorldTransformSystem();
    this.characters = new CharacterSystem(this);
    this.firstPersonWasd = new FirstPersonWasdSystem(this);

    // Setup entities

    for (let i = 0; i < 3; i += 1) {
      const id = `cube${i}`;

      const wt = this.worldTransforms.create(id);
      wt.setTranslate(vec3.fromValues(i * 1.5, 0, 0));

      this.characters.create(id, 'cube');
    }

    const camTransform = this.worldTransforms.create('camera');
    camTransform.setTranslate(vec3.fromValues(0, 0, 4));
    this.firstPersonWasd.create('camera');
  }

  update(delta: number): void {
    this.firstPersonWasd.update(delta);

    this.renderer.render(
      this.worldTransforms.get('camera').getMatrix(),
      this.characters.getRenderables(),
    );
  }
}

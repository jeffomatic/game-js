import { vec3, vec4 } from 'gl-matrix';
import { Camera } from '../camera';
import { Input } from '../input';
import { Renderer } from '../renderer';
import { IGame } from './interface';
import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';

// @ts-ignore: parcel json import
import cubeJson5 from '../models/cube.json5';
import { WorldTransformSystem } from '../systems/world_transform/impl';
import { CharacterSystem } from '../systems/character/impl';

export class Game implements IGame {
  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;

  canvas: HTMLCanvasElement;
  camera: Camera;
  input: Input;
  renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, input: Input) {
    this.canvas = canvas;
    this.input = input;

    canvas.width = 1000;
    canvas.height = 600;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    this.renderer = new Renderer(gl, canvas.width, canvas.height);
    this.renderer.addModel('cube', cubeJson5);

    this.camera = new Camera(input);
    this.camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

    this.worldTransforms = new WorldTransformSystem();
    this.characters = new CharacterSystem(this);

    for (let i = 0; i < 3; i += 1) {
      const id = `cube${i}`;

      const wt = this.worldTransforms.create(id);
      wt.setTranslate(vec3.fromValues(i * 1.5, 0, 0));

      this.characters.create(id, 'cube');
    }
  }

  update(delta: number): void {
    this.camera.simulate(delta);
    this.renderer.render(
      this.camera.transform.mat,
      this.characters.getRenderables(),
    );
  }
}

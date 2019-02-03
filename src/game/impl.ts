import _ from 'lodash';
import { vec3, quat } from 'gl-matrix';
import { Keyboard } from '../keyboard';
import { Renderer } from '../renderer';
import { IGame } from './interface';
import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';
import { WorldTransformSystem } from '../systems/world_transform/impl';
import { CharacterSystem } from '../systems/character/impl';
import { ScriptSystem } from '../systems/script/impl';

// @ts-ignore: parcel json import
import cubeJson5 from '../models/cube.json5';
import { scripts } from '../scripts';

export class Game implements IGame {
  canvas: HTMLCanvasElement;
  keyboard: Keyboard;
  renderer: Renderer;

  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;
  scripts: ScriptSystem;

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
    this.scripts = new ScriptSystem(this);

    // Setup entities
    _.range(3).forEach((i) => {
      const id = `cube${i}`;

      const wt = this.worldTransforms.create(id);
      wt.setTranslate(vec3.fromValues(i * 1.5, 0, 0));

      this.characters.create(id, 'cube');

      this.scripts.create(id, (id: string, game: IGame, delta: number) => {
        const transform = game.worldTransforms.get(id);
        const rot = quat.create();
        quat.rotateX(rot, transform.getRotation(), (Math.PI / 100) * (i + 1));
        transform.setRotation(rot);
      });
    });

    const camTransform = this.worldTransforms.create('camera');
    camTransform.setTranslate(vec3.fromValues(0, 0, 4));
    this.scripts.create('camera', scripts.camera_control);
  }

  update(delta: number): void {
    this.scripts.update(delta);

    this.renderer.render(
      this.worldTransforms.get('camera').getMatrix(),
      this.characters.getRenderables(),
    );
  }
}

import _ from 'lodash'; // tslint:disable-line
import { vec3, quat } from 'gl-matrix';

import { Keyboard } from '../keyboard';
import { Renderer } from '../renderer';
import { IGame } from './interface';

import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';
import { WorldTransformSystem } from '../systems/world_transform';
import { CharacterSystem } from '../systems/character';
import { ScriptSystem } from '../systems/script';

import { models } from '../models';
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
    this.renderer.addModel('cube', models.cube);

    this.worldTransforms = new WorldTransformSystem();
    this.characters = new CharacterSystem(this);
    this.scripts = new ScriptSystem(this);

    // Setup entities
    _.range(3).forEach((i) => {
      const id = `cube${i}`;

      const wt = this.worldTransforms.create(id);
      wt.setTranslate(vec3.fromValues(i * 1.5, 0, 0));

      this.characters.create(id, 'cube');

      this.scripts.create(
        id,
        scripts.create_x_rotation((Math.PI / 20) * (i + 1)),
      );
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

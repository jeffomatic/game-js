import _ from 'lodash'; // tslint:disable-line
import { vec3 } from 'gl-matrix';

import { Keyboard } from '../keyboard';
import { Renderer } from '../renderer';
import { IGame } from './interface';

import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';
import { WorldTransformSystem } from '../systems/world_transform';
import { CharacterSystem } from '../systems/character';
import { ScriptSystem } from '../systems/script';

import { meshes } from '../meshes';
import { scripts } from '../scripts';

export class Game implements IGame {
  canvas: HTMLCanvasElement;
  keyboard: Keyboard;
  renderer: Renderer;

  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;
  scripts: ScriptSystem;

  constructor(gl: WebGLRenderingContext, keyboard: Keyboard) {
    this.keyboard = keyboard;

    this.renderer = new Renderer(gl);
    this.renderer.addMesh('cube', meshes.cube);

    this.worldTransforms = new WorldTransformSystem();
    this.characters = new CharacterSystem(this);
    this.scripts = new ScriptSystem(this);

    // Setup entities
    _.range(3).forEach((i) => {
      const id = `cube${i}`;

      const wt = this.worldTransforms.create(id);
      this.characters.create(id, 'cube');

      this.scripts.append(
        id,
        scripts.create_spin(vec3.fromValues(1, 0, 0), (1 + i) / 2),
      );

      this.scripts.append(
        id,
        scripts.create_revolve({
          center: vec3.fromValues(i * 1.5, 0, 0),
          start: vec3.fromValues(i * 1.5, 3, 0),
          axis: vec3.fromValues(1, 0, 0),
          period: (1 + i) / 2,
        }),
      );
    });

    const camTransform = this.worldTransforms.create('camera');
    camTransform.setTranslate(vec3.fromValues(0, 0, 7));
    this.scripts.append('camera', scripts.camera_control);
  }

  update(delta: number): void {
    this.scripts.update(delta);

    this.renderer.render(
      this.worldTransforms.get('camera').getMatrix(),
      this.characters.getRenderables(),
    );
  }
}

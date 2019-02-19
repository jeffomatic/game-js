import _ from 'lodash'; // tslint:disable-line
import { vec3 } from 'gl-matrix';

import { Keyboard } from '../keyboard';
import { Renderer } from '../renderer';
import { IGame } from './interface';

import { meshes } from '../meshes';
import { ComponentManager, Character, Transform } from '../components';
import * as scripts from '../scripts';
import { CharacterSystem, ScriptSystem } from '../systems';

export class Game implements IGame {
  canvas: HTMLCanvasElement;
  keyboard: Keyboard;
  renderer: Renderer;

  components: ComponentManager;

  constructor(gl: WebGL2RenderingContext, keyboard: Keyboard) {
    this.keyboard = keyboard;

    this.renderer = new Renderer(gl);
    this.renderer.addMesh('cube', meshes.cube);
    this.renderer.addMesh('dodecahedron', meshes.dodecahedron);

    this.components = new ComponentManager();

    // Setup entities
    _.range(50).forEach(i => {
      const id = `entity${i}`;

      const c = new Character(i % 2 === 0 ? 'cube' : 'dodecahedron');
      this.components.characters.add(id, c);

      const t = new Transform();
      this.components.transforms.add(id, t);

      const period = (0.1 * i + 1) * 2;

      const script = new scripts.Compose();
      script.add(new scripts.Spin(vec3.fromValues(1, 0, 0), period / 2));
      script.add(
        new scripts.Revolve({
          period,
          center: vec3.fromValues(i * 1.5, 0, 0),
          start: vec3.fromValues(i * 1.5, 3, 0),
          axis: vec3.fromValues(1, 0, 0),
        }),
      );
      this.components.scripts.add(id, script);
    });

    const camTransform = new Transform();
    this.components.transforms.add('camera', camTransform);
    camTransform.setTranslate(vec3.fromValues(0, 0, 7));

    this.components.scripts.add('camera', new scripts.CameraControl());
  }

  update(delta: number): void {
    ScriptSystem.update(this, delta);

    this.renderer.render(
      this.components.transforms.get('camera').getMatrix(),
      CharacterSystem.getRenderables(this),
    );
  }
}

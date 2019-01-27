import { vec4 } from 'gl-matrix';
import { Camera } from './camera';
import { Input } from './input';
import { Renderer, BufferedFace } from './renderer';
import { Transform } from './transform';

// @ts-ignore: parcel json import
import cubeJson5 from './models/cube.json5';

const models = {
  cube: cubeJson5,
};

interface Entity {
  transform: Transform;
  model: string;
}

export class Game {
  canvas: HTMLCanvasElement;
  camera: Camera;
  input: Input;
  entities: Entity[];
  renderer: Renderer;
  bufferedModels: {
    [key: string]: BufferedFace[];
  };

  constructor(canvas: HTMLCanvasElement, input: Input) {
    this.canvas = canvas;
    this.input = input;

    canvas.width = 1000;
    canvas.height = 600;

    // Extract GL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    this.renderer = new Renderer(gl, canvas.width, canvas.height);
    this.renderer.init();

    this.bufferedModels = {};

    // Pre-process models into GL attrib array
    for (const k in models) {
      const faces = models[k];
      this.bufferedModels[k] = [];

      for (const f in faces) {
        const faceVerts = new Float32Array(faces[f]);
        const buf = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

        this.bufferedModels[k].push({
          vertCount: faceVerts.length / 3,
          glBuffer: buf,
        });
      }
    }

    this.camera = new Camera(input);
    this.camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

    this.entities = [];
    for (let i = 0; i < 3; i += 1) {
      const t = new Transform();
      t.setTranslate(vec4.fromValues(i * 1.5, 0, 0, 0));
      t.update();

      this.entities.push({
        transform: t,
        model: 'cube',
      });
    }
  }

  update(delta: number): void {
    this.camera.simulate(delta);

    const renderables = this.entities.map((e) => {
      return {
        worldModel: e.transform.mat,
        faces: this.bufferedModels[e.model],
      };
    });
    this.renderer.render(this.camera.transform.mat, renderables);
  }
}

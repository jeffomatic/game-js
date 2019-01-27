import { mat4, vec4 } from 'gl-matrix';
import { Camera } from './camera';
import { Input } from './input';

// @ts-ignore: parcel shader import
import fragmentGlsl from './shaders/fragment.glsl';
// @ts-ignore: parcel shader import
import vertexGlsl from './shaders/vertex.glsl';

// @ts-ignore: parcel json import
import cubeJson5 from './models/cube.json5';

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

function linkProgram(
  gl: WebGLRenderingContext,
  shaders: WebGLShader[],
): WebGLProgram {
  const program = gl.createProgram();

  for (const i in shaders) {
    gl.attachShader(program, shaders[i]);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

// Models are composed of faces.
// Faces are arrays of verts. For effective wireframe rendering with opaque
// faces, the verts should be ordered to support both LINE_LOOP (for wireframes)
// and TRIANGLE_FAN with CCW backface culling (for depth buffering of opaque
// surfaces).
const models = {
  cube: cubeJson5,
};

interface ModelBuffer {
  vertCount: number;
  glBuffer: WebGLBuffer;
}

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let camera: Camera;
let input: Input;
let modelBuffers: {
  [key: string]: ModelBuffer[];
};
let shaderProgram: WebGLProgram;

function main() {
  function initModels() {
    modelBuffers = {};

    // Pre-process models into GL attrib array
    for (const k in models) {
      const faces = models[k];
      modelBuffers[k] = [];

      for (const f in faces) {
        const faceVerts = new Float32Array(faces[f]);
        const buf = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

        modelBuffers[k].push({
          vertCount: faceVerts.length / 3,
          glBuffer: buf,
        });
      }
    }
  }

  function initRendering() {
    // Generate canvas DOM element
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.width = 1000;
    canvas.height = 600;

    // Extract GL context
    gl = canvas.getContext('webgl');

    if (!gl) {
      throw new Error('Could not initialize WebGL.');
    }

    // Compile shaders
    const vShader = compileShader(gl, gl.VERTEX_SHADER, vertexGlsl);
    const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentGlsl);

    // Load shader program
    shaderProgram = linkProgram(gl, [vShader, fShader]);
    gl.useProgram(shaderProgram);

    // Global rendering state
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
  }

  let lastTimeSample = Date.now();
  let firstLoop = true;

  function gameLoop() {
    requestAnimationFrame(gameLoop);

    const currentTime = Date.now();
    let delta = (currentTime - lastTimeSample) / 1000; // use seconds
    if (firstLoop) {
      delta = 0;
    }

    simulate(delta);
    render(delta);

    firstLoop = false;
    lastTimeSample = currentTime;
  }

  function simulate(delta: number): void {
    camera.simulate(delta);
  }

  function render(delta: number): void {
    // Clear previous frame
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Generate and set MVP matrix
    const matView = mat4.invert(mat4.create(), camera.transform.transform);
    const matProj = mat4.perspective(
      mat4.create(),
      Math.PI / 2,
      canvas.width / canvas.height,
      0.25,
      300.0,
    );
    const matMVP = mat4.multiply(mat4.create(), matProj, matView);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(shaderProgram, 'matMVP'),
      false,
      matMVP,
    );

    // Per-model rendering
    const drawList = ['cube'];

    // Depth pass
    gl.depthFunc(gl.LESS);
    gl.colorMask(false, false, false, false);

    for (const m in drawList) {
      const modelId = drawList[m];
      const buffers = modelBuffers[modelId];

      for (const b in buffers) {
        const bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        const posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, bufferData.vertCount);
      }
    }

    // Color pass
    gl.depthFunc(gl.LEQUAL);
    gl.colorMask(true, true, true, true);

    for (const m in drawList) {
      const modelId = drawList[m];
      const buffers = modelBuffers[modelId];

      for (const b in buffers) {
        const bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        const posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.drawArrays(gl.LINE_LOOP, 0, bufferData.vertCount);
      }
    }
  }

  initRendering();
  initModels();

  input = new Input();
  input.init();

  camera = new Camera(input);
  camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));

  gameLoop();
}

main();

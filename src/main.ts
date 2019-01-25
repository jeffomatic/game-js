import {vec4, mat3, mat4, quat} from 'gl-matrix'
// @ts-ignore: parcel shader import
import vertexShader from './shaders/vertex.glsl'
// @ts-ignore: parcel shader import
import fragmentShader from './shaders/fragment.glsl'

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  let shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader))
  }

  return shader
}

function linkProgram(gl: WebGLRenderingContext, shaders: Array<WebGLShader>): WebGLProgram {
  let program = gl.createProgram();

  for (let i in shaders) {
    gl.attachShader(program, shaders[i]);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

class Transform {
  translate: vec4;
  scale: vec4;
  rot: quat;
  transform: mat4;
  dirty: boolean;

  constructor() {
    this.translate = vec4.create()
    this.scale = vec4.create(); vec4.set(this.scale, 1, 1, 1, 1);
    this.rot = quat.create(); quat.identity(this.rot);
    this.transform = mat4.create();
    this.dirty = true;
    this.update();
  }

  update() {
    if (!this.dirty) return;

    // 3x3 scale matrix
    let s = mat3.create();
    s[0*3+0] = this.scale[0];
    s[1*3+1] = this.scale[1];
    s[2*3+2] = this.scale[2];

    // 3x3 rotation matrix
    let r = mat3.fromQuat(mat3.create(), this.rot)

    // 3x3 scale-then-rotate matrix
    let rs = mat3.multiply(mat3.create(), r, s);

    // 4x4 scale-then-rotate-then-translate matrix
    let t = this.transform;
    let tr = this.translate;

    t[0*4+0] = rs[0*3+0]; t[0*4+1] = rs[0*3+1]; t[0*4+2] = rs[0*3+2]; t[0*4+3] = 0;
    t[1*4+0] = rs[1*3+0]; t[1*4+1] = rs[1*3+1]; t[1*4+2] = rs[1*3+2]; t[1*4+3] = 0;
    t[2*4+0] = rs[2*3+0]; t[2*4+1] = rs[2*3+1]; t[2*4+2] = rs[2*3+2]; t[2*4+3] = 0;
    t[3*4+0] = tr[0];     t[3*4+1] = tr[1];     t[3*4+2] = tr[2];     t[3*4+3] = 1;

    this.dirty = false;
  }

  setTranslate(v: vec4): void {
    this.dirty = true;
    vec4.copy(this.translate, v);
  }

  setScale(v: vec4): void {
    this.dirty = true;
    vec4.copy(this.scale, v);
  }

  setRot(q: quat): void {
    this.dirty = true;
    quat.copy(this.rot, q);
  }
}

class Camera {
  transform: Transform;
  moveSpeed: number;
  rotSpeed: number;

  static keyMap = {
    forward: 87, // w
    left: 65, // a
    back: 83, // s
    right: 68, // d
    up: 81, // q
    down: 69, // e
    pitchUp: 38, // UP
    pitchDown: 40, // DOWN
    yawLeft: 37, // LEFT
    yawRight: 39, // RIGHT
    rollCCW: 188, // ,
    rollCW: 190 // .
  };

  constructor() {
    this.transform = new Transform();
    this.moveSpeed = 1;
    this.rotSpeed = 1;
  }

  simulate(delta: number) {
    // I. Update rotation
    let pitch = 0;
    let yaw = 0;
    let roll = 0;
    let frameRot = delta * this.rotSpeed;

    // Pitch
    if (keyState[Camera.keyMap.pitchUp]) {
      pitch = +frameRot;
    } else if (keyState[Camera.keyMap.pitchDown]) {
      pitch = -frameRot;
    }

    // Yaw
    if (keyState[Camera.keyMap.yawLeft]) {
      yaw = +frameRot;
    } else if (keyState[Camera.keyMap.yawRight]) {
      yaw = -frameRot;
    }

    // Roll
    if (keyState[Camera.keyMap.rollCCW]) {
      roll = +frameRot;
    } else if (keyState[Camera.keyMap.rollCW]) {
      roll = -frameRot;
    }

    if (pitch != 0 || yaw != 0 || roll != 0) {
      let rotDelta = quat.create();

      if (pitch != 0) {
        quat.rotateX(rotDelta, rotDelta, pitch);
      }

      if (yaw != 0) {
        quat.rotateY(rotDelta, rotDelta, yaw);
      }

      if (roll != 0) {
        quat.rotateZ(rotDelta, rotDelta, roll);
      }

      let q = quat.multiply(quat.create(), this.transform.rot, rotDelta);
      quat.normalize(q, q);
      this.transform.setRot(q);
    }

    // II. Update translation
    let frameSpeed = delta * this.moveSpeed;
    let dispDelta = vec4.create();

    // Forward
    if (keyState[Camera.keyMap.back]) {
      dispDelta[2] = +frameSpeed;
    } else if (keyState[Camera.keyMap.forward]) {
      dispDelta[2] = -frameSpeed;
    }

    // Strafe
    if (keyState[Camera.keyMap.right]) {
      dispDelta[0] = +frameSpeed;
    } else if (keyState[Camera.keyMap.left]) {
      dispDelta[0] = -frameSpeed;
    }

    // Asc/desc
    if (keyState[Camera.keyMap.up]) {
      dispDelta[1] = +frameSpeed;
    } else if (keyState[Camera.keyMap.down]) {
      dispDelta[1] = -frameSpeed;
    }

    if (dispDelta[0] != 0 || dispDelta[1] != 0 || dispDelta[2] != 0) {
      // Rotate the displacement by the current orientation
      let orientedDisp = vec4.transformQuat(vec4.create(), dispDelta, this.transform.rot);
      let newTrans = vec4.add(vec4.create(), this.transform.translate, orientedDisp);
      this.transform.setTranslate(newTrans);
    }

    this.transform.update();
  }
}

// Models are composed of faces.
// Faces are arrays of verts. For effective wireframe rendering with opaque
// faces, the verts should be ordered to support both LINE_LOOP (for wireframes)
// and TRIANGLE_FAN with CCW backface culling (for depth buffering of opaque
// surfaces).
let models = {
  cube: [
    [
      // X/Y plane, +Z
      +0.5, +0.5, +0.5,
      -0.5, +0.5, +0.5,
      -0.5, -0.5, +0.5,
      +0.5, -0.5, +0.5,
    ], [
      // X/Z plane, -Y
      +0.5, -0.5, +0.5,
      -0.5, -0.5, +0.5,
      -0.5, -0.5, -0.5,
      +0.5, -0.5, -0.5,
    ], [
      // X/Y plane, -Z
      +0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5,
      -0.5, +0.5, -0.5,
      +0.5, +0.5, -0.5,
    ], [
      // X/Z plane, +Y
      +0.5, +0.5, -0.5,
      -0.5, +0.5, -0.5,
      -0.5, +0.5, +0.5,
      +0.5, +0.5, +0.5,
    ], [
      // Y/Z plane, -X
      -0.5, -0.5, -0.5,
      -0.5, -0.5, +0.5,
      -0.5, +0.5, +0.5,
      -0.5, +0.5, -0.5,
    ], [
      // Y/Z plane, +X
      +0.5, +0.5, +0.5,
      +0.5, -0.5, +0.5,
      +0.5, -0.5, -0.5,
      +0.5, +0.5, -0.5,
    ]
  ]
};

let canvas;
let gl;
let keyState;
let camera;
let vertBuffer;
let modelBuffers;
let shaderProgram;

function main() {
  function initModels() {
    modelBuffers = {};

    // Pre-process models into GL attrib array
    for (let k in models) {
      let faces = models[k];
      modelBuffers[k] = [];

      for (let f in faces) {
        let faceVerts = new Float32Array(faces[f]);
        let buf = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);

        modelBuffers[k].push({
          vertCount: faceVerts.length / 3,
          glBuffer: buf
        });
      }
    }
  }

  function initCamera() {
    camera = new Camera();
    camera.transform.setTranslate(vec4.fromValues(0, 0, 4, 0));
  }

  function initRendering() {
    // Generate canvas DOM element
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.width = 1000;
    canvas.height = 600;

    // Extract GL context
    gl = canvas.getContext("webgl");

    if (!gl) {
      throw new Error("Couldn't initialize WebGL.");
    }

    // Compile shaders
    let vShader = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    let fShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    // Load shader program
    shaderProgram = linkProgram(gl, [vShader, fShader]);
    gl.useProgram(shaderProgram);

    // Global rendering state
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
  }

  function initInputHandling() {
    keyState = {}

    document.addEventListener('focusout', function() {
      keyState = {};
    });

    document.addEventListener('keydown', function(event) {
      if (keyState[event.which]) {
        return;
      }

      keyState[event.which] = true;
    });

    document.addEventListener('keyup', function(event) {
      delete keyState[event.which];
    });
  }

  let lastTimeSample = Date.now();
  let firstLoop = true;

  function gameLoop() {
    requestAnimationFrame(gameLoop);

    let currentTime = Date.now();
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
    let matView = mat4.invert(mat4.create(), camera.transform.transform);
    let matProj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.25, 300.0);
    let matMVP = mat4.multiply(mat4.create(), matProj, matView);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'matMVP'), false, matMVP);

    // Per-model rendering
    let drawList = [ 'cube' ];

    // Depth pass
    gl.depthFunc(gl.LESS);
    gl.colorMask(false, false, false, false);

    for (let m in drawList) {
      let modelId = drawList[m];
      let buffers = modelBuffers[modelId];

      for (let b in buffers) {
        let bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        let posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, bufferData.vertCount);
      }
    }

    // Color pass
    gl.depthFunc(gl.LEQUAL);
    gl.colorMask(true, true, true, true);

    for (let m in drawList) {
      let modelId = drawList[m];
      let buffers = modelBuffers[modelId];

      for (let b in buffers) {
        let bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        let posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.drawArrays(gl.LINE_LOOP, 0, bufferData.vertCount);
      }
    }
  }

  initRendering();
  initModels();

  initInputHandling();
  initCamera();

  gameLoop();
};

main();

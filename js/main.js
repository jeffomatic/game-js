import {vec3, vec4, mat3, mat4, quat} from './gl-matrix'

const vertexShader = `
attribute vec3 v3Pos;
uniform mat4 matMVP;

void main(void) {
  gl_Position = matMVP * vec4(v3Pos, 1.0);
}
`

const fragShader = `
void main(void) {
  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`

function compileShader(gl, type, src) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader
}

function linkProgram(gl, shaders) {
  var program = gl.createProgram();

  for (var i in shaders) {
    gl.attachShader(program, shaders[i]);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

function Transform() {
  this.translate = vec4.create()
  this.scale = vec4.create(); vec4.set(this.scale, 1, 1, 1, 1);
  this.rot = quat.create(); quat.identity(this.rot);
  this.transform = mat4.create();
  this.dirty = true;
  this.update();
}

Transform.prototype.update = function() {
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

Transform.prototype.setTranslate = function(v) {
  this.dirty = true;
  vec4.copy(this.translate, v);
}

Transform.prototype.setScale = function(v) {
  this.dirty = true;
  vec4.copy(this.scale, v);
}

Transform.prototype.setRot = function(q) {
  this.dirty = true;
  quat.copy(this.rot, q);
}

function Camera() {
  this.transform = new Transform();

  this.moveSpeed = 1;
  this.rotSpeed = 1;

  this.keyMap = {
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
}

Camera.prototype.simulate = function(delta) {
  // I. Update rotation
  var pitch = 0;
  var yaw = 0;
  var roll = 0;
  var frameRot = delta * this.rotSpeed;

  // Pitch
  if (keyState[this.keyMap.pitchUp]) {
    pitch = +frameRot;
  } else if (keyState[this.keyMap.pitchDown]) {
    pitch = -frameRot;
  }

  // Yaw
  if (keyState[this.keyMap.yawLeft]) {
    yaw = +frameRot;
  } else if (keyState[this.keyMap.yawRight]) {
    yaw = -frameRot;
  }

  // Roll
  if (keyState[this.keyMap.rollCCW]) {
    roll = +frameRot;
  } else if (keyState[this.keyMap.rollCW]) {
    roll = -frameRot;
  }

  if (pitch != 0 || yaw != 0 || roll != 0) {
    var rotDelta = quat.create();

    if (pitch != 0) {
      quat.rotateX(rotDelta, rotDelta, pitch);
    }

    if (yaw != 0) {
      quat.rotateY(rotDelta, rotDelta, yaw);
    }

    if (roll != 0) {
      quat.rotateZ(rotDelta, rotDelta, roll);
    }

    var q = quat.multiply(quat.create(), this.transform.rot, rotDelta);
    quat.normalize(q, q);
    this.transform.setRot(q);
  }

  // II. Update translation
  var frameSpeed = delta * this.moveSpeed;
  var dispDelta = vec4.create();

  // Forward
  if (keyState[this.keyMap.back]) {
    dispDelta[2] = +frameSpeed;
  } else if (keyState[this.keyMap.forward]) {
    dispDelta[2] = -frameSpeed;
  }

  // Strafe
  if (keyState[this.keyMap.right]) {
    dispDelta[0] = +frameSpeed;
  } else if (keyState[this.keyMap.left]) {
    dispDelta[0] = -frameSpeed;
  }

  // Asc/desc
  if (keyState[this.keyMap.up]) {
    dispDelta[1] = +frameSpeed;
  } else if (keyState[this.keyMap.down]) {
    dispDelta[1] = -frameSpeed;
  }

  if (dispDelta[0] != 0 || dispDelta[1] != 0 || dispDelta[2] != 0) {
    // Rotate the displacement by the current orientation
    var orientedDisp = vec4.transformQuat(vec4.create(), dispDelta, this.transform.rot);
    var newTrans = vec4.add(vec4.create(), this.transform.translate, orientedDisp);
    this.transform.setTranslate(newTrans);
  }

  this.transform.update();
}

// Models are composed of faces.
// Faces are arrays of verts. For effective wireframe rendering with opaque
// faces, the verts should be ordered to support both LINE_LOOP (for wireframes)
// and TRIANGLE_FAN with CCW backface culling (for depth buffering of opaque
// surfaces).
var models = {
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

var canvas;
var gl;
var keyState;
var camera;
var vertBuffer;
var modelBuffers;
var shaderProgram;

function main() {
  function initModels() {
    modelBuffers = {};

    // Pre-process models into GL attrib array
    for (var k in models) {
      var faces = models[k];
      modelBuffers[k] = [];

      for (var f in faces) {
        var faceVerts = new Float32Array(faces[f]);
        var buf = gl.createBuffer();

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
    var vShader = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    var fShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShader);

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
      console.log(keyState);
    });

    document.addEventListener('keyup', function(event) {
      delete keyState[event.which];
    });
  }

  var lastTimeSample = Date.now();
  var firstLoop = true;

  function gameLoop() {
    requestAnimationFrame(gameLoop);

    var currentTime = Date.now();
    var delta = (currentTime - lastTimeSample) / 1000; // use seconds
    if (firstLoop) {
      delta = 0;
    }

    simulate(delta);
    render(delta);

    firstLoop = false;
    lastTimeSample = currentTime;
  }

  function simulate(delta) {
    camera.simulate(delta);
  }

  function render(delta) {
    // Clear previous frame
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Generate and set MVP matrix
    var matView = mat4.invert(mat4.create(), camera.transform.transform);
    var matProj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.25, 300.0);
    var matMVP = mat4.multiply(mat4.create(), matProj, matView);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'matMVP'), false, matMVP);

    // Per-model rendering
    var drawList = [ 'cube' ];

    // Depth pass
    gl.depthFunc(gl.LESS);
    gl.colorMask(false, false, false, false);

    for (var m in drawList) {
      var modelId = drawList[m];
      var buffers = modelBuffers[modelId];

      for (var b in buffers) {
        var bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        var posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, bufferData.vertCount);
      }
    }

    // Color pass
    gl.depthFunc(gl.LEQUAL);
    gl.colorMask(true, true, true, true);

    for (var m in drawList) {
      var modelId = drawList[m];
      var buffers = modelBuffers[modelId];

      for (var b in buffers) {
        var bufferData = buffers[b];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.glBuffer);

        var posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');
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

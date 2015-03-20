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
  s = mat3.create();
  s[0*3+0] = this.scale[0];
  s[1*3+1] = this.scale[1];
  s[2*3+2] = this.scale[2];

  // 3x3 rotation matrix
  r = mat3.fromQuat(mat3.create(), this.rot)

  // 3x3 scale-then-rotate matrix
  rs = mat3.multiply(mat3.create(), r, s);

  // 4x4 scale-then-rotate-then-translate matrix
  t = this.transform;
  tr = this.translate;

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
  if (keyState[this.keyMap.rollCW]) {
    roll = +frameRot;
  } else if (keyState[this.keyMap.rollCCW]) {
    roll = -frameRot;
  }

  if (pitch != 0 || yaw != 0 || roll != 0) {
    var rotDelta = quat.create();

    if (pitch != 0) quat.rotateX(rotDelta, rotDelta, pitch);
    if (yaw != 0) quat.rotateY(rotDelta, rotDelta, yaw);
    if (roll != 0) quat.rotateZ(rotDelta, rotDelta, roll);

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
// Faces are arrays of GL_LINE_LOOP verts.
models = {
  cube: [
    [
      +0.5, +0.5, +0.5,
      -0.5, +0.5, +0.5,
      -0.5, -0.5, +0.5,
      +0.5, -0.5, +0.5,
    ], [
      +0.5, +0.5, -0.5,
      -0.5, +0.5, -0.5,
      -0.5, +0.5, +0.5,
      +0.5, +0.5, +0.5,
    ], [
      +0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5,
      -0.5, +0.5, -0.5,
      +0.5, +0.5, -0.5,
    ], [
      +0.5, -0.5, +0.5,
      -0.5, -0.5, +0.5,
      -0.5, -0.5, -0.5,
      +0.5, -0.5, -0.5,
    ], [
      -0.5, +0.5, +0.5,
      -0.5, +0.5, -0.5,
      -0.5, -0.5, -0.5,
      -0.5, -0.5, +0.5,
    ], [
      +0.5, +0.5, -0.5,
      +0.5, +0.5, +0.5,
      +0.5, -0.5, +0.5,
      +0.5, -0.5, -0.5,
    ]
  ],
}

var canvas;
var gl;
var program;
var keyState;
var camera;

function main() {
  function initModels() {
    // Post-process models into Float32Array objects
    for (k in models) {
      models[k] = models[k].map(function(face) { return new Float32Array(face); });
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

    // Extract GL context
    gl = canvas.getContext("webgl");

    if (!gl) {
      throw new Error("Couldn't initialize WebGL.");
    }

    // Compile shaders
    var vShader = compileShader(gl, gl.VERTEX_SHADER, document.querySelector('#shader-vs').textContent)
    var fShader = compileShader(gl, gl.FRAGMENT_SHADER, document.querySelector('#shader-fs').textContent);

    // Load shader program
    shaderProgram = linkProgram(gl, [vShader, fShader]);
    gl.useProgram(shaderProgram);

    // Global rendering state
    gl.viewport(0, 0, canvas.width, canvas.height);
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Generate and set MVP matrix
    var matView = mat4.invert(mat4.create(), camera.transform.transform);
    var matProj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.25, 1000.0);
    var matMVP = mat4.multiply(mat4.create(), matProj, matView);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'matMVP'), false, matMVP);

    // Per-model rendering
    var drawList = [ models.cube ];
    for (m in drawList) {
      var faces = drawList[m];

      for (f in faces) {
        var faceVerts = faces[f];
        var vertBuffer = gl.createBuffer();
        var posAttrib = gl.getAttribLocation(shaderProgram, 'v3Pos');

        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, faceVerts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttrib);

        gl.lineWidth(1.0);
        gl.drawArrays(gl.LINE_LOOP, 0, faceVerts.length / 3);
      }
    }
  }

  initModels();
  initCamera();
  initRendering();
  initInputHandling();
  gameLoop();
};
import { mat4 } from 'gl-matrix';

// @ts-ignore: parcel shader import
import fragmentGlsl from './shaders/fragment.glsl';
// @ts-ignore: parcel shader import
import vertexGlsl from './shaders/vertex.glsl';

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

export interface ModelBuffer {
  vertCount: number;
  glBuffer: WebGLBuffer;
}

export class Renderer {
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  canvasWidth: number;
  canvasHeight: number;

  constructor(
    gl: WebGLRenderingContext,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    this.gl = gl;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  init(): void {
    // Compile shaders
    const vShader = compileShader(this.gl, this.gl.VERTEX_SHADER, vertexGlsl);
    const fShader = compileShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentGlsl,
    );

    // Load shader program
    this.program = linkProgram(this.gl, [vShader, fShader]);
    this.gl.useProgram(this.program);

    // Global rendering state
    this.gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  update(view: mat4, drawList: ModelBuffer[]): void {
    // Clear previous frame
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Generate and set MVP matrix
    const matView = mat4.invert(mat4.create(), view);
    const matProj = mat4.perspective(
      mat4.create(),
      Math.PI / 2,
      this.canvasWidth / this.canvasHeight,
      0.25,
      300.0,
    );
    const matMVP = mat4.multiply(mat4.create(), matProj, matView);
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, 'matMVP'),
      false,
      matMVP,
    );

    // Depth pass
    this.gl.depthFunc(this.gl.LESS);
    this.gl.colorMask(false, false, false, false);

    for (const b of drawList) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, b.glBuffer);

      const posAttrib = this.gl.getAttribLocation(this.program, 'v3Pos');
      this.gl.vertexAttribPointer(posAttrib, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(posAttrib);

      this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, b.vertCount);
    }

    // Color pass
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.colorMask(true, true, true, true);

    for (const b of drawList) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, b.glBuffer);

      const posAttrib = this.gl.getAttribLocation(this.program, 'v3Pos');
      this.gl.vertexAttribPointer(posAttrib, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(posAttrib);

      this.gl.drawArrays(this.gl.LINE_LOOP, 0, b.vertCount);
    }
  }
}

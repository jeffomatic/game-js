import { vec2, mat4 } from 'gl-matrix';

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

export interface Renderable {
  worldModel: mat4;
  meshId: string;
}

export interface RawMesh {
  vertices: number[];
  triangleIndices: number[];
  lineIndices: number[];
}

interface BufferedMesh {
  vertices: WebGLBuffer;
  triangleIndices: WebGLBuffer;
  numTriangleIndices: number;
  lineIndices: WebGLBuffer;
  numLineIndices: number;
}

export class Renderer {
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  canvasSize: vec2;
  nextCanvasSize?: vec2;

  fov: number;
  near: number;
  far: number;

  bufferedMeshes: { [id: string]: BufferedMesh };

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;

    this.fov = Math.PI / 2;
    this.near = 0.25;
    this.far = 300;

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
    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, 'pos'),
    );

    // Global rendering state
    this.gl.enable(this.gl.DEPTH_TEST);

    this.bufferedMeshes = {};
  }

  resizeCanvas(size: vec2): void {
    this.nextCanvasSize = size;
  }

  addMesh(id: string, raw: RawMesh): void {
    const vertices = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(raw.vertices),
      this.gl.STATIC_DRAW,
    );
    this.gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, 'pos'),
      3,
      this.gl.FLOAT,
      false,
      0,
      0,
    );

    const triangleIndices = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, triangleIndices);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(raw.triangleIndices),
      this.gl.STATIC_DRAW,
    );

    const lineIndices = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, lineIndices);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(raw.lineIndices),
      this.gl.STATIC_DRAW,
    );

    this.bufferedMeshes[id] = {
      vertices,
      triangleIndices,
      lineIndices,
      numTriangleIndices: raw.triangleIndices.length,
      numLineIndices: raw.lineIndices.length,
    };
  }

  render(view: mat4, renderables: Renderable[]): void {
    // Resize viewport if necessary
    if (this.nextCanvasSize) {
      this.canvasSize = this.nextCanvasSize;
      this.nextCanvasSize = null;
      this.gl.viewport(0, 0, this.canvasSize[0], this.canvasSize[1]);
    }

    // Clear previous frame
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Generate and set MVP matrix
    const matView = mat4.invert(mat4.create(), view);
    const matProj = mat4.perspective(
      mat4.create(),
      this.fov,
      this.canvasSize[0] / this.canvasSize[1],
      this.near,
      this.far,
    );
    const projView = mat4.multiply(mat4.create(), matProj, matView);
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, 'projView'),
      false,
      projView,
    );

    // Common shader params
    const worldModelUniform = this.gl.getUniformLocation(
      this.program,
      'worldModel',
    );

    // Depth pass
    this.gl.depthFunc(this.gl.LESS);
    this.gl.colorMask(false, false, false, false);

    for (const { worldModel, meshId } of renderables) {
      // Setup shader
      this.gl.uniformMatrix4fv(worldModelUniform, false, worldModel);

      // Draw geometry
      const {
        vertices,
        triangleIndices,
        numTriangleIndices,
      } = this.bufferedMeshes[meshId];

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, triangleIndices);
      this.gl.vertexAttribPointer(
        this.gl.getAttribLocation(this.program, 'pos'),
        3,
        this.gl.FLOAT,
        false,
        0,
        0,
      );

      this.gl.drawElements(
        this.gl.TRIANGLES,
        numTriangleIndices,
        this.gl.UNSIGNED_SHORT,
        0,
      );
    }

    // Color pass
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.colorMask(true, true, true, true);

    for (const { worldModel, meshId } of renderables) {
      // Setup shader
      this.gl.uniformMatrix4fv(worldModelUniform, false, worldModel);

      // Draw geometry
      const { vertices, lineIndices, numLineIndices } = this.bufferedMeshes[
        meshId
      ];

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, lineIndices);
      this.gl.vertexAttribPointer(
        this.gl.getAttribLocation(this.program, 'pos'),
        3,
        this.gl.FLOAT,
        false,
        0,
        0,
      );

      this.gl.drawElements(
        this.gl.LINES,
        numLineIndices,
        this.gl.UNSIGNED_SHORT,
        0,
      );
    }
  }
}

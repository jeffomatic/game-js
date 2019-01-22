attribute vec3 v3Pos;
uniform mat4 matMVP;

void main(void) {
  gl_Position = matMVP * vec4(v3Pos, 1.0);
}
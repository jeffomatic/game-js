#version 300 es

in vec3 pos;
uniform mat4 worldModel;
uniform mat4 projView;

void main(void) {
  gl_Position = projView * worldModel * vec4(pos, 1.0);
}

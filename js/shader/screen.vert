attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;
uniform   mat4 uModelMatrix;
uniform   mat4 uViewMatrix;
uniform   mat4 uProjectionMatrix;
uniform   bool uEdgeDecide;
varying   vec4 vColor;

void main() {
  mat4 mvpMatrix = uProjectionMatrix * uViewMatrix * uModelMatrix;
  vec3 vNormal;
  vColor  = color;
  vNormal = normal;
  vec3 pos = position;
  if(uEdgeDecide) {
    pos += normal * 0.003;
  }
  gl_Position = mvpMatrix * vec4(pos, 1.0);
}
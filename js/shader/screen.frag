precision mediump float;

varying vec4 vColor;
uniform bool uEdgeDecide;

void main() {
  vec4 col = vColor;
  if(uEdgeDecide) {
    col = vec4(0.0, 0.0, 0.0, 1.0);
  }
  gl_FragColor = col;
}
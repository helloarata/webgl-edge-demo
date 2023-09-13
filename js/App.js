import { WebGLUtility }      from './lib/WebGLUtility.js';
import { WebGLOrbitCamera }  from './lib/camera.js';
import { WebGLMath }         from './lib/math.js';

export class App extends WebGLUtility {
  constructor() {
    super();
  }

  init() {
    const elementId = 'webgl-canvas';
    this.getWebGLRenderingContext(elementId);
    this.isReady = false;
  }

  load() {
    return new Promise((resolve) => {
      this.loadShader( ['./js/shader/screen.vert', './js/shader/screen.frag'] )
      .then((shaders) => {
        this.vsSource = shaders[0];
        this.fsSource = shaders[1];
        resolve();
      });
    });
  }

  loadShader(pathArray) {
    if(Array.isArray(pathArray) !== true) throw new Error('invalid argument');
    const promises = pathArray.map((path) => {
      return fetch(path)
      .then((response) => {
        return response.text();
      });
    });
    return Promise.all(promises);
  }
  // リサイズ処理
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setup() {
    this.setupProgramObject();
    this.setupLocation();
    this.setupAttribute();
    this.createCamera();
    this.isReady = true;
  }

  setupProgramObject() { 
    const gl = this.gl;
    const vsShaderObject = this.createWebGLShaderObject(this.vsSource, gl.VERTEX_SHADER);
    const fsShaderObject = this.createWebGLShaderObject(this.fsSource, gl.FRAGMENT_SHADER);
    this.programObject   = this.createWebGLProgramObject(vsShaderObject, fsShaderObject);
  }

  setupLocation() {
    const gl      = this.gl;
    const pObject = this.programObject;
    this.attLocation = [
      gl.getAttribLocation(pObject, 'position'),
      gl.getAttribLocation(pObject, 'color'),
      gl.getAttribLocation(pObject, 'normal'),
    ];
    this.attStride = [ 3, 4, 3 ];
    this.uniLocation = [
      gl.getUniformLocation(pObject, 'uModelMatrix'),
      gl.getUniformLocation(pObject, 'uViewMatrix'),
      gl.getUniformLocation(pObject, 'uProjectionMatrix'),
      gl.getUniformLocation(pObject, 'uEdgeDecide'),
    ];
    this.uniType = [
      'uniformMatrix4fv',
      'uniformMatrix4fv',
      'uniformMatrix4fv',
      'uniform1i',
    ];
  }

  setupAttribute() {
    // 共通で使用する頂点の色
    const color = [0.8124, 0.629, 0.81, 1.0];

    // plane ジオメトリの生成
    this.plane = this.createPlane(.1, .1, color);
    this.pVBO = [
      this.createWebGLVBO(this.plane.position),
      this.createWebGLVBO(this.plane.color),
      this.createWebGLVBO(this.plane.normal),
    ];
    this.pIBO = this.createWebGLIBO(this.plane.index);

    // cube ジオメトリの生成
    this.cube = this.createCube(.1, color);
    this.cVBO = [
      this.createWebGLVBO(this.cube.position),
      this.createWebGLVBO(this.cube.color),
      this.createWebGLVBO(this.cube.normal),
    ];
    this.cIBO = this.createWebGLIBO(this.cube.index);
  }

  createPlane(width, height, color) {
    const w = width / 2;
    const h = height / 2;
    // 頂点 @@@
    const pos = [
      -w,  h, 0.0,
       w,  h, 0.0,
      -w, -h, 0.0,
       w, -h, 0.0
    ];
    const nor = [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ];
    const col = [
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3]
    ];
    const st  = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ];
    // 頂点の結び順は反時計回り = 表面 @@@
    const frontIdx = [
      0, 2, 1,
      1, 2, 3
    ];
    // 頂点の結び順は時計回り = 裏面 @@@
    const backIdx = [
      0, 1, 2,
      1, 3, 2
    ]
    return {position: pos, normal: nor, color: col, texCoord: st, index: frontIdx}
  }
  // キューブを定義
  createCube(side, color){
    const  hs = side * 0.5;
    const pos = [
      -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
      -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
      -hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
      -hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
       hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
      -hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
    ];
    const v = 1.0 / Math.sqrt(3.0);
    const nor = [
      -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,  v,
      -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v, -v,
      -v,  v, -v, -v,  v,  v,  v,  v,  v,  v,  v, -v,
      -v, -v, -v,  v, -v, -v,  v, -v,  v, -v, -v,  v,
       v, -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,
      -v, -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v
    ];
    const col = [];
    for(let i = 0; i < pos.length / 3; i++){
      col.push(color[0], color[1], color[2], color[3]);
    }
    const idx = [
      0,  1,  2,  0,  2,  3,
      4,  5,  6,  4,  6,  7,
      8,  9, 10,  8, 10, 11,
     12, 13, 14, 12, 14, 15,
     16, 17, 18, 16, 18, 19,
     20, 21, 22, 20, 22, 23
    ];
    return { position: pos, index: idx, normal: nor, color: col };
  }

  createCamera() {
    const cameraOption = {
      distance: 1.0,
      min     : 1.0,
      max     : 10.0,
      move    : 2.0,
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);
  }

  update({ time, deltaTime }) {
    // レンダリングの処理が整っていない場合は、下記の処理はまだ実行されないです
    if(!this.isReady) return;

    const MAT = WebGLMath.Mat4;
    const gl  = this.gl;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.158, 0.629, 0.81, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // カリングの有効化 @@@
    gl.enable(gl.CULL_FACE);
    // 深度テストの有効化 @@@
    gl.enable(gl.DEPTH_TEST);
    
    this.viewMatrix = this.camera.update();
    const fovy   = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near   = 0.1;
    const far    = 10.0;
    this.projectionMatrix = MAT.perspective(fovy, aspect, near, far);
    this.modelMatrix = MAT.identity();
  
    gl.useProgram(this.programObject);

    // ジオメトリの描画
    this.edgeDecide = false;
    // 裏面は描画しない
    gl.cullFace(gl.BACK);
    this.setWebGLAttribute(this.cVBO, this.attLocation, this.attStride, this.cIBO);
    // this.setWebGLAttribute(this.pVBO, this.attLocation, this.attStride, this.pIBO);
    this.setWebGLUniform([
      this.modelMatrix,
      this.viewMatrix,
      this.projectionMatrix,
      this.edgeDecide,
    ], this.uniLocation, this.uniType);
    gl.drawElements(gl.TRIANGLES, this.cube.index.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.TRIANGLES, this.plane.index.length, gl.UNSIGNED_SHORT, 0);

    // // エッジ用ジオメトリの描画
    this.edgeDecide = true;
    // // 表面は描画しない
    gl.cullFace(gl.FRONT);
    this.setWebGLAttribute(this.cVBO, this.attLocation, this.attStride, this.cIBO);
    // // this.setWebGLAttribute(this.pVBO, this.attLocation, this.attStride, this.pIBO);
    this.setWebGLUniform([
      this.modelMatrix,
      this.viewMatrix,
      this.projectionMatrix,
      this.edgeDecide,
    ], this.uniLocation, this.uniType);
    gl.drawElements(gl.TRIANGLES, this.cube.index.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.TRIANGLES, this.plane.index.length, gl.UNSIGNED_SHORT, 0);

  }
}
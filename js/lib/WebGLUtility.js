export class WebGLUtility {
  constructor(){
    this.canvas    = null;
    this.gl        = null;
  };
  getWebGLRenderingContext(canvas){
    if(canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
    } else if(Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if(c instanceof HTMLCanvasElement) {
        this.canvas = c;
      }
    }

    if(this.canvas == null) {
      throw new Error('invalid argument');
    }

    this.gl = this.canvas.getContext('webgl');

    if(this.gl == null) {
      throw new Error('webgl not supported');
    }
  }
  createWebGLShaderObject(source, type){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
  }
  createWebGLProgramObject(vsObject, fsObject){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    const programObject = gl.createProgram();
    gl.attachShader(programObject, vsObject);
    gl.attachShader(programObject, fsObject);
    gl.linkProgram(programObject);
    if(gl.getProgramParameter(programObject, gl.LINK_STATUS)) {
      gl.useProgram(programObject);
      return programObject;
    } else {
      alert(gl.getProgramInfoLog(programObject));
      return null;
    }
  }
  // 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
  createWebGLTexture(source){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    return new Promise((resolve) => {
      const gl  = this.gl;
      const img = new Image();
      img.addEventListener('load' ,() => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // gl.CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // gl.CLAMP_TO_EDGE
        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve(tex);
      }, false);
      img.src = source;
    });
  }
  createWebGLVBO(data){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl  = this.gl;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }
  createWebGLIBO(data){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }
  setWebGLAttribute(vbo, attL, attS, ibo = null){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    vbo.forEach((v, index) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, v);
      gl.enableVertexAttribArray(attL[index]);
      gl.vertexAttribPointer(attL[index], attS[index], gl.FLOAT, false, 0, 0);
    });
    if(ibo != null) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  }
  setWebGLUniform(value, uniL, uniT){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    value.forEach((v, index) => {
      const type = uniT[index];
      type.includes('Matrix') === true ? gl[type](uniL[index], false, v) : gl[type](uniL[index], v);
    });
  }
  createWebGLFrameBuffer(width, height){
    if(this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl     = this.gl;
    // フレームバッファの生成
    const frameBuffer = gl.createFramebuffer();
    // フレームバッファをWebGLにバインド
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    // 深度バッファ用のレンダーバッファの生成
    const depthRenderBuffer = gl.createRenderbuffer();
    // バインド
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    // レンダーバッファを深度バッファとして設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    // フレームバッファにレンダーバッファを関連付ける
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
    // フレームバッファ用のテクスチャの生成
    const fTexture = gl.createTexture();
    // フレームバッファ用のテクスチャをバインド
    gl.bindTexture(gl.TEXTURE_2D, fTexture); // まずはバインドする(手にとるイメージ)
    // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
    // バインドしたテクスチャに画素を割り当てる
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // テクスチャパラーメータの設定
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // フレームバッファにテクスチャを関連付ける
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
  }
  createWebGLFrameBufferFloat(ext, width, height){
    if(this.gl == null){
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
      throw new Error('float texture not supported');
    }
    // 32ビット浮動小数点数 または 16ビット浮動小数点数
    const flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
    // フレームバッファの生成
    const frameBuffer = gl.createFramebuffer();
    // フレームバッファをWebGLにバインド
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    // フレームバッファ用のテクスチャをバインド
    const fTexture = gl.createTexture();
    // フレームバッファ用のテクスチャをバインド
    gl.bindTexture(gl.TEXTURE_2D, fTexture); // まずはバインドする(手にとるイメージ)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {f: frameBuffer, t: fTexture};
  }
  getWebGLExtensions() {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    return {
      elementIndexUint: gl.getExtension('OES_element_index_uint'),
      textureFloat:   gl.getExtension('OES_texture_float'),
      textureHalfFloat: gl.getExtension('OES_texture_half_float')
    };
  }

}
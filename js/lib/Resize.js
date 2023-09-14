export class Resize {
  constructor(){
    //
    this.lastUpdateTime = 0;
    //
    this.resize = {
      // window の以前のサイズ
      prevSize  :  { w : 0, h : 0 },
      // リサイズをチェッした段階の時刻
      checkTime : 0,
      // どのくらいの間隔でリサイズチェックを行うのか 今回は 0.5秒
      interval  : 500 * 0.001,
    };
    //
    this.checkResize = this.checkResize.bind(this);
  }

  // 初回時はブラウザーコンテキストが生成された時刻を保持します
  init(){
    // performance.now() -> 9755.90000000596 ミリ秒 に 0.001を掛ける -> 9.75590000000596 秒に変換
    this.lastUpdateTime = performance.now() * 0.001;
  }

  update(app){
    // 現在の環境ブラウザで実行可能なフレームレート(1秒間に60回呼び出す)
    requestAnimationFrame(this.update.bind(this, app));

    // updateが開始された時刻(ミリ秒)から秒に変換して、time に値を格納しています
    const time = performance.now() * 0.001;
    
    // 毎フレーム0.5秒経過後に、リサイズ処理を行うかチェックする (真偽値が返却される)
    if(this.checkResize(time)) app.resize();

    // updateが開始された時刻 から 前のフレームのupdateが開始された時刻を引いた差分の時間
    const deltaTime = time - this.lastUpdateTime;
    // updateが開始された時刻
    this.lastUpdateTime = time;
    // Appクラスのupdateに updateが開始された時刻と 前のフレームの更新時刻の差分を送る
    app.update( { time, deltaTime } );
  }

  // 500ミリ秒毎に windowの幅と高さが 現在の画面の幅と高と同じかどうかチェックして、更新する必要があるが真偽値を返却してくれるメソッド
  checkResize(time){
    // 0.5秒経過している場合のみ、チェック処理を実行する
    // 現在の時刻 - 前のフレームで0.5秒後に、リサイズチェックを行った時刻 < リサイズチェックを行う間隔
    if(time -this.resize.checkTime < this.resize.interval) return false;
    // 今のフレームで0.5秒後にリサイズチェックを行った時刻を更新
    this.resize.checkTime = time;
    
    // windowの幅と高さが、前のフレームの幅と高さと比較して値が同じでなければ、「更新する必要がある」という事なので、現在のwindowサイズに前のフレームのサイズを更新する
    if(window.innerWidth !== this.resize.prevSize.w || window.innerHeight !== this.resize.prevSize.h){
      this.resize.prevSize.w = window.innerWidth;
      this.resize.prevSize.h = window.innerHeight;

      // ここで更新されたと言う事は、リサイズ処理を行うべきなので、true を返却する
      // リサイズする必要がある場合
      return true;
    }
    // false と言う事は、更新する必要がないと言う事なので、false を返却する
    // リサイズする必要がない場合
    return false;
  }
}
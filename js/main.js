// リサイズするべきか判断するクラス
import { Resize } from './lib/Resize.js';
import { App }    from './App.js';

window.addEventListener('DOMContentLoaded', () => {
  const resize = new Resize();
  const app    = new App();
  resize.init();
  app.init();
  resize.update(app);
  app.load()
  .then(() => {
    app.setup();
  });
});
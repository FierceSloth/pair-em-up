import { appEmitter, emitter } from './utils/emmiter';

import Menu from './components/screens/Menu/Menu';
import Game from './components/screens/Game/Game';

export default class App {
  constructor() {
    this.currentScreen = null;

    appEmitter.on('showScreen', (data) => this.showScreen(data));
  }

  showScreen(screen) {
    console.log(appEmitter);
    if (this.currentScreen === screen) return;

    if (this.currentScreen) {
      document.querySelector('.container').remove();
      document.querySelectorAll('.popup--overlay').forEach((el) => el.remove());
      const github = document.querySelector('.github__link');
      if (github) github.remove();
    }

    if (screen === 'menu') {
      emitter.clear();

      const menu = new Menu();
      menu.render();
      document.body.append(menu.node);
    }

    if (screen === 'game') {
      emitter.clear();

      const game = new Game();
      game.render();
      document.body.append(game.node);
    }

    this.currentScreen = screen;
  }
}

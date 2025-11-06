import { emitter } from './utils/emmiter';

import Menu from './components/screens/Menu/Menu';
import Game from './components/screens/Game/Game';

export default class App {
  constructor() {
    this.currentScreen = null;

    emitter.on('showScreen', (data) => this.showScreen(data));
  }

  showScreen(screen) {
    if (this.currentScreen === screen) return;

    if (this.currentScreen) document.querySelector('.container').remove();

    if (screen === 'menu') {
      const menu = new Menu();
      menu.render();
      document.body.append(menu.node);
    }

    if (screen === 'game') {
      const game = new Game();
      game.render();
      document.body.append(game.node);
    }

    this.currentScreen = screen;
  }
}

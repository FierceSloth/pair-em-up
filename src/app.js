import { appEmitter, emitter } from './utils/emmiter';
import gameStorage from './utils/gameStorage';

import Menu from './components/screens/Menu/Menu';
import Game from './components/screens/Game/Game';

export default class App {
  constructor() {
    this.currentScreen = null;

    appEmitter.on('showScreen', (screen) => {
      this.showScreen(screen);
    });
    appEmitter.on('modeSwitch', (mode) => {
      gameStorage.setSetting('mode', mode);
    });
    appEmitter.on('game:save', (data) => {
      gameStorage.updateCurrentSave(data);
    });
    appEmitter.on('game:continue', (options) => {
      this.showScreen('game', options);
    });
  }

  showScreen(screen, options = null) {
    if (this.currentScreen === screen && !options) return;

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

      const game = new Game(options);
      game.render();
      document.body.append(game.node);
    }
    this.currentScreen = screen;
  }
}

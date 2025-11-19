import { appEmitter, emitter } from './utils/emmiter';
import gameStorage from './utils/gameStorage';

import Menu from './components/screens/Menu/Menu';
import Game from './components/screens/Game/Game';
import AudioManager from './utils/AudioManager';

export default class App {
  constructor() {
    this.currentScreen = null;
    const body = document.body;
    new AudioManager();

    const theme = gameStorage.getSetting('theme') ?? 'light';
    body.classList.add(theme);

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
    // appEmitter.on('game:end', (options) => {
    //   gameStorage.pushLastResult(options);
    // });
    appEmitter.on('settings:ui-volume-change', (value) => {
      gameStorage.setSetting('uiVolume', value);
    });
    appEmitter.on('settings:music-volume-change', (value) => {
      gameStorage.setSetting('musicVolume', value);
    });
    appEmitter.on('settings:theme-change', ({ theme, themeValues }) => {
      themeValues.forEach((value) => {
        body.classList.remove(value);
      });
      body.classList.add(theme);
    });
  }

  showScreen(screen, options = null) {
    if (this.currentScreen) {
      document.querySelector('.container').remove();
      document.querySelectorAll('.popup--overlay').forEach((el) => el.remove());
      const github = document.querySelector('.github__link');
      if (github) github.remove();
    }

    if (screen === 'menu') {
      emitter.clear();

      appEmitter.emit('music:stop', '');
      const menu = new Menu();
      menu.render();
      document.body.append(menu.node);
    }

    if (screen === 'game') {
      emitter.clear();

      appEmitter.emit('music:play', '');
      const game = new Game(options);
      game.render();
      document.body.append(game.node);
    }
    this.currentScreen = screen;
  }
}

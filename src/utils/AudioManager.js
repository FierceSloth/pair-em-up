import { appEmitter } from './emmiter';
import gameStorage from './gameStorage';

class AudioCls {
  constructor({ src, type = 'ui' }) {
    this.src = src;
    this.type = type;
    this.audio = new Audio(src);
    const volume = gameStorage.getSetting(type + 'Volume') ?? 50;
    this.audio.volume = volume * 0.01;

    appEmitter.on('settings:' + type + '-volume-change', (v) => {
      this.audio.volume = v * 0.01;
    });
    if (type === 'music') {
      this.audio.loop = true;
    }
  }

  play() {
    if (this.type === 'ui') {
      this.audio.currentTime = 0;
    }
    this.audio.volume = gameStorage.getSetting(this.type + 'Volume') * 0.01;
    this.audio.play().catch((e) => console.error(e));
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(v) {
    this.audio.volume = v;
  }
}

export default class AudioManager {
  constructor() {
    const btnClick = new AudioCls({ src: './sounds/btn-click.wav', type: 'ui' });
    const cellSelect = new AudioCls({ src: './sounds/cell-click.wav', type: 'ui' });
    const cellsError = new AudioCls({ src: './sounds/cells-error.wav', type: 'ui' });
    const cellsMatch = new AudioCls({ src: './sounds/cells-match.wav', type: 'ui' });
    const toolsClick = new AudioCls({ src: './sounds/tools-click.wav', type: 'ui' });
    const toolHinits = new AudioCls({ src: './sounds/tool-hinits.wav', type: 'ui' });
    const gameWin = new AudioCls({ src: './sounds/game-win.wav', type: 'ui' });
    const gameLose = new AudioCls({ src: './sounds/game-lose.mp3', type: 'ui' });

    const music = new AudioCls({ src: './sounds/music.wav', type: 'music' });

    appEmitter.on('music:play', () => {
      music.play();
    });
    appEmitter.on('music:stop', () => {
      music.stop();
    });
    appEmitter.on('ui:btnClick', () => {
      btnClick.play();
    });
    appEmitter.on('ui:cellSelect', () => {
      cellSelect.play();
    });
    appEmitter.on('ui:cellsError', () => {
      cellsError.play();
    });
    appEmitter.on('ui:cellsMatch', () => {
      cellsMatch.play();
    });
    appEmitter.on('ui:toolsClick', () => {
      toolsClick.play();
    });
    appEmitter.on('ui:toolHinits', () => {
      toolHinits.play();
    });
    appEmitter.on('ui:gameWin', () => {
      gameWin.play();
    });
    appEmitter.on('ui:gameLose', () => {
      gameLose.play();
    });
  }
}

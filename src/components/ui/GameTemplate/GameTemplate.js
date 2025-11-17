import Component from '../../../utils/Component';
import { appEmitter } from '../../../utils/emmiter';
import gameStorage from '../../../utils/gameStorage';
import { shuffleArr, getRandomInt } from '../../../utils/random';

import Button from '../Button/Button';
import Grid from './Grid';
import ScoreManager from './ScoreManager';
import ToolsManager from '../../ui/GameTemplate/ToolsManager';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
const RANDOM_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9]];

export default class GameTemplate extends Component {
  constructor(options = null) {
    super({
      className: 'game__template',
    });

    const scoreContainer = new ScoreManager();
    this.append(scoreContainer);

    //* =========== Grid =============

    this.mode = gameStorage.getSetting('mode');
    if (options) {
      this.mode = 'saved';
    }

    const grid = new Grid(options);
    this.append(grid);
    switch (this.mode) {
      case 'classic': {
        grid.createGrid(CLASSIC_GRID);
        break;
      }
      case 'random': {
        const randomGrid = [...RANDOM_GRID];
        shuffleArr(randomGrid);
        grid.createGrid(randomGrid.flat(Infinity));
        break;
      }
      case 'chaotic': {
        const chaoticGrid = Array.from({ length: 27 }, () => getRandomInt(1, 9));
        grid.createGrid(chaoticGrid);
        break;
      }
      case 'saved': {
        grid.createGrid(options.copyCells);
        break;
      }
      default: {
        grid.createGrid(CLASSIC_GRID);
      }
    }

    //* =========== Game Panel =============

    const savedGame = gameStorage.getCurrentSave();
    const settingsBtn = new Button({
      btnText: '⚙️',
      ourClass: ['game__control-btn', 'settings-btn'],
      // onClick: () => emitter.emit('game:settings', ''),
    });
    const resetBtn = new Button({
      btnText: 'Reset',
      ourClass: ['game__control-btn'],
      onClick: () => appEmitter.emit('showScreen', 'game'),
    });
    const saveBtn = new Button({
      btnText: 'Save',
      ourClass: ['game__control-btn'],
      onClick: (event) => {
        const node = event.currentTarget;
        node.textContent = '✅';
        setTimeout(() => {
          node.textContent = 'Save';
        }, 800);
        appEmitter.emit('game:save', grid.getGameState());
      },
    });
    const gameControls = new Component(
      {
        className: 'game__controls',
      },
      settingsBtn,
      resetBtn,
      saveBtn
    );
    if (savedGame) {
      const continueBtn = new Button({
        btnText: 'Continue',
        ourClass: ['game__control-btn'],
        onClick: () => appEmitter.emit('game:continue', savedGame),
      });
      gameControls.append(continueBtn);
    }
    const tools = new ToolsManager();

    const optionsPanel = new Component(
      {
        className: 'game__options',
      },
      gameControls,
      tools
    );
    this.append(optionsPanel);
  }
}

import Component from '../../../utils/Component';
import gameStorage from '../../../utils/gameStorage';
import { shuffleArr, getRandomInt } from '../../../utils/random';

import Grid from './Grid';
import ScoreManager from './ScoreManager';
import ToolsManager from '../../ui/GameTemplate/ToolsManager';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
const RANDOM_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9]];

export default class GameTemplate extends Component {
  constructor() {
    super({
      className: 'game__template',
    });

    const scoreContainer = new ScoreManager();
    this.append(scoreContainer);

    //* =========== Grid =============

    this.mode = gameStorage.getSetting('mode');

    const grid = new Grid();
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
      default: {
        grid.createGrid(CLASSIC_GRID);
      }
    }

    //* =========== Game Panel =============

    const tools = new ToolsManager();
    const optionsPanel = new Component(
      {
        className: 'game__options',
      },
      tools
    );
    this.append(optionsPanel);
  }
}

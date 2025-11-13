import Component from '../../../utils/Component';
import Grid from './Grid';
import ScoreManager from './ScoreManager';
import ToolsManager from '../../ui/GameTemplate/ToolsManager';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];

export default class GameTemplate extends Component {
  constructor() {
    super({
      className: 'game__template',
    });

    const score = new ScoreManager();
    this.append(score);

    //* =========== Grid =============

    const grid = new Grid();
    this.append(grid);
    grid.createGrid(CLASSIC_GRID);

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

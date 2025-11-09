import Component from '../../../utils/Component';
import Grid from './Grid';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];

export default class GameTemplate extends Component {
  constructor() {
    super({
      className: 'game__template',
    });

    const grid = new Grid();
    this.append(grid);
    grid.createGrid(CLASSIC_GRID);
  }
}

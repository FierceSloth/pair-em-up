import Component from '../../../utils/Component';
import Grid from './Grid';

export default class GameTemplate extends Component {
  constructor() {
    super({
      className: 'game__template',
    });

    const grid = new Grid();
    this.append(grid);
    grid.createBasicGrid();
  }
}

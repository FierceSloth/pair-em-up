import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';
import getRandomInt from '../../../utils/random';
import Cell from './Cell';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];

export default class Grid extends Component {
  constructor() {
    super({
      className: 'game__grid',
    });

    this.columns = 9;
    this.mode = 'classic';
    this.cells = [];
    this.score = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isSelected = false;
    this.history = [];

    emitter.on('modeSwitch', (mode) => {
      this.mode = mode;
    });
  }

  createBasicGrid() {
    this.cells = CLASSIC_GRID.map((value, index) => {
      const cell = new Cell({value: value, index: index});
      this.append(cell);
      return cell;
    });
  }
}

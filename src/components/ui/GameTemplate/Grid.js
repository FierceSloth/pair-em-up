import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';
import Cell from './Cell';

const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
// const CLASSIC_GRID = Array(46 ).fill(1)

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
    this.history = [];

    emitter.on('modeSwitch', (mode) => {
      this.mode = mode;
    });
    emitter.on('cellClick', (cell) => {
      this.selectCard(cell);
    });
  }

  selectCard(cell) {
    if (this.firstCard === cell || this.secondCard === cell || cell.isDeleted) {
      return;
    }

    if (!this.firstCard) {
      this.firstCard = cell;
      cell.addClass('cell--active');
      return;
    }

    if (!this.secondCard) {
      this.secondCard = cell;
      cell.addClass('cell--active');

      this.checkMatch(this.firstCard, this.secondCard);
      return;
    }
  }

  checkMatch(first, second) {
    const coordResult = this.checkCoordMatch(first, second);
    const valueResult = this.checkValueMatch(first, second);

    if (coordResult && valueResult) {
      first.deleteCell();
      second.deleteCell();

      this.resetActiveCards();

      return true;
    }

    this.triggerAnimation(this.firstCard, 'cell--error');
    this.triggerAnimation(this.secondCard, 'cell--error');

    this.resetActiveCards();
    return false;
  }

  checkCoordMatch(first, second) {
    const [x1, y1] = [first.xPos, first.yPos];
    const [x2, y2] = [second.xPos, second.yPos];
    let result = true;

    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1) {
      console.log('simple exit');
      return true;
    }

    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      for (let y = minY + 1; y < maxY; y += 1) {
        let cell = this.getCellByPos(x1, y);
        if (cell.value) {
          console.log('position incorrect');
          result = false;
          break;
        }
        console.log('position correct');
      }
    } else {
      const firstIndex = this.cells.indexOf(first);
      const secondIndex = this.cells.indexOf(second);
      const smaller = Math.min(firstIndex, secondIndex);
      const larger = Math.max(firstIndex, secondIndex);

      for (let i = smaller + 1; i < larger; i += 1) {
        let cell = this.cells[i];
        if (cell.value) {
          console.log('position incorrect');
          result = false;
          break;
        }
        console.log('position correct');
      }
    }

    return result;
  }

  checkValueMatch(first, second) {
    if (first.value === 5 && second.value === 5) {
      this.score += 3;
      console.log('value correct +3');
      return true;
    }

    if (first.value === second.value) {
      this.score += 1;
      console.log('value correct +1');
      return true;
    }

    if (first.value + second.value === 10) {
      this.score += 2;
      console.log('value correct +2');
      return true;
    }

    console.log('value incorrect');
    return false;
  }

  triggerAnimation(el, cls) {
    el.addClass(cls);
    el.addListener(
      'animationend',
      () => {
        el.removeClass(cls);
      },
      { once: true }
    );
  }

  resetActiveCards() {
    if (this.firstCard) this.firstCard.removeClass('cell--active');
    if (this.secondCard) this.secondCard.removeClass('cell--active');

    this.secondCard = null;
    this.firstCard = null;
  }

  getCellByPos(x, y) {
    const index = (y - 1) * 9 + x;
    return this.cells[index - 1];
  }

  createBasicGrid() {
    this.cells = CLASSIC_GRID.map((value, index) => {
      const cell = new Cell({ value: value, index: index });
      this.append(cell);
      return cell;
    });
  }
}
